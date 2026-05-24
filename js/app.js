// app.js

const TABS = [
  { id: "values", label: "values" },
  { id: "variables", label: "vars" },
  { id: "math", label: "math" },
  { id: "logic", label: "logic" },
  { id: "control", label: "flow" },
  { id: "functions", label: "fns" },
  { id: "strings", label: "str" },
  { id: "arrays", label: "arr" },
  { id: "objects", label: "obj" },
  { id: "convert", label: "conv" },
  { id: "async", label: "async" },
  { id: "dom", label: "dom" },
  { id: "date", label: "date" },
  { id: "output", label: "out" },
  { id: "assets", label: "assets" },
  { id: "html", label: "html" },
  { id: "css", label: "css" },
  { id: "regex", label: "regex" },
  { id: "events", label: "events" },
  { id: "canvas", label: "canvas" },
];

let nodes = {};
let conns = {};
let nid = 1;
let pan = { x: 60, y: 60 };
let zoom = 1;
let dragNode = null,
  dragStart = null,
  dragNodeOrigin = null;
let dragMultiOrigins = null;
let panning = false,
  panStart = null,
  panOrigin = null;
let pending = null;
let selected = null;
let db = null;
const ASSET_EXTS = [
  "mp3",
  "mp4",
  "txt",
  "png",
  "jpg",
  "jpeg",
  "wav",
  "flac",
  "aac",
  "avi",
  "mov",
  "gif",
];
const ASSET_KINDS = {
  mp3: "audio",
  mp4: "video",
  wav: "audio",
  flac: "audio",
  aac: "audio",
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  avi: "video",
  mov: "video",
  txt: "text",
};
let assetCache = {};

function mkAssetId() {
  return "a" + Date.now() + Math.random().toString(36).slice(2, 6);
}

function dbAssetPut(a) {
  return new Promise((res) => {
    const tx = db.transaction("assets", "readwrite");
    tx.objectStore("assets").put(a);
    tx.oncomplete = res;
  });
}
function dbAssetAll() {
  return new Promise((res) => {
    const req = db
      .transaction("assets", "readonly")
      .objectStore("assets")
      .getAll();
    req.onsuccess = (e) => res(e.target.result || []);
  });
}
function dbAssetDel(id) {
  return new Promise((res) => {
    const tx = db.transaction("assets", "readwrite");
    tx.objectStore("assets").delete(id);
    tx.oncomplete = res;
  });
}
async function loadAssetCache() {
  const all = await dbAssetAll();
  assetCache = {};
  all.forEach((a) => {
    assetCache[a.id] = a;
  });
}
async function uploadAssetFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  if (!ASSET_EXTS.includes(ext)) {
    toast("blocked: ." + ext);
    return null;
  }
  const data = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  const a = {
    id: mkAssetId(),
    name: file.name,
    ext,
    kind: ASSET_KINDS[ext] || "other",
    size: file.size,
    data,
    created: Date.now(),
  };
  await dbAssetPut(a);
  assetCache[a.id] = a;
  return a;
}
function formatBytes(b) {
  if (b < 1024) return b + "b";
  if (b < 1048576) return (b / 1024).toFixed(1) + "kb";
  return (b / 1048576).toFixed(1) + "mb";
}
let history = [],
  future = [],
  multiSel = new Set(),
  clipboard = [];
let searchQ = "",
  searchVisible = false;
let drawWiresScheduled = false;
let frames = {};
let moduleMode = false;
function uid() {
  return "n" + nid++;
}
function cuid() {
  return "c" + nid++;
}

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("on");
  clearTimeout(t._tid);
  t._tid = setTimeout(() => t.classList.remove("on"), 1900);
}

function clientToCanvas(clientX, clientY) {
  const wrap = document.getElementById("canvas-wrap").getBoundingClientRect();
  return {
    x: (clientX - wrap.left - pan.x) / zoom,
    y: (clientY - wrap.top - pan.y) / zoom,
  };
}

function showHint() {
  const h = document.getElementById("hint");
  h.style.opacity = Object.keys(nodes).length === 0 ? "1" : "0";
}

function updateCoords() {
  const ox = Math.round(-pan.x / zoom);
  const oy = Math.round(-pan.y / zoom);
  document.getElementById("coord-x").textContent = ox;
  document.getElementById("coord-y").textContent = oy;
  document.getElementById("coord-z").textContent = Math.round(zoom * 100) + "%";
}

function wrapModule(code) {
  const exports = [];
  code.split("\n").forEach((line) => {
    const m = line.match(
      /^(?:async\s+)?function\s+(\w+)|^(?:const|let|var)\s+(\w+)\s*=/,
    );
    if (m) exports.push(m[1] || m[2]);
  });
  return exports.length
    ? `${code}\n\nexport { ${exports.join(", ")} };`
    : `export default function run() {\n${code
        .split("\n")
        .map((l) => "  " + l)
        .join("\n")}\n}`;
}

document.getElementById("module-btn").addEventListener("click", () => {
  moduleMode = !moduleMode;
  const btn = document.getElementById("module-btn");
  btn.textContent = moduleMode ? "esm: on" : "esm: off";
  btn.style.color = moduleMode ? "var(--accent)" : "";
  btn.style.borderColor = moduleMode ? "var(--accent2)" : "";
});

function applyTransform() {
  document.getElementById("canvas").style.transform =
    `translate(${pan.x}px,${pan.y}px) scale(${zoom})`;
  document.getElementById("grid-bg").style.backgroundPosition =
    `${pan.x}px ${pan.y}px`;
  SETTINGS.gridSize && applyGridStyle();
  updateCoords();
  drawMinimap();
}

function portEl(nid, dir, pid) {
  return document.getElementById(`p-${nid}-${dir}-${pid}`);
}

function portPos(nid, dir, pid) {
  const el = portEl(nid, dir, pid);
  if (!el) return null;
  const canvasEl = document.getElementById("canvas");
  const cr = canvasEl.getBoundingClientRect();
  const pr = el.getBoundingClientRect();
  return {
    x: (pr.left + pr.width / 2 - cr.left) / zoom,
    y: (pr.top + pr.height / 2 - cr.top) / zoom,
  };
}

function bezier(x1, y1, x2, y2) {
  if (SETTINGS.wireStyle === "straight") {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }
  const dx = Math.abs(x2 - x1) * 0.55;
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

function getWireExpr(nodeId, portId, _visiting = new Set()) {
  if (!nodeId || !nodes[nodeId]) return "?";
  const src = nodes[nodeId];
  const def = TYPES[src?.type];
  if (!def) return "?";
  const key = nodeId + ":" + portId;
  if (_visiting.has(key)) return "↺";
  _visiting.add(key);
  let result;
  if (def.ref) {
    result = def.ref(src);
  } else if (def.expr) {
    function ge(nid, pid) {
      const c = Object.values(conns).find((c) => c.tn === nid && c.tp === pid);
      if (!c) return "…";
      return getWireExpr(c.fn, c.fp, _visiting);
    }
    try {
      result = def.gen(src, ge);
    } catch {
      result = "?";
    }
  } else {
    result = src.type;
  }
  _visiting.delete(key);
  return result;
}

function drawWires() {
  if (drawWiresScheduled) return;
  drawWiresScheduled = true;
  requestAnimationFrame(() => {
    drawWiresScheduled = false;
    const svg = document.getElementById("svg-overlay");
    Array.from(svg.querySelectorAll(".wire:not(.temp), .wire-badge")).forEach(
      (e) => e.remove(),
    );
    Object.values(conns).forEach((c) => {
      const fp = portPos(c.fn, "out", c.fp);
      const tp = portPos(c.tn, "in", c.tp);
      if (!fp || !tp) return;
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      path.setAttribute("d", bezier(fp.x, fp.y, tp.x, tp.y));
      path.classList.add("wire");
      if (c.kind === "exec") {
        path.classList.add("exec-wire");
        path.style.stroke = "#aaa";
      } else {
        const col = TYPES[nodes[c.fn]?.type]?.col;
        if (col) path.style.stroke = col;
      }
      path.dataset.cid = c.id;
      path.addEventListener("click", (ev) => {
        ev.stopPropagation();
        removeConn(c.id);
      });
      svg.appendChild(path);

      if (c.kind !== "exec") {
        const col = TYPES[nodes[c.fn]?.type]?.col;
        const mid = { x: (fp.x + tp.x) / 2, y: (fp.y + tp.y) / 2 };
        const badge = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "g",
        );
        badge.classList.add("wire-badge");
        badge.dataset.cid = c.id;
        const rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect",
        );
        rect.setAttribute("rx", "4");
        rect.setAttribute("height", "14");
        rect.setAttribute("fill", "#161616");
        rect.setAttribute("stroke", col || "#303030");
        rect.setAttribute("stroke-width", "1");
        const txt = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        txt.setAttribute("font-family", "DM Mono, monospace");
        txt.setAttribute("font-size", "8");
        txt.setAttribute("fill", "#a89880");
        txt.setAttribute("dominant-baseline", "middle");
        txt.setAttribute("text-anchor", "middle");
        txt.setAttribute("y", String(mid.y));
        try {
          const expr = getWireExpr(c.fn, c.fp);
          txt.textContent =
            expr && expr.length > 18 ? expr.slice(0, 16) + "…" : expr || "";
        } catch {
          txt.textContent = "";
        }
        const tw = Math.max(30, txt.textContent.length * 5.5 + 10);
        rect.setAttribute("width", String(tw));
        rect.setAttribute("x", String(mid.x - tw / 2));
        rect.setAttribute("y", String(mid.y - 7));
        txt.setAttribute("x", String(mid.x));
        badge.appendChild(rect);
        badge.appendChild(txt);
        svg.appendChild(badge);
      }
    });
    refreshPortStates();
    drawMinimap();
  });
}

function refreshPortStates() {
  const livePorts = new Set();
  Object.values(conns).forEach((c) => {
    livePorts.add(`p-${c.fn}-out-${c.fp}`);
    livePorts.add(`p-${c.tn}-in-${c.tp}`);
  });
  document.querySelectorAll(".port.live").forEach((p) => {
    if (!livePorts.has(p.id)) p.classList.remove("live");
  });
  livePorts.forEach((id) => {
    document.getElementById(id)?.classList.add("live");
  });
}

function removeConn(id) {
  delete conns[id];
  drawWires();
}

function addConn(fn, fp, tn, tp, kind = "data") {
  if (fn === tn) return;
  snapshot();
  if (kind === "data") {
    const existing = Object.values(conns).find(
      (c) => c.tn === tn && c.tp === tp && c.kind === "data",
    );
    if (existing) delete conns[existing.id];
  }
  const id = cuid();
  conns[id] = { id, fn, fp, tn, tp, kind };
  drawWires();
}

function clearPending() {
  document
    .querySelectorAll(".port.active")
    .forEach((p) => p.classList.remove("active"));
  document
    .getElementById("svg-overlay")
    .querySelectorAll(".temp")
    .forEach((e) => e.remove());
  pending = null;
}

function spawnNode(type) {
  const cw = document.getElementById("canvas-wrap");
  const rect = cw.getBoundingClientRect();
  const cx = (rect.width / 2 - pan.x) / zoom + (Math.random() - 0.5) * 80;
  const cy = (rect.height / 2 - pan.y) / zoom + (Math.random() - 0.5) * 60;
  makeNode(type, cx, cy);
}

function makeNode(type, x, y) {
  const def = TYPES[type];
  if (!def) return;
  snapshot();
  const id = uid();
  const f = {};
  def.fields.forEach((fld) => (f[fld.id] = fld.def || ""));
  nodes[id] = { id, type, x: snapToGrid(x), y: snapToGrid(y), f };
  renderNode(id);
  drawWires();
  showHint();
  return id;
}

function deleteNode(id) {
  snapshot();
  Object.keys(conns).forEach((cid) => {
    if (conns[cid].fn === id || conns[cid].tn === id) delete conns[cid];
  });
  delete nodes[id];
  document.getElementById("node-" + id)?.remove();
  drawWires();
  showHint();
}

function snapshot() {
  const s = JSON.stringify({ nodes, conns, frames, nid });
  if (history.length && history[history.length - 1] === s) return;
  history.push(s);
  if (history.length > 100) history.shift();
  future = [];
}

function undo() {
  if (!history.length) return toast("nothing to undo");
  future.push(JSON.stringify({ nodes, conns, frames, nid }));
  const s = JSON.parse(history.pop());
  nodes = s.nodes;
  conns = s.conns;
  frames = s.frames || {};
  nid = s.nid;
  document.querySelectorAll(".node").forEach((e) => e.remove());
  document.querySelectorAll(".frame").forEach((e) => e.remove());
  Object.keys(frames).forEach((id) => renderFrame(id));
  Object.keys(nodes).forEach((id) => renderNode(id));
  drawWires();
  showHint();
  toast("undo");
}

function redo() {
  if (!future.length) return toast("nothing to redo");
  history.push(JSON.stringify({ nodes, conns, frames, nid }));
  const s = JSON.parse(future.pop());
  nodes = s.nodes;
  conns = s.conns;
  frames = s.frames || {};
  nid = s.nid;
  document.querySelectorAll(".node").forEach((e) => e.remove());
  document.querySelectorAll(".frame").forEach((e) => e.remove());
  Object.keys(frames).forEach((id) => renderFrame(id));
  Object.keys(nodes).forEach((id) => renderNode(id));
  drawWires();
  showHint();
  toast("redo");
}

function nukeAll() {
  snapshot();
  nodes = {};
  conns = {};
  frames = {};
  document.querySelectorAll(".node").forEach((e) => e.remove());
  document.querySelectorAll(".frame").forEach((e) => e.remove());
  multiSel.clear();
  drawWires();
  showHint();
}

function buildAssetPanel() {
  const existing = document.getElementById("asset-panel");
  if (existing) {
    existing.remove();
    return;
  }
  const panel = document.createElement("div");
  panel.id = "asset-panel";
  panel.style.cssText =
    "position:fixed;top:54px;right:12px;width:320px;max-height:calc(100vh - 110px);background:var(--s1);border:1px solid var(--b2);border-radius:14px;z-index:800;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.7);overflow:hidden;";
  panel.innerHTML = `
    <div style="padding:9px 12px;border-bottom:1px solid var(--b1);display:flex;align-items:center;justify-content:space-between;flex-shrink:0">
      <span style="font-size:11px;font-weight:600;color:var(--cream2)">assets</span>
      <div style="display:flex;gap:5px">
        <button class="btn" id="ap-upload" style="height:24px;font-size:10px">upload +</button>
        <button class="btn" id="ap-close" style="height:24px;width:24px;padding:0">✕</button>
      </div>
    </div>
    <div id="ap-drop" style="margin:8px;border:1.5px dashed var(--b2);border-radius:8px;padding:10px;text-align:center;font-size:9px;color:var(--cream3);flex-shrink:0;transition:120ms">
      drop files · mp3 mp4 wav flac aac png jpg gif txt avi mov
    </div>
    <div id="ap-list" style="overflow-y:auto;flex:1;padding:0 8px 8px;display:flex;flex-direction:column;gap:5px;scrollbar-width:thin;scrollbar-color:var(--b2) transparent"></div>
  `;
  document.body.appendChild(panel);

  const fi = document.createElement("input");
  fi.type = "file";
  fi.multiple = true;
  fi.accept = ASSET_EXTS.map((e) => "." + e).join(",");
  fi.style.display = "none";
  document.body.appendChild(fi);

  panel.querySelector("#ap-close").onclick = () => {
    panel.remove();
    fi.remove();
  };
  panel.querySelector("#ap-upload").onclick = () => fi.click();
  fi.onchange = async () => {
    for (const f of fi.files) await uploadAssetFile(f);
    renderAssetList();
    fi.value = "";
  };

  const drop = panel.querySelector("#ap-drop");
  drop.addEventListener("dragover", (e) => {
    e.preventDefault();
    drop.style.borderColor = "var(--accent)";
    drop.style.background = "rgba(212,184,122,0.05)";
  });
  drop.addEventListener("dragleave", () => {
    drop.style.borderColor = "";
    drop.style.background = "";
  });
  drop.addEventListener("drop", async (e) => {
    e.preventDefault();
    drop.style.borderColor = "";
    drop.style.background = "";
    for (const f of e.dataTransfer.files) await uploadAssetFile(f);
    renderAssetList();
  });

  renderAssetList();
}

async function renderAssetList() {
  const list = document.getElementById("ap-list");
  if (!list) return;
  await loadAssetCache();
  const assets = Object.values(assetCache).sort(
    (a, b) => b.created - a.created,
  );
  list.innerHTML = "";
  if (!assets.length) {
    list.innerHTML = `<div style="text-align:center;color:var(--cream3);font-size:10px;padding:18px">no assets yet</div>`;
    return;
  }
  assets.forEach((a) => {
    const row = document.createElement("div");
    row.style.cssText =
      "background:var(--s2);border:1px solid var(--b1);border-radius:8px;overflow:hidden;";

    const head = document.createElement("div");
    head.style.cssText =
      "display:flex;align-items:center;gap:8px;padding:7px 9px;";

    const thumb = document.createElement("div");
    thumb.style.cssText =
      "width:32px;height:32px;border-radius:5px;background:var(--s3);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;overflow:hidden;";
    if (a.kind === "image") {
      const img = document.createElement("img");
      img.src = a.data;
      img.style.cssText = "width:100%;height:100%;object-fit:cover;";
      thumb.appendChild(img);
    } else {
      thumb.textContent =
        { audio: "🎵", video: "🎬", text: "📄" }[a.kind] || "📎";
    }

    const info = document.createElement("div");
    info.style.cssText = "flex:1;min-width:0;";
    info.innerHTML = `
      <div style="font-size:10px;color:var(--cream);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.name}</div>
      <div style="font-size:9px;color:var(--cream3);font-family:'DM Mono',monospace">${a.kind} · ${formatBytes(a.size)}</div>
    `;

    const btns = document.createElement("div");
    btns.style.cssText = "display:flex;gap:3px;flex-shrink:0;";

    [
      ["view", () => openAssetViewer(a)],
      ["log", () => logAssetToConsole(a)],
      [
        "id",
        () => {
          navigator.clipboard?.writeText(a.id);
          toast("id copied");
        },
      ],
      [
        "✕",
        async () => {
          await dbAssetDel(a.id);
          delete assetCache[a.id];
          renderAssetList();
          toast("deleted");
        },
      ],
    ].forEach(([lbl, fn]) => {
      const b = document.createElement("button");
      b.className = "btn";
      b.textContent = lbl;
      b.style.cssText =
        "height:20px;font-size:9px;padding:0 6px;" +
        (lbl === "✕" ? "color:var(--col-flow);" : "");
      b.onclick = fn;
      btns.appendChild(b);
    });

    head.append(thumb, info, btns);
    row.appendChild(head);
    list.appendChild(row);
  });
}

function logAssetToConsole(a) {
  const output = document.getElementById("run-output");
  const entry = document.createElement("div");
  entry.className = "console-entry log";
  entry.style.cssText =
    "flex-direction:column;gap:6px;padding:8px 14px;align-items:flex-start;";

  const lbl = document.createElement("div");
  lbl.style.cssText =
    "font-size:9px;color:var(--cream3);font-family:'DM Mono',monospace;";
  lbl.textContent = `asset · ${a.kind} · ${a.name} · ${a.id}`;
  entry.appendChild(lbl);

  if (a.kind === "image") {
    const img = document.createElement("img");
    img.src = a.data;
    img.style.cssText =
      "max-width:200px;max-height:140px;border-radius:6px;border:1px solid var(--b1);display:block;cursor:pointer;";
    img.onclick = () => openAssetViewer(a);
    entry.appendChild(img);
  } else if (a.kind === "audio") {
    const aud = document.createElement("audio");
    aud.src = a.data;
    aud.controls = true;
    aud.style.cssText = "width:240px;height:30px;display:block;";
    entry.appendChild(aud);
  } else if (a.kind === "video") {
    const vid = document.createElement("video");
    vid.src = a.data;
    vid.controls = true;
    vid.style.cssText = "max-width:240px;border-radius:6px;display:block;";
    entry.appendChild(vid);
  } else if (a.kind === "text") {
    const pre = document.createElement("pre");
    pre.style.cssText =
      "font-family:'DM Mono',monospace;font-size:10px;color:var(--cream2);white-space:pre-wrap;max-height:100px;overflow-y:auto;background:var(--s3);padding:7px;border-radius:6px;";
    fetch(a.data)
      .then((r) => r.text())
      .then((t) => {
        pre.textContent = t.slice(0, 2000) + (t.length > 2000 ? "\n…" : "");
      });
    entry.appendChild(pre);
  }

  output.appendChild(entry);
  output.scrollTop = output.scrollHeight;
}

function openAssetViewer(a) {
  document.getElementById("asset-viewer-ov")?.remove();
  const ov = document.createElement("div");
  ov.id = "asset-viewer-ov";
  ov.style.cssText =
    "position:fixed;inset:0;background:rgba(0,0,0,0.82);z-index:2000;display:flex;align-items:center;justify-content:center;";

  const box = document.createElement("div");
  box.style.cssText =
    "background:var(--s1);border:1px solid var(--b2);border-radius:14px;padding:14px;max-width:88vw;max-height:88vh;overflow:auto;display:flex;flex-direction:column;gap:10px;min-width:280px;";

  const top = document.createElement("div");
  top.style.cssText = "display:flex;align-items:center;gap:10px;flex-shrink:0;";
  const title = document.createElement("span");
  title.style.cssText =
    "font-size:11px;color:var(--cream2);font-family:'DM Mono',monospace;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
  title.textContent = a.name + " · " + formatBytes(a.size);
  const cls = document.createElement("button");
  cls.className = "btn";
  cls.textContent = "✕";
  cls.style.cssText = "height:24px;padding:0 8px;flex-shrink:0;";
  cls.onclick = () => ov.remove();
  top.append(title, cls);
  box.appendChild(top);

  const content = document.createElement("div");
  if (a.kind === "image") {
    const img = document.createElement("img");
    img.src = a.data;
    img.style.cssText =
      "max-width:min(600px,80vw);max-height:70vh;border-radius:8px;display:block;";
    content.appendChild(img);
  } else if (a.kind === "audio") {
    const aud = document.createElement("audio");
    aud.src = a.data;
    aud.controls = true;
    aud.style.cssText = "width:100%;display:block;";
    content.appendChild(aud);
  } else if (a.kind === "video") {
    const vid = document.createElement("video");
    vid.src = a.data;
    vid.controls = true;
    vid.style.cssText =
      "max-width:min(600px,80vw);max-height:68vh;border-radius:8px;display:block;";
    content.appendChild(vid);
  } else if (a.kind === "text") {
    const pre = document.createElement("pre");
    pre.style.cssText =
      "font-family:'DM Mono',monospace;font-size:11px;color:var(--cream);white-space:pre-wrap;max-height:60vh;overflow-y:auto;line-height:1.6;background:var(--bg);padding:12px;border-radius:8px;border:1px solid var(--b1);min-width:300px;";
    fetch(a.data)
      .then((r) => r.text())
      .then((t) => {
        pre.textContent = t;
      });
    content.appendChild(pre);
  }
  box.appendChild(content);

  const idrow = document.createElement("div");
  idrow.style.cssText =
    "font-family:'DM Mono',monospace;font-size:9px;color:var(--cream3);background:var(--s3);border:1px solid var(--b1);border-radius:6px;padding:5px 9px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-shrink:0;";
  const idspan = document.createElement("span");
  idspan.textContent = "id: " + a.id;
  idspan.style.cssText =
    "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
  const cpb = document.createElement("button");
  cpb.className = "btn";
  cpb.textContent = "copy id";
  cpb.style.cssText = "height:20px;font-size:9px;padding:0 7px;flex-shrink:0;";
  cpb.onclick = () => {
    navigator.clipboard?.writeText(a.id);
    toast("id copied");
  };
  idrow.append(idspan, cpb);
  box.appendChild(idrow);

  ov.appendChild(box);
  ov.onclick = (e) => {
    if (e.target === ov) ov.remove();
  };
  document.body.appendChild(ov);
}

function openHtmlPreview(html) {
  document.getElementById("html-preview-ov")?.remove();
  const ov = document.createElement("div");
  ov.id = "html-preview-ov";
  ov.style.cssText =
    "position:fixed;inset:0;background:rgba(0,0,0,0.82);z-index:2000;display:flex;align-items:center;justify-content:center;";

  const box = document.createElement("div");
  box.style.cssText =
    "background:var(--s1);border:1px solid var(--b2);border-radius:14px;width:82vw;height:82vh;display:flex;flex-direction:column;overflow:hidden;";

  const top = document.createElement("div");
  top.style.cssText =
    "padding:9px 13px;border-bottom:1px solid var(--b1);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;";
  const lbl = document.createElement("span");
  lbl.textContent = "html preview";
  lbl.style.cssText = "font-size:11px;font-weight:600;color:var(--cream2);";
  const cls = document.createElement("button");
  cls.className = "btn";
  cls.textContent = "✕";
  cls.style.cssText = "height:24px;padding:0 8px;";
  cls.onclick = () => ov.remove();
  top.append(lbl, cls);
  box.appendChild(top);

  const iframe = document.createElement("iframe");
  iframe.style.cssText = "flex:1;border:none;background:white;width:100%;";
  iframe.sandbox = "allow-scripts allow-same-origin";
  box.appendChild(iframe);
  ov.appendChild(box);
  ov.onclick = (e) => {
    if (e.target === ov) ov.remove();
  };
  document.body.appendChild(ov);

  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();
}

function renderNode(id) {
  const n = nodes[id];
  const def = TYPES[n.type];
  const wrap = document.createElement("div");
  wrap.className = "node";
  wrap.id = "node-" + id;
  wrap.style.left = n.x + "px";
  wrap.style.top = n.y + "px";

  const head = document.createElement("div");
  head.className = "node-head";
  head.innerHTML = `<div class="nd" style="background:${def.col}"></div><span class="nlabel">${def.label}</span>`;
  const xbtn = document.createElement("button");
  xbtn.className = "nclose";
  xbtn.textContent = "×";
  xbtn.addEventListener("click", (e) => {
    e.stopPropagation();
    deleteNode(id);
  });
  head.appendChild(xbtn);
  wrap.appendChild(head);

  const body = document.createElement("div");
  body.className = "nbody";

  def.fields.forEach((fld) => {
    const fdiv = document.createElement("div");
    fdiv.className = "nfield";
    const lbl = document.createElement("span");
    lbl.className = "nflabel";
    lbl.textContent = fld.label;
    fdiv.appendChild(lbl);
    let inp;
    if (fld.kind === "select") {
      inp = document.createElement("select");
      inp.className = "nfsel";
      fld.opts.forEach((o) => {
        const opt = document.createElement("option");
        opt.value = o;
        opt.textContent = o;
        if (n.f[fld.id] === o) opt.selected = true;
        inp.appendChild(opt);
      });
    } else {
      inp = document.createElement("input");
      inp.className = "nfinput";
      inp.type = fld.kind === "number" ? "number" : "text";
      inp.value = n.f[fld.id] ?? fld.def ?? "";
    }
    inp.addEventListener("input", (e) => {
      n.f[fld.id] = e.target.value;
    });
    inp.addEventListener("change", (e) => {
      n.f[fld.id] = e.target.value;
    });
    if (fld.kind === "number") {
      inp.addEventListener("blur", () => {
        if (inp.value === "" || isNaN(Number(inp.value))) {
          inp.value = fld.def ?? "0";
          n.f[fld.id] = inp.value;
        }
      });
    }
    inp.addEventListener("mousedown", (e) => e.stopPropagation());
    fdiv.appendChild(inp);
    body.appendChild(fdiv);
  });

  const portSec = document.createElement("div");
  portSec.className = "ports-wrap";
  const lcol = document.createElement("div");
  lcol.className = "pcol";
  const rcol = document.createElement("div");
  rcol.className = "pcol right";

  const execIns =
    def.execIns || (def.stmt ? [{ id: "__exec_in", label: "" }] : []);
  execIns.forEach((p) => {
    const row = document.createElement("div");
    row.className = "prow";
    const dot = document.createElement("div");
    dot.className = "port exec-port";
    dot.id = `p-${id}-in-${p.id}`;
    dot.dataset.node = id;
    dot.dataset.port = p.id;
    dot.dataset.dir = "in";
    dot.dataset.kind = "exec";
    const lbl = document.createElement("span");
    lbl.className = "plabel";
    lbl.textContent = p.label || "▶";
    row.appendChild(dot);
    row.appendChild(lbl);
    lcol.appendChild(row);
    dot.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (pending && pending.kind === "exec") {
        addConn(pending.fn, pending.fp, id, p.id, "exec");
        clearPending();
      } else {
        const ex = Object.values(conns).find(
          (c) => c.tn === id && c.tp === p.id && c.kind === "exec",
        );
        if (ex) removeConn(ex.id);
      }
    });
  });

  def.ins.forEach((p) => {
    const row = document.createElement("div");
    row.className = "prow";
    const dot = document.createElement("div");
    dot.className = "port";
    dot.id = `p-${id}-in-${p.id}`;
    dot.dataset.node = id;
    dot.dataset.port = p.id;
    dot.dataset.dir = "in";
    const lbl = document.createElement("span");
    lbl.className = "plabel";
    lbl.textContent = p.label;
    row.appendChild(dot);
    row.appendChild(lbl);
    lcol.appendChild(row);
    dot.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (pending && pending.kind !== "exec") {
        addConn(pending.fn, pending.fp, id, p.id, "data");
        clearPending();
      } else if (!pending) {
        const ex = Object.values(conns).find(
          (c) => c.tn === id && c.tp === p.id && c.kind !== "exec",
        );
        if (ex) removeConn(ex.id);
      }
    });
  });

  portSec.appendChild(lcol);

  const execOuts =
    def.execOuts || (def.stmt ? [{ id: "__exec_out", label: "" }] : []);
  execOuts.forEach((p) => {
    const row = document.createElement("div");
    row.className = "prow right";
    const dot = document.createElement("div");
    dot.className = "port exec-port";
    dot.id = `p-${id}-out-${p.id}`;
    dot.dataset.node = id;
    dot.dataset.port = p.id;
    dot.dataset.dir = "out";
    dot.dataset.kind = "exec";
    const lbl = document.createElement("span");
    lbl.className = "plabel";
    lbl.textContent = p.label || "";
    row.appendChild(dot);
    row.appendChild(lbl);
    rcol.appendChild(row);
    dot.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      e.preventDefault();
      clearPending();
      pending = { fn: id, fp: p.id, kind: "exec" };
      dot.classList.add("active");
    });
  });

  def.outs.forEach((p) => {
    const row = document.createElement("div");
    row.className = "prow right";
    const dot = document.createElement("div");
    dot.className = "port";
    dot.id = `p-${id}-out-${p.id}`;
    dot.dataset.node = id;
    dot.dataset.port = p.id;
    dot.dataset.dir = "out";
    const lbl = document.createElement("span");
    lbl.className = "plabel";
    lbl.textContent = p.label;
    row.appendChild(dot);
    row.appendChild(lbl);
    rcol.appendChild(row);
    dot.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      e.preventDefault();
      clearPending();
      pending = { fn: id, fp: p.id, kind: "data" };
      dot.classList.add("active");
    });
  });

  portSec.appendChild(rcol);
  body.appendChild(portSec);
  wrap.appendChild(body);
  document.getElementById("canvas").appendChild(wrap);

  if (SETTINGS.spawnAnimation) {
    wrap.style.transform = "scale(0.92)";
    wrap.style.opacity = "0";
    wrap.style.transition =
      "transform 0.15s cubic-bezier(0.34,1.56,0.64,1), opacity 0.1s";
    requestAnimationFrame(() => {
      wrap.style.transform = "";
      wrap.style.opacity = "";
      setTimeout(() => {
        wrap.style.transition = "";
      }, 200);
    });
  }

  if (def.postRender) def.postRender(wrap, n);

  head.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    selectNode(id, e.shiftKey);
    if (!e.shiftKey) {
      dragNode = id;
      dragStart = { x: e.clientX, y: e.clientY };
      dragNodeOrigin = { x: n.x, y: n.y };
      if (multiSel.has(id)) {
        dragMultiOrigins = {};
        multiSel.forEach(
          (mid) =>
            (dragMultiOrigins[mid] = { x: nodes[mid].x, y: nodes[mid].y }),
        );
      }
    }
  });
  wrap.addEventListener("mousedown", (e) => selectNode(id, e.shiftKey));
}

function exportGraph() {
  const payload = JSON.stringify({ nodes, conns, frames, nid }, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cupcake-graph.json";
  a.click();
  URL.revokeObjectURL(url);
  toast("graph exported");
}

function importGraph() {
  const inp = document.createElement("input");
  inp.type = "file";
  inp.accept = ".json";
  inp.addEventListener("change", () => {
    const file = inp.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.nodes) throw new Error("invalid graph file");
        snapshot();
        nukeAll();
        nodes = data.nodes || {};
        conns = data.conns || {};
        frames = data.frames || {};
        nid = data.nid || 100;
        Object.keys(frames).forEach((id) => renderFrame(id));
        Object.keys(nodes).forEach((id) => renderNode(id));
        drawWires();
        showHint();
        toast("graph imported");
      } catch {
        toast("invalid file");
      }
    };
    reader.readAsText(file);
  });
  inp.click();
}

function selectNode(id, shift) {
  if (shift) {
    toggleMultiSel(id);
    return;
  }
  selected = id;
  multiSel.clear();
  document.querySelectorAll(".node").forEach((n) => {
    n.classList.remove("sel");
    n.classList.remove("multi-sel");
  });
  document.getElementById("node-" + id)?.classList.add("sel");
}

function toggleMultiSel(id) {
  if (multiSel.has(id)) multiSel.delete(id);
  else multiSel.add(id);
  refreshMultiSel();
}

function refreshMultiSel() {
  document.querySelectorAll(".node").forEach((el) => {
    const id = el.id.replace("node-", "");
    el.classList.toggle("multi-sel", multiSel.has(id));
  });
}

function copySelected() {
  const ids = multiSel.size ? [...multiSel] : selected ? [selected] : [];
  if (!ids.length) return toast("nothing selected");
  clipboard = ids.map((id) => ({
    node: JSON.parse(JSON.stringify(nodes[id])),
    id,
  }));
  const connsCopied = Object.values(conns).filter(
    (c) => ids.includes(c.fn) && ids.includes(c.tn),
  );
  clipboard._conns = connsCopied;
  toast(`copied ${ids.length} node${ids.length > 1 ? "s" : ""}`);
}

function pasteSelected() {
  if (!clipboard.length) return toast("clipboard empty");
  snapshot();
  const idMap = {};
  clipboard.forEach(({ node }, i) => {
    const newId = uid();
    idMap[node.id] = newId;
    nodes[newId] = {
      ...JSON.parse(JSON.stringify(node)),
      id: newId,
      x: node.x + 30,
      y: node.y + 30,
    };
    renderNode(newId);
  });
  (clipboard._conns || []).forEach((c) => {
    const fn = idMap[c.fn],
      tn = idMap[c.tn];
    if (fn && tn) {
      const id = cuid();
      conns[id] = { id, fn, fp: c.fp, tn, tp: c.tp };
    }
  });
  multiSel.clear();
  Object.values(idMap).forEach((id) => multiSel.add(id));
  refreshMultiSel();
  drawWires();
  toast(`pasted ${clipboard.length} node${clipboard.length > 1 ? "s" : ""}`);
}

const canvasWrap = document.getElementById("canvas-wrap");

canvasWrap.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return;
  if (e.shiftKey) return;
  if (
    e.target === canvasWrap ||
    e.target.id === "grid-bg" ||
    e.target.id === "canvas" ||
    e.target.id === "svg-overlay"
  ) {
    if (pending) {
      clearPending();
      return;
    }
    panning = true;
    panStart = { x: e.clientX, y: e.clientY };
    panOrigin = { ...pan };
    canvasWrap.style.cursor = "grabbing";
    selected = null;
    document
      .querySelectorAll(".node")
      .forEach((n) => n.classList.remove("sel"));
  }
});

document.addEventListener("mousemove", (e) => {
  if (drawingFrame && frameDrawStart && framePreview) {
    const pos = clientToCanvas(e.clientX, e.clientY);
    const x = Math.min(pos.x, frameDrawStart.x);
    const y = Math.min(pos.y, frameDrawStart.y);
    const w = Math.abs(pos.x - frameDrawStart.x);
    const h = Math.abs(pos.y - frameDrawStart.y);
    framePreview.style.left = x + "px";
    framePreview.style.top = y + "px";
    framePreview.style.width = w + "px";
    framePreview.style.height = h + "px";
    return;
  }

  if (dragFrame) {
    const f = frames[dragFrame];
    if (!f) return;
    const dx = (e.clientX - dragFrameStart.x) / zoom;
    const dy = (e.clientY - dragFrameStart.y) / zoom;
    f.x = snapToGrid(dragFrameOrigin.x + dx);
    f.y = snapToGrid(dragFrameOrigin.y + dy);
    const el = document.getElementById("frame-" + dragFrame);
    if (el) {
      el.style.left = f.x + "px";
      el.style.top = f.y + "px";
    }
    Object.entries(dragFrameNodeOrigins).forEach(([nid, origin]) => {
      if (!nodes[nid]) return;
      nodes[nid].x = snapToGrid(origin.x + dx);
      nodes[nid].y = snapToGrid(origin.y + dy);
      const nel = document.getElementById("node-" + nid);
      if (nel) {
        nel.style.left = nodes[nid].x + "px";
        nel.style.top = nodes[nid].y + "px";
      }
    });
    drawWires();
    return;
  }

  if (resizeFrame) {
    const f = frames[resizeFrame];
    if (!f) return;
    const dx = (e.clientX - resizeFrameStart.x) / zoom;
    const dy = (e.clientY - resizeFrameStart.y) / zoom;
    f.w = Math.max(120, resizeFrameOrigin.w + dx);
    f.h = Math.max(80, resizeFrameOrigin.h + dy);
    const el = document.getElementById("frame-" + resizeFrame);
    if (el) {
      el.style.width = f.w + "px";
      el.style.height = f.h + "px";
    }
    return;
  }

  if (dragNode) {
    const n = nodes[dragNode];
    if (!n) return;
    const dx = (e.clientX - dragStart.x) / zoom;
    const dy = (e.clientY - dragStart.y) / zoom;
    if (multiSel.has(dragNode) && dragMultiOrigins) {
      multiSel.forEach((mid) => {
        if (!nodes[mid] || !dragMultiOrigins[mid]) return;
        nodes[mid].x = snapToGrid(dragMultiOrigins[mid].x + dx);
        nodes[mid].y = snapToGrid(dragMultiOrigins[mid].y + dy);
        const el = document.getElementById("node-" + mid);
        if (el) {
          el.style.left = nodes[mid].x + "px";
          el.style.top = nodes[mid].y + "px";
        }
      });
    } else {
      n.x = snapToGrid(dragNodeOrigin.x + dx);
      n.y = snapToGrid(dragNodeOrigin.y + dy);
      const el = document.getElementById("node-" + dragNode);
      if (el) {
        el.style.left = n.x + "px";
        el.style.top = n.y + "px";
      }
    }
    drawWires();
    return;
  }

  if (panning && panStart) {
    pan.x = panOrigin.x + e.clientX - panStart.x;
    pan.y = panOrigin.y + e.clientY - panStart.y;
    applyTransform();
    return;
  }

  if (pending) {
    const svg = document.getElementById("svg-overlay");
    svg.querySelectorAll(".temp").forEach((e) => e.remove());
    const fp = portPos(pending.fn, "out", pending.fp);
    if (!fp) return;
    const canvasEl = document.getElementById("canvas");
    const cr = canvasEl.getBoundingClientRect();
    const mx = (e.clientX - cr.left) / zoom;
    const my = (e.clientY - cr.top) / zoom;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", bezier(fp.x, fp.y, mx, my));
    path.classList.add("wire", "temp");
    svg.appendChild(path);
  }
});

document.addEventListener("mouseup", (e) => {
  if (drawingFrame && frameDrawStart && framePreview) {
    const pos = clientToCanvas(e.clientX, e.clientY);
    const x = Math.min(pos.x, frameDrawStart.x);
    const y = Math.min(pos.y, frameDrawStart.y);
    const w = Math.abs(pos.x - frameDrawStart.x);
    const h = Math.abs(pos.y - frameDrawStart.y);
    framePreview.remove();
    framePreview = null;
    drawingFrame = false;
    frameDrawStart = null;
    if (w > 40 && h > 30) makeFrame(x, y, w, h);
    return;
  }
  dragFrame = null;
  dragFrameNodeOrigins = null;
  resizeFrame = null;
  dragNode = null;
  dragMultiOrigins = null;
  if (panning) {
    panning = false;
    canvasWrap.style.cursor = "default";
  }
});

canvasWrap.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const rect = canvasWrap.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.1 : 0.909;
    const nz = Math.max(0.2, Math.min(3, zoom * factor));
    pan.x = mx - (mx - pan.x) * (nz / zoom);
    pan.y = my - (my - pan.y) * (nz / zoom);
    zoom = nz;
    applyTransform();
    drawWires();
  },
  { passive: false },
);

document.addEventListener("keydown", (e) => {
  const tag = e.target.tagName;
  const typing = ["INPUT", "SELECT", "TEXTAREA"].includes(tag);
  if (e.key === "Escape") {
    clearPending();
    hideSearch();
    hideFind();
  }
  if (!typing && (e.key === "Delete" || e.key === "Backspace")) {
    if (multiSel.size) {
      snapshot();
      [...multiSel].forEach((id) => {
        Object.keys(conns).forEach((cid) => {
          if (conns[cid].fn === id || conns[cid].tn === id) delete conns[cid];
        });
        delete nodes[id];
        document.getElementById("node-" + id)?.remove();
      });
      multiSel.clear();
      drawWires();
      showHint();
    } else if (selected) {
      deleteNode(selected);
      selected = null;
    }
  }
  if ((e.metaKey || e.ctrlKey) && !typing) {
    if (e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      undo();
    }
    if (e.key === "z" && e.shiftKey) {
      e.preventDefault();
      redo();
    }
    if (e.key === "y") {
      e.preventDefault();
      redo();
    }
    if (e.key === "c") {
      e.preventDefault();
      copySelected();
    }
    if (e.key === "v") {
      e.preventDefault();
      pasteSelected();
    }
    if (e.key === "a") {
      e.preventDefault();
      multiSel.clear();
      Object.keys(nodes).forEach((id) => multiSel.add(id));
      refreshMultiSel();
    }
    if (e.key === "f") {
      e.preventDefault();
      toggleFind();
    }
    if (e.key === "b") {
      e.preventDefault();
      toggleSearch();
    }
    if (e.key === "?") toggleShortcuts();
  }
});

function zoomBy(factor) {
  const cw = document.getElementById("canvas-wrap");
  const rect = cw.getBoundingClientRect();
  const mx = rect.width / 2;
  const my = rect.height / 2;
  const nz = Math.max(0.2, Math.min(3, zoom * factor));
  pan.x = mx - (mx - pan.x) * (nz / zoom);
  pan.y = my - (my - pan.y) * (nz / zoom);
  zoom = nz;
  applyTransform();
  drawWires();
}

document
  .getElementById("zoom-in-btn")
  .addEventListener("click", () => zoomBy(1.2));
document
  .getElementById("zoom-out-btn")
  .addEventListener("click", () => zoomBy(1 / 1.2));
document.getElementById("home-btn").addEventListener("click", () => {
  pan = { x: 60, y: 60 };
  zoom = 1;
  applyTransform();
  drawWires();
  toast("back to origin");
});

function compileCode() {
  const visiting = new Set();

  function getExpr(nodeId, portId) {
    const c = Object.values(conns).find(
      (c) => c.tn === nodeId && c.tp === portId && c.kind !== "exec"
    );
    if (!c) return "/* unconnected */";
    const src = nodes[c.fn];
    const def = TYPES[src?.type];
    if (!def) return "/* error */";
    const key = c.fn + ":" + c.fp;
    if (visiting.has(key)) return "/* cycle */";
    visiting.add(key);
    let result;
    if (def.ref) result = def.ref(src, c.fp);
    else if (def.expr) result = def.gen(src, getExpr);
    else result = "/* non-expr */";
    visiting.delete(key);
    return result;
  }

  function compileNode(node) {
    const def = TYPES[node.type];
    if (!def) return "";
    if (node.type === "exec_if") {
      const cond = getExpr(node.id, "cond");
      const thenConn = Object.values(conns).find(
        (c) => c.fn === node.id && c.fp === "then" && c.kind === "exec"
      );
      const elseConn = Object.values(conns).find(
        (c) => c.fn === node.id && c.fp === "else" && c.kind === "exec"
      );
      const thenCode = thenConn ? compileChain(nodes[thenConn.tn]) : "";
      const elseCode = elseConn ? compileChain(nodes[elseConn.tn]) : "";
      return `if (${cond}) {\n${thenCode}\n}${elseCode ? ` else {\n${elseCode}\n}` : ""}`;
    }
    if (def.stmt) return def.gen(node, getExpr);
    if (def.expr) return def.gen(node, getExpr) + ";";
    return "";
  }

  function compileChain(startNode) {
    if (!startNode) return "";
    const lines = [];
    const visited = new Set();
    let current = startNode;
    while (current) {
      if (visited.has(current.id)) break;
      visited.add(current.id);
      const code = compileNode(current);
      if (code) lines.push(code);
      const next = Object.values(conns).find(
        (c) => c.fn === current.id && c.fp === "__exec_out" && c.kind === "exec"
      );
      current = next ? nodes[next.tn] : null;
    }
    return lines.join("\n");
  }

  const globalLines = Object.values(nodes)
    .filter(n => TYPES[n.type]?.isGlobal)
    .map(n => `${n.f.kind || "let"} ${n.f.name || "myVar"} = ${n.f.init ?? "0"};`);

  const eventNodes = Object.values(nodes).filter(n => TYPES[n.type]?.isEvent);

  const eventLines = eventNodes.map(n => {
    const def = TYPES[n.type];
    if (!def?.compileEvent) return "";
    const firstConn = Object.values(conns).find(
      c => c.fn === n.id && c.fp === "__exec_out" && c.kind === "exec"
    );
    const body = firstConn ? compileChain(nodes[firstConn.tn]) : "";
    return def.compileEvent(n, getExpr, body);
  }).filter(Boolean);

  if (eventNodes.length || globalLines.length) {
    const parts = [...globalLines];
    if (globalLines.length && eventLines.length) parts.push("");
    parts.push(...eventLines);
    return parts.join("\n").trim() || "// nothing connected";
  }

  const entryNode = Object.values(nodes).find(n => n.type === "entry");
  if (entryNode) {
    const firstConn = Object.values(conns).find(
      c => c.fn === entryNode.id && c.fp === "out" && c.kind === "exec"
    );
    if (firstConn && nodes[firstConn.tn]) {
      return compileChain(nodes[firstConn.tn]) || "// nothing connected to start";
    }
    return "// connect ▶ start to something";
  }

  const sorted = topoSort(nodes, conns);
  const lines = [];
  sorted.forEach(n => {
    const def = TYPES[n.type];
    if (!def) return;
    if (def.stmt) lines.push(def.gen(n, getExpr));
    else if (def.expr) {
      const hasOutConn = Object.values(conns).some(c => c.fn === n.id && c.kind !== "exec");
      if (!hasOutConn) lines.push(def.gen(n, getExpr) + ";");
    }
  });
  return lines.length ? lines.join("\n") : "// nothing to compile yet";
}

function closeAllDD() {
  document
    .querySelectorAll(".dd-menu")
    .forEach((m) => m.classList.remove("open"));
}

function topoSort(nodeMap, connMap) {
  const ids = Object.keys(nodeMap);
  const inDegree = {};
  const adj = {};
  ids.forEach((id) => {
    inDegree[id] = 0;
    adj[id] = [];
  });
  Object.values(connMap).forEach((c) => {
    if (c.kind === "exec") return;
    if (!nodeMap[c.fn] || !nodeMap[c.tn]) return;
    if (!adj[c.fn].includes(c.tn)) {
      adj[c.fn].push(c.tn);
      inDegree[c.tn]++;
    }
  });
  const queue = ids.filter((id) => inDegree[id] === 0);
  const result = [];
  while (queue.length) {
    const id = queue.shift();
    result.push(id);
    adj[id].forEach((next) => {
      inDegree[next]--;
      if (inDegree[next] === 0) queue.push(next);
    });
  }
  const resultSet = new Set(result);
  ids.forEach((id) => {
    if (!resultSet.has(id)) result.push(id);
  });
  return result.map((id) => nodeMap[id]);
}

function toggleDD(id) {
  const menu = document.getElementById(id);
  const wasOpen = menu.classList.contains("open");
  closeAllDD();
  if (!wasOpen) menu.classList.add("open");
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".dd")) closeAllDD();
});

document.getElementById("search-btn").addEventListener("click", toggleSearch);

let activeTab = TABS[0].id;

function buildSidebar() {
  const tabBar = document.getElementById("sidebar-tabs");
  const panesContainer = document.getElementById("sidebar-panes");

  TABS.forEach((tab) => {
    const t = document.createElement("div");
    t.className = "stab" + (tab.id === activeTab ? " active" : "");
    t.textContent = tab.label;
    t.dataset.tab = tab.id;
    t.addEventListener("click", () => switchTab(tab.id));
    tabBar.appendChild(t);

    const pane = document.createElement("div");
    pane.className = "tab-pane" + (tab.id === activeTab ? " active" : "");
    pane.id = "pane-" + tab.id;

    const entries = Object.entries(TYPES).filter(
      ([, def]) => def.cat === tab.id,
    );
    entries.forEach(([type, def]) => {
      const item = document.createElement("div");
      item.className = "palette-item";
      item.innerHTML = `<div class="palette-dot" style="background:${def.col}"></div>${def.label}`;
      item.addEventListener("click", () => spawnNode(type));
      pane.appendChild(item);
    });

    panesContainer.appendChild(pane);
  });
}

function toggleSearch() {
  searchVisible = !searchVisible;
  const bar = document.getElementById("search-bar");
  if (searchVisible) {
    bar.classList.add("open");
    document.getElementById("search-input").focus();
  } else hideSearch();
}

function hideSearch() {
  searchVisible = false;
  document.getElementById("search-bar").classList.remove("open");
  document.getElementById("search-results").innerHTML = "";
}

document.getElementById("search-input").addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase();
  const res = document.getElementById("search-results");
  res.innerHTML = "";
  if (!q) return;
  const matches = Object.entries(TYPES)
    .filter(([, d]) => d.label.includes(q) || d.cat.includes(q))
    .slice(0, 10);
  matches.forEach(([type, def]) => {
    const row = document.createElement("div");
    row.className = "search-row";
    row.innerHTML = `<span class="search-dot" style="background:${def.col}"></span><span class="search-label">${def.label}</span><span class="search-cat">${def.cat}</span>`;
    row.addEventListener("click", () => {
      spawnNode(type);
      hideSearch();
    });
    res.appendChild(row);
  });
});

document.getElementById("search-input").addEventListener("keydown", (e) => {
  if (e.key === "Escape") hideSearch();
  if (e.key === "Enter") {
    const first = document.querySelector(".search-row");
    if (first) first.click();
  }
});

function switchTab(tabId) {
  activeTab = tabId;
  document
    .querySelectorAll(".stab")
    .forEach((t) => t.classList.toggle("active", t.dataset.tab === tabId));
  document
    .querySelectorAll(".tab-pane")
    .forEach((p) => p.classList.toggle("active", p.id === "pane-" + tabId));
}

document
  .getElementById("save-btn")
  .addEventListener("click", () => toggleDD("save-dd-menu"));
document
  .getElementById("load-btn")
  .addEventListener("click", () => toggleDD("load-dd-menu"));
document.getElementById("clear-btn").addEventListener("click", () => {
  nukeAll();
  toast("canvas cleared");
});

async function loadScript(src) {
  return new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = res;
    s.onerror = rej;
    document.head.appendChild(s);
  });
}

async function prettierFormat(code) {
  if (!window.prettier) {
    await loadScript("https://unpkg.com/prettier@3.3.3/standalone.js");
    await loadScript("https://unpkg.com/prettier@3.3.3/plugins/estree.js");
    await loadScript("https://unpkg.com/prettier@3.3.3/plugins/babel.js");
  }
  try {
    return await window.prettier.format(code, {
      parser: "babel",
      plugins: window.prettierPlugins
        ? [window.prettierPlugins.estree, window.prettierPlugins.babel]
        : [],
      semi: true,
      singleQuote: false,
      tabWidth: 2,
      printWidth: 80,
    });
  } catch {
    return code;
  }
}

document.getElementById("compile-btn").addEventListener("click", () => {
  const modal = document.getElementById("compile-modal");
  const body = document.getElementById("modal-body");
  const foot = document.getElementById("modal-foot");
  const title = document.getElementById("modal-title");

  title.textContent = "compiling...";
  body.innerHTML =
    '<div class="compile-loading"><span id="compile-dots">.</span></div>';
  foot.style.display = "none";
  modal.classList.add("open");

  const dots = document.getElementById("compile-dots");
  let d = 0;
  const dotInterval = setInterval(() => {
    d = (d + 1) % 3;
    dots.textContent = ".".repeat(d + 1);
  }, 350);

  const delay = 1000 + Math.random() * 2000;
  setTimeout(async () => {
    clearInterval(dotInterval);
    let code;
    try {
      code = compileCode();
    } catch (err) {
      code = "// compile error: " + err.message;
    }
    if (
      !code.startsWith("// compile error") &&
      !code.startsWith("// nothing")
    ) {
      code = await prettierFormat(code);
    }
    title.textContent = "compiled output";
    body.innerHTML = "";
    const cb = document.createElement("div");
    cb.className = "codebox";
    cb.id = "codebox";
    cb.textContent = moduleMode ? wrapModule(code) : code;
    body.appendChild(cb);
    foot.style.display = "flex";
  }, delay);
});

document
  .getElementById("modal-close")
  .addEventListener("click", () =>
    document.getElementById("compile-modal").classList.remove("open"),
  );
document
  .getElementById("done-btn")
  .addEventListener("click", () =>
    document.getElementById("compile-modal").classList.remove("open"),
  );
document.getElementById("copy-btn").addEventListener("click", () => {
  const cb = document.getElementById("modal-body").querySelector(".codebox");
  if (!cb) return;
  const text = cb.textContent;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => toast("copied!"))
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
});

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand("copy");
    toast("copied!");
  } catch (e) {
    toast("copy failed");
  }
  document.body.removeChild(ta);
}

function initDB() {
  return new Promise((res, rej) => {
    const req = indexedDB.open("cupcake_v2", 2);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("slots"))
        db.createObjectStore("slots", { keyPath: "slot" });
      if (!db.objectStoreNames.contains("assets"))
        db.createObjectStore("assets", { keyPath: "id" });
    };
    req.onsuccess = (e) => {
      db = e.target.result;
      res();
    };
    req.onerror = rej;
  });
}

function dbSet(slot, data) {
  return new Promise((res) => {
    const tx = db.transaction("slots", "readwrite");
    tx.objectStore("slots").put({ slot, data });
    tx.oncomplete = res;
  });
}

function dbGet(slot) {
  return new Promise((res) => {
    const req = db
      .transaction("slots", "readonly")
      .objectStore("slots")
      .get(slot);
    req.onsuccess = (e) => res(e.target.result?.data || null);
  });
}

function dbGetMeta(slot) {
  return new Promise((res) => {
    const req = db
      .transaction("slots", "readonly")
      .objectStore("slots")
      .get(slot);
    req.onsuccess = (e) => res(e.target.result || null);
  });
}

function dbSetMeta(slot, data, name) {
  return new Promise((res) => {
    const tx = db.transaction("slots", "readwrite");
    tx.objectStore("slots").put({ slot, data, name });
    tx.oncomplete = res;
  });
}

function dbKeys() {
  return new Promise((res) => {
    const req = db
      .transaction("slots", "readonly")
      .objectStore("slots")
      .getAllKeys();
    req.onsuccess = (e) => res(e.target.result);
  });
}

async function slotHasContent(slot) {
  const raw = await dbGet(slot);
  if (!raw) return false;
  try {
    const data = JSON.parse(raw);
    return (
      Object.keys(data.nodes || {}).length > 0 ||
      Object.keys(data.conns || {}).length > 0
    );
  } catch {
    return false;
  }
}

async function saveSlot(slot) {
  closeAllDD();
  const meta = await dbGetMeta(slot);
  const name = meta?.name || null;
  await dbSetMeta(slot, JSON.stringify({ nodes, conns, frames, nid }), name);
  await refreshIndicators();
  toast(`saved to slot ${slot}`);
}

async function loadSlot(slot) {
  closeAllDD();
  const raw = await dbGet(slot);
  if (!raw) {
    toast(`slot ${slot} is empty`);
    return;
  }
  const data = JSON.parse(raw);
  nukeAll();
  nodes = data.nodes || {};
  conns = data.conns || {};
  frames = data.frames || {};
  nid = data.nid || 100;
  document.querySelectorAll(".frame").forEach((e) => e.remove());
  Object.keys(frames).forEach((id) => renderFrame(id));
  Object.keys(nodes).forEach((id) => renderNode(id));
  drawWires();
  showHint();
  toast(`loaded slot ${slot}`);
}

async function renameSlot(slot, newName) {
  const raw = await dbGet(slot);
  if (!raw) return;
  await dbSetMeta(slot, raw, newName.trim() || null);
  await refreshIndicators();
}

async function refreshIndicators() {
  for (let i = 1; i <= 15; i++) {
    const has = await slotHasContent(i);
    const meta = await dbGetMeta(i);
    const name = meta?.name || null;
    const label = name ? name : `slot ${i}`;
    const saveRow = document.getElementById(`save-s${i}`);
    const loadRow = document.getElementById(`load-s${i}`);
    if (saveRow) {
      saveRow.classList.toggle("filled", has);
      const span = saveRow.querySelector(".dd-slot-label");
      if (span) span.textContent = label;
    }
    if (loadRow) {
      loadRow.classList.toggle("filled", has);
      const span = loadRow.querySelector(".dd-slot-label");
      if (span) span.textContent = label;
    }
  }
}

function buildSaveLoad() {
  const saveMenu = document.getElementById("save-dd-menu");
  const loadMenu = document.getElementById("load-dd-menu");

  for (let i = 1; i <= 15; i++) {
    const sr = document.createElement("div");
    sr.className = "dd-row";
    sr.id = `save-s${i}`;
    const dot = document.createElement("span");
    dot.className = "dd-dot-fill";
    const lbl = document.createElement("span");
    lbl.className = "dd-slot-label";
    lbl.textContent = `slot ${i}`;
    const renameBtn = document.createElement("button");
    renameBtn.className = "dd-rename-btn";
    renameBtn.textContent = "rename";
    renameBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openRenamePopup(i, renameBtn);
    });
    sr.appendChild(dot);
    sr.appendChild(lbl);
    sr.appendChild(renameBtn);
    sr.addEventListener("click", () => saveSlot(i));
    saveMenu.appendChild(sr);

    const lr = document.createElement("div");
    lr.className = "dd-row";
    lr.id = `load-s${i}`;
    const dot2 = document.createElement("span");
    dot2.className = "dd-dot-fill";
    const lbl2 = document.createElement("span");
    lbl2.className = "dd-slot-label";
    lbl2.textContent = `slot ${i}`;
    const renameBtn2 = document.createElement("button");
    renameBtn2.className = "dd-rename-btn";
    renameBtn2.textContent = "rename";
    renameBtn2.addEventListener("click", (e) => {
      e.stopPropagation();
      openRenamePopup(i, renameBtn2);
    });
    lr.appendChild(dot2);
    lr.appendChild(lbl2);
    lr.appendChild(renameBtn2);
    lr.addEventListener("click", () => loadSlot(i));
    loadMenu.appendChild(lr);
  }

  const sep1 = document.createElement("div");
  sep1.style.cssText = "height:1px;background:var(--b1);margin:4px 0;";
  saveMenu.appendChild(sep1);
  const exportRow = document.createElement("div");
  exportRow.className = "dd-row";
  exportRow.textContent = "export json ↓";
  exportRow.addEventListener("click", () => {
    closeAllDD();
    exportGraph();
  });
  saveMenu.appendChild(exportRow);

  const sep2 = document.createElement("div");
  sep2.style.cssText = "height:1px;background:var(--b1);margin:4px 0;";
  loadMenu.appendChild(sep2);
  const importRow = document.createElement("div");
  importRow.className = "dd-row";
  importRow.textContent = "import json ↑";
  importRow.addEventListener("click", () => {
    closeAllDD();
    importGraph();
  });
  loadMenu.appendChild(importRow);
}

function openRenamePopup(slot, anchor) {
  document.querySelectorAll(".rename-popup").forEach((p) => p.remove());

  const popup = document.createElement("div");
  popup.className = "rename-popup";

  const inp = document.createElement("input");
  inp.className = "rename-input";
  inp.placeholder = `slot ${slot}`;
  inp.maxLength = 24;
  inp.addEventListener("mousedown", (e) => e.stopPropagation());
  inp.addEventListener("click", (e) => e.stopPropagation());

  dbGetMeta(slot).then((meta) => {
    inp.value = meta?.name || "";
    inp.focus();
    inp.select();
  });

  const ok = document.createElement("button");
  ok.className = "rename-ok";
  ok.textContent = "ok";
  ok.addEventListener("click", async (e) => {
    e.stopPropagation();
    await renameSlot(slot, inp.value);
    popup.remove();
    toast(`slot ${slot} renamed`);
  });

  inp.addEventListener("keydown", async (e) => {
    e.stopPropagation();
    if (e.key === "Enter") ok.click();
    if (e.key === "Escape") popup.remove();
  });

  popup.appendChild(inp);
  popup.appendChild(ok);

  const rect = anchor.getBoundingClientRect();
  popup.style.top = rect.bottom + 4 + "px";
  popup.style.left = rect.left + "px";
  document.body.appendChild(popup);

  setTimeout(() => {
    document.addEventListener(
      "click",
      function handler() {
        popup.remove();
        document.removeEventListener("click", handler);
      },
      { once: true },
    );
  }, 0);
}

const SETTINGS_DEFAULTS = {
  accentColor: "#d4b87a",
  accent2Color: "#8a7040",
  bgColor: "#090909",
  s1Color: "#101010",
  s2Color: "#161616",
  s3Color: "#1e1e1e",
  b1Color: "#252525",
  b2Color: "#303030",
  creamColor: "#ede3d2",
  cream2Color: "#a89880",
  cream3Color: "#5e5040",
  colVal: "#5888b4",
  colMath: "#b07840",
  colVar: "#5a8f5a",
  colLogic: "#8060b0",
  colFlow: "#b04848",
  colFn: "#c4a050",
  colOut: "#909090",
  colString: "#4a9e7a",
  colArray: "#6070c0",
  colObj: "#a05070",
  colConv: "#7090a0",
  colAsync: "#906040",
  colDom: "#507870",
  colDate: "#705090",
  gridStyle: "dots",
  gridSize: 24,
  gridOpacity: 1,
  snapToGrid: false,
  snapSize: 20,
  sidebarOpacity: 1,
  sidebarBlur: 0,
  consoleOpacity: 1,
  consoleBlur: 0,
  toolbarOpacity: 1,
  toolbarBlur: 0,
  nodeOpacity: 1,
  nodeBlur: 0,
  nodeBorderRadius: 12,
  nodeHeadRadius: 11,
  wireStyle: "bezier",
  wireWidth: 2,
  wireOpacity: 1,
  showWireBadges: true,
  catAnimation: true,
  compileDelay: true,
  spawnAnimation: true,
  uiFontSize: 13,
  cursorColor: "#d4b87a",
  cursorSize: 1,
  colEvent: "#e05080",
  colCanvas: "#50a878",
};

let SETTINGS = { ...SETTINGS_DEFAULTS };

function loadSettings() {
  try {
    const raw = localStorage.getItem("cupcake_settings");
    if (raw) SETTINGS = { ...SETTINGS_DEFAULTS, ...JSON.parse(raw) };
  } catch {}
}

function saveSettings() {
  localStorage.setItem("cupcake_settings", JSON.stringify(SETTINGS));
}

function applySettings() {
  const r = document.documentElement.style;
  r.setProperty("--accent", SETTINGS.accentColor);
  r.setProperty("--accent2", SETTINGS.accent2Color);
  r.setProperty("--bg", SETTINGS.bgColor);
  r.setProperty("--s1", SETTINGS.s1Color);
  r.setProperty("--s2", SETTINGS.s2Color);
  r.setProperty("--s3", SETTINGS.s3Color);
  r.setProperty("--b1", SETTINGS.b1Color);
  r.setProperty("--b2", SETTINGS.b2Color);
  r.setProperty("--cream", SETTINGS.creamColor);
  r.setProperty("--cream2", SETTINGS.cream2Color);
  r.setProperty("--cream3", SETTINGS.cream3Color);
  r.setProperty("--col-val", SETTINGS.colVal);
  r.setProperty("--col-math", SETTINGS.colMath);
  r.setProperty("--col-var", SETTINGS.colVar);
  r.setProperty("--col-logic", SETTINGS.colLogic);
  r.setProperty("--col-flow", SETTINGS.colFlow);
  r.setProperty("--col-fn", SETTINGS.colFn);
  r.setProperty("--col-out", SETTINGS.colOut);
  r.setProperty("--col-event", SETTINGS.colEvent);
  r.setProperty("--col-canvas", SETTINGS.colCanvas);
  r.setProperty("--col-string", SETTINGS.colString);
  r.setProperty("--col-array", SETTINGS.colArray);
  r.setProperty("--col-obj", SETTINGS.colObj);
  r.setProperty("--col-conv", SETTINGS.colConv);
  r.setProperty("--col-async", SETTINGS.colAsync);
  r.setProperty("--col-dom", SETTINGS.colDom);
  r.setProperty("--col-date", SETTINGS.colDate);
  r.setProperty("--settings-node-opacity", SETTINGS.nodeOpacity);
  r.setProperty("--settings-node-radius", SETTINGS.nodeBorderRadius + "px");
  r.setProperty("--settings-node-head-radius", SETTINGS.nodeHeadRadius + "px");
  r.setProperty(
    "--settings-node-blur",
    SETTINGS.nodeBlur > 0 ? `blur(${SETTINGS.nodeBlur}px)` : "none",
  );
  r.setProperty("--settings-wire-width", SETTINGS.wireWidth);
  r.setProperty("--settings-wire-opacity", SETTINGS.wireOpacity);
  r.setProperty("--settings-cursor-color", SETTINGS.cursorColor);
  r.setProperty("--settings-cursor-scale", SETTINGS.cursorSize);
  r.setProperty(
    "--settings-wire-badges-display",
    SETTINGS.showWireBadges ? "inline" : "none",
  );

  const sidebar = document.getElementById("sidebar");
  const consolePanel = document.getElementById("console-panel");
  const toolbar = document.getElementById("toolbar");
  const catCorner = document.getElementById("cat-corner");
  const consolebar = document.getElementById("console-bar");

  if (sidebar) {
    sidebar.style.background = hexToRgba(
      SETTINGS.s1Color,
      SETTINGS.sidebarOpacity,
    );
    sidebar.style.backdropFilter =
      SETTINGS.sidebarBlur > 0 ? `blur(${SETTINGS.sidebarBlur}px)` : "";
  }
  if (catCorner) {
    catCorner.style.background = hexToRgba(
      SETTINGS.s1Color,
      SETTINGS.sidebarOpacity,
    );
    catCorner.style.backdropFilter =
      SETTINGS.sidebarBlur > 0 ? `blur(${SETTINGS.sidebarBlur}px)` : "";
  }
  if (consolePanel) {
    consolePanel.style.background = hexToRgba(
      "#080808",
      SETTINGS.consoleOpacity,
    );
    consolePanel.style.backdropFilter =
      SETTINGS.consoleBlur > 0 ? `blur(${SETTINGS.consoleBlur}px)` : "";
  }
  if (consolebar) {
    consolebar.style.background = hexToRgba(
      SETTINGS.s1Color,
      SETTINGS.consoleOpacity,
    );
  }
  if (toolbar) {
    toolbar.style.background = hexToRgba(
      SETTINGS.s1Color,
      SETTINGS.toolbarOpacity,
    );
    toolbar.style.backdropFilter =
      SETTINGS.toolbarBlur > 0 ? `blur(${SETTINGS.toolbarBlur}px)` : "";
  }

  document.body.style.fontSize = SETTINGS.uiFontSize + "px";

  const catEl = document.getElementById("cat-ascii");
  const catCornerEl = document.getElementById("cat-corner");
  if (catCornerEl)
    catCornerEl.style.display = SETTINGS.catAnimation ? "" : "none";

  applyGridStyle();
  drawWires();
  saveSettings();
}

function applyGridStyle() {
  const grid = document.getElementById("grid-bg");
  if (!grid) return;
  const size = SETTINGS.gridSize * zoom;
  const op = SETTINGS.gridOpacity;
  const col = `rgba(37,37,37,${op})`;
  grid.style.backgroundPosition = `${pan.x}px ${pan.y}px`;
  grid.style.backgroundSize = `${size}px ${size}px`;
  if (SETTINGS.gridStyle === "none") {
    grid.style.backgroundImage = "none";
  } else if (SETTINGS.gridStyle === "lines") {
    grid.style.backgroundImage = `linear-gradient(${col} 1px, transparent 1px), linear-gradient(90deg, ${col} 1px, transparent 1px)`;
  } else {
    grid.style.backgroundImage = `radial-gradient(circle, ${col} 1px, transparent 1px)`;
  }
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function snapToGrid(val) {
  if (!SETTINGS.snapToGrid) return val;
  return Math.round(val / SETTINGS.snapSize) * SETTINGS.snapSize;
}

function buildSettingsModal() {
  const existing = document.getElementById("settings-modal");
  if (existing) {
    existing.remove();
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "overlay open";
  overlay.id = "settings-modal";

  const modal = document.createElement("div");
  modal.className = "modal";
  modal.style.cssText = "width:680px;max-height:85vh;";

  modal.innerHTML = `
    <div class="mtop">
      <span class="mtitle">settings</span>
      <div style="display:flex;gap:6px;align-items:center">
        <button class="btn" id="settings-export-btn">export</button>
        <button class="btn" id="settings-import-btn">import</button>
        <button class="btn" id="settings-reset-btn">reset all</button>
        <button class="mclose" id="settings-close">✕</button>
      </div>
    </div>
    <div class="mbody" style="padding:0;display:flex;height:calc(85vh - 52px)">
      <div class="settings-tabs" id="settings-tabs"></div>
      <div class="settings-panes" id="settings-panes"></div>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const sections = [
    {
      id: "colors",
      label: "colors",
      rows: [
        { type: "section", label: "ui colors" },
        { type: "color", label: "accent", key: "accentColor" },
        { type: "color", label: "accent dim", key: "accent2Color" },
        { type: "color", label: "background", key: "bgColor" },
        { type: "color", label: "surface 1", key: "s1Color" },
        { type: "color", label: "surface 2", key: "s2Color" },
        { type: "color", label: "surface 3", key: "s3Color" },
        { type: "color", label: "border 1", key: "b1Color" },
        { type: "color", label: "border 2", key: "b2Color" },
        { type: "color", label: "text", key: "creamColor" },
        { type: "color", label: "text dim", key: "cream2Color" },
        { type: "color", label: "text muted", key: "cream3Color" },
        { type: "section", label: "node category colors" },
        { type: "color", label: "values", key: "colVal" },
        { type: "color", label: "math", key: "colMath" },
        { type: "color", label: "variables", key: "colVar" },
        { type: "color", label: "logic", key: "colLogic" },
        { type: "color", label: "control flow", key: "colFlow" },
        { type: "color", label: "functions", key: "colFn" },
        { type: "color", label: "output", key: "colOut" },
        { type: "color", label: "strings", key: "colString" },
        { type: "color", label: "arrays", key: "colArray" },
        { type: "color", label: "objects", key: "colObj" },
        { type: "color", label: "convert", key: "colConv" },
        { type: "color", label: "async", key: "colAsync" },
        { type: "color", label: "dom", key: "colDom" },
        { type: "color", label: "date", key: "colDate" },
      ],
    },
    {
      id: "canvas",
      label: "canvas",
      rows: [
        { type: "section", label: "grid" },
        {
          type: "select",
          label: "grid style",
          key: "gridStyle",
          opts: ["dots", "lines", "none"],
        },
        {
          type: "range",
          label: "grid size",
          key: "gridSize",
          min: 8,
          max: 64,
          step: 4,
        },
        {
          type: "range",
          label: "grid opacity",
          key: "gridOpacity",
          min: 0,
          max: 1,
          step: 0.05,
        },
        { type: "section", label: "snapping" },
        { type: "toggle", label: "snap to grid", key: "snapToGrid" },
        {
          type: "range",
          label: "snap size",
          key: "snapSize",
          min: 4,
          max: 80,
          step: 4,
        },
      ],
    },
    {
      id: "panels",
      label: "panels",
      rows: [
        { type: "section", label: "sidebar" },
        {
          type: "range",
          label: "opacity",
          key: "sidebarOpacity",
          min: 0,
          max: 1,
          step: 0.05,
        },
        {
          type: "range",
          label: "blur",
          key: "sidebarBlur",
          min: 0,
          max: 24,
          step: 1,
        },
        { type: "section", label: "toolbar" },
        {
          type: "range",
          label: "opacity",
          key: "toolbarOpacity",
          min: 0,
          max: 1,
          step: 0.05,
        },
        {
          type: "range",
          label: "blur",
          key: "toolbarBlur",
          min: 0,
          max: 24,
          step: 1,
        },
        { type: "section", label: "console" },
        {
          type: "range",
          label: "opacity",
          key: "consoleOpacity",
          min: 0,
          max: 1,
          step: 0.05,
        },
        {
          type: "range",
          label: "blur",
          key: "consoleBlur",
          min: 0,
          max: 24,
          step: 1,
        },
      ],
    },
    {
      id: "nodes",
      label: "nodes",
      rows: [
        { type: "section", label: "appearance" },
        {
          type: "range",
          label: "opacity",
          key: "nodeOpacity",
          min: 0.1,
          max: 1,
          step: 0.05,
        },
        {
          type: "range",
          label: "blur",
          key: "nodeBlur",
          min: 0,
          max: 16,
          step: 1,
        },
        {
          type: "range",
          label: "border radius",
          key: "nodeBorderRadius",
          min: 0,
          max: 24,
          step: 1,
        },
        { type: "section", label: "wires" },
        {
          type: "select",
          label: "wire style",
          key: "wireStyle",
          opts: ["bezier", "straight"],
        },
        {
          type: "range",
          label: "wire width",
          key: "wireWidth",
          min: 0.5,
          max: 6,
          step: 0.5,
        },
        {
          type: "range",
          label: "wire opacity",
          key: "wireOpacity",
          min: 0.1,
          max: 1,
          step: 0.05,
        },
        { type: "toggle", label: "show wire labels", key: "showWireBadges" },
      ],
    },
    {
      id: "editor",
      label: "editor",
      rows: [
        { type: "section", label: "ui" },
        {
          type: "range",
          label: "font size",
          key: "uiFontSize",
          min: 10,
          max: 18,
          step: 1,
        },
        { type: "section", label: "behavior" },
        {
          type: "toggle",
          label: "compile animation delay",
          key: "compileDelay",
        },
        {
          type: "toggle",
          label: "node spawn animation",
          key: "spawnAnimation",
        },
        { type: "section", label: "cursor" },
        { type: "color", label: "cursor color", key: "cursorColor" },
        {
          type: "range",
          label: "cursor scale",
          key: "cursorSize",
          min: 0.5,
          max: 2,
          step: 0.1,
        },
        { type: "section", label: "cat" },
        { type: "toggle", label: "cat animation", key: "catAnimation" },
      ],
    },
    {
      id: "about",
      label: "about",
      rows: [], // we'll render this manually bitch
    },
  ];

  const tabsEl = modal.querySelector("#settings-tabs");
  const panesEl = modal.querySelector("#settings-panes");
  let activeSection = sections[0].id;

  sections.forEach((sec, si) => {
    const tab = document.createElement("div");
    tab.className = "settings-tab" + (si === 0 ? " active" : "");
    tab.textContent = sec.label;
    tab.dataset.id = sec.id;
    tab.addEventListener("click", () => {
      activeSection = sec.id;
      tabsEl
        .querySelectorAll(".settings-tab")
        .forEach((t) => t.classList.toggle("active", t.dataset.id === sec.id));
      panesEl
        .querySelectorAll(".settings-pane")
        .forEach((p) => p.classList.toggle("active", p.dataset.id === sec.id));
    });
    tabsEl.appendChild(tab);

    const pane = document.createElement("div");
    pane.className = "settings-pane" + (si === 0 ? " active" : "");
    pane.dataset.id = sec.id;

    sec.rows.forEach((row) => {
      if (row.type === "section") {
        const s = document.createElement("div");
        s.className = "settings-section-label";
        s.textContent = row.label;
        pane.appendChild(s);
        return;
      }

      const wrap = document.createElement("div");
      wrap.className = "settings-row";

      const lbl = document.createElement("span");
      lbl.className = "settings-row-label";
      lbl.textContent = row.label;
      wrap.appendChild(lbl);

      const right = document.createElement("div");
      right.className = "settings-row-right";

      if (row.type === "color") {
        const inp = document.createElement("input");
        inp.type = "color";
        inp.className = "settings-color";
        inp.value = SETTINGS[row.key];
        inp.addEventListener("input", () => {
          SETTINGS[row.key] = inp.value;
          applySettings();
        });
        right.appendChild(inp);
      }

      if (row.type === "range") {
        const val = document.createElement("span");
        val.className = "settings-range-val";
        val.textContent = SETTINGS[row.key];

        const inp = document.createElement("input");
        inp.type = "range";
        inp.className = "settings-range";
        inp.min = row.min;
        inp.max = row.max;
        inp.step = row.step;
        inp.value = SETTINGS[row.key];
        inp.addEventListener("input", () => {
          const v = parseFloat(inp.value);
          SETTINGS[row.key] = v;
          val.textContent = v;
          applySettings();
        });
        inp.addEventListener("mousedown", (e) => e.stopPropagation());
        right.appendChild(val);
        right.appendChild(inp);
      }

      if (row.type === "toggle") {
        const btn = document.createElement("button");
        btn.className = "settings-toggle" + (SETTINGS[row.key] ? " on" : "");
        btn.textContent = SETTINGS[row.key] ? "on" : "off";
        btn.addEventListener("click", () => {
          SETTINGS[row.key] = !SETTINGS[row.key];
          btn.classList.toggle("on", SETTINGS[row.key]);
          btn.textContent = SETTINGS[row.key] ? "on" : "off";
          applySettings();
        });
        right.appendChild(btn);
      }

      if (row.type === "select") {
        const sel = document.createElement("select");
        sel.className = "nfsel";
        sel.style.cssText = "width:100px;font-size:10px;padding:3px 6px;";
        row.opts.forEach((o) => {
          const opt = document.createElement("option");
          opt.value = o;
          opt.textContent = o;
          if (SETTINGS[row.key] === o) opt.selected = true;
          sel.appendChild(opt);
        });
        sel.addEventListener("change", () => {
          SETTINGS[row.key] = sel.value;
          applySettings();
        });
        sel.addEventListener("mousedown", (e) => e.stopPropagation());
        right.appendChild(sel);
      }

      wrap.appendChild(right);
      pane.appendChild(wrap);
    });

    panesEl.appendChild(pane);
  });

  // custom about pane
  const aboutPane = panesEl.querySelector('[data-id="about"]');
  if (aboutPane) {
    aboutPane.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:14px;padding:32px 20px;text-align:center;">
        <div style="font-size:32px">🧁</div>
        <div style="font-size:18px;font-weight:700;color:var(--accent);letter-spacing:-0.5px">cupcake</div>
        <div style="font-size:10px;color:var(--cream3);font-family:'DM Mono',monospace;letter-spacing:0.3px">visual js</div>
        <div style="width:40px;height:1px;background:var(--b2)"></div>
        <div style="font-size:11px;color:var(--cream2);line-height:2">
          developed by <span style="color:var(--accent)">cloudlull</span><br>
          <a href="https://cloudlull.fyi" target="_blank" style="color:var(--accent2);font-family:'DM Mono',monospace;font-size:10px;text-decoration:none;">cloudlull.fyi</a>
        </div>
        <div style="font-size:10px;color:var(--cream3);font-family:'DM Mono',monospace">licensed with MIT</div>
        <div style="font-size:10px;color:var(--cream3);font-family:'DM Mono',monospace">2026</div>
      </div>
    `;
  }

  modal
    .querySelector("#settings-close")
    .addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });

  modal.querySelector("#settings-reset-btn").addEventListener("click", () => {
    if (!confirm("reset all settings to defaults?")) return;
    SETTINGS = { ...SETTINGS_DEFAULTS };
    applySettings();
    overlay.remove();
    buildSettingsModal();
    toast("settings reset");
  });

  modal.querySelector("#settings-export-btn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(SETTINGS, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cupcake-settings.json";
    a.click();
    URL.revokeObjectURL(url);
    toast("settings exported");
  });

  modal.querySelector("#settings-import-btn").addEventListener("click", () => {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = ".json";
    inp.addEventListener("change", () => {
      const file = inp.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          SETTINGS = { ...SETTINGS_DEFAULTS, ...imported };
          applySettings();
          overlay.remove();
          buildSettingsModal();
          toast("settings imported");
        } catch {
          toast("invalid settings file");
        }
      };
      reader.readAsText(file);
    });
    inp.click();
  });
}

function buildPreviewHtml(js) {
  const assets = {};
  Object.values(nodes).forEach(n => {
    if (n.type === "asset_ref" && n.f.id && assetCache[n.f.id]) {
      const a = assetCache[n.f.id];
      assets[n.f.id] = { id: a.id, name: a.name, kind: a.kind, data: a.data };
    }
  });
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>*{box-sizing:border-box}body{margin:0;font-family:sans-serif}</style>
</head>
<body>
<script>
const __assets=${JSON.stringify(assets)};
const __pm=(...a)=>window.parent.postMessage(a,'*');
const __fmt=x=>typeof x==='object'?JSON.stringify(x,null,2):String(x);
const console={
  log:(...a)=>__pm({type:'log',level:'log',args:a.map(__fmt)}),
  error:(...a)=>__pm({type:'log',level:'error',args:a.map(__fmt)}),
  warn:(...a)=>__pm({type:'log',level:'warn',args:a.map(__fmt)}),
  info:(...a)=>__pm({type:'log',level:'log',args:a.map(__fmt)}),
  table:(...a)=>__pm({type:'log',level:'log',args:a.map(__fmt)}),
};
window.onerror=(msg,_,__,___,err)=>__pm({type:'log',level:'error',args:[err?.stack||msg]});
window.onunhandledrejection=e=>__pm({type:'log',level:'error',args:[String(e.reason)]});
try{
${js}
}catch(e){__pm({type:'log',level:'error',args:[e.stack||e.message]});}
<\/script>
</body>
</html>`;
}

let _previewMsgHandler = null;

function runInPreview() {
  const output = document.getElementById("run-output");
  output.innerHTML = "";
  document.getElementById("run-header-label").textContent = "running in preview";
  document.getElementById("run-dot").classList.remove("err");

  let code;
  try {
    code = compileCode();
  } catch(e) {
    appendConsoleEntry(output, "error", ["compile error: " + e.message], 0);
    document.getElementById("run-header-label").textContent = "compile error";
    document.getElementById("run-dot").classList.add("err");
    return;
  }

  if (_previewMsgHandler) window.removeEventListener("message", _previewMsgHandler);
  const start = performance.now();
  _previewMsgHandler = (e) => {
    const frame = document.getElementById("preview-frame");
    if (!frame || e.source !== frame.contentWindow) return;
    const d = e.data;
    if (d?.type === "log") {
      appendConsoleEntry(output, d.level, d.args, Math.round(performance.now() - start));
      document.getElementById("run-header-label").textContent = "preview running";
    }
  };
  window.addEventListener("message", _previewMsgHandler);

  openPreviewPanel(buildPreviewHtml(code));
}

function openPreviewPanel(html) {
  let panel = document.getElementById("preview-panel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "preview-panel";
    panel.innerHTML = `
      <div id="preview-bar">
        <span style="font-size:11px;font-weight:600;color:var(--cream2)">preview</span>
        <div style="display:flex;gap:5px;align-items:center">
          <button class="btn" id="preview-refresh" title="rerun">↺</button>
          <button class="btn" id="preview-popout" title="open in new tab">↗</button>
          <button class="btn" id="preview-close">✕</button>
        </div>
      </div>
      <iframe id="preview-frame" sandbox="allow-scripts"></iframe>
    `;
    document.body.appendChild(panel);

    const rh = document.createElement("div");
    rh.id = "preview-resize";
    panel.appendChild(rh);

    let rsz = false, rsxStart = 0, rswStart = 0;
    rh.addEventListener("mousedown", e => {
      rsz = true;
      rsxStart = e.clientX;
      rswStart = panel.offsetWidth;
      e.preventDefault();
    });
    document.addEventListener("mousemove", e => {
      if (!rsz) return;
      const w = Math.max(280, Math.min(window.innerWidth - 380, rswStart + (rsxStart - e.clientX)));
      panel.style.width = w + "px";
      document.getElementById("canvas-wrap").style.right = w + "px";
      document.getElementById("console-panel").style.right = w + "px";
    });
    document.addEventListener("mouseup", () => { rsz = false; });

    document.getElementById("preview-close").addEventListener("click", closePreviewPanel);
    document.getElementById("preview-refresh").addEventListener("click", runCode);
    document.getElementById("preview-popout").addEventListener("click", () => {
      const frame = document.getElementById("preview-frame");
      if (!frame?.srcdoc) return;
      const w = window.open("", "_blank");
      if (w) { w.document.open(); w.document.write(frame.srcdoc); w.document.close(); }
    });
  }

  const frame = document.getElementById("preview-frame");
  frame.srcdoc = html;
  panel.classList.add("open");
  const w = panel.offsetWidth || 480;
  document.getElementById("canvas-wrap").style.right = w + "px";
  document.getElementById("console-panel").style.right = w + "px";
}

function closePreviewPanel() {
  document.getElementById("preview-panel")?.classList.remove("open");
  document.getElementById("canvas-wrap").style.right = "0";
  document.getElementById("console-panel").style.right = "0";
  if (_previewMsgHandler) {
    window.removeEventListener("message", _previewMsgHandler);
    _previewMsgHandler = null;
  }
}

async function boot() {
  startLoader();
  buildSidebar();
  buildSaveLoad();
  loadSettings();
  applySettings();
  loadPanelSizes();
  await initDB();
  await loadAssetCache();
  await refreshIndicators();
  applyTransform();
  showHint();
  document.getElementById("console-panel").classList.add("open");
  document.getElementById("canvas-wrap").classList.add("console-open");
  document.getElementById("sidebar").classList.add("console-open");
  document.getElementById("cat-corner").classList.add("open");
  syncMinimapBottom();
}

document.getElementById("import-btn").addEventListener("click", () => {
  document.getElementById("import-textarea").value = "";
  document.getElementById("import-status").textContent = "";
  document.getElementById("import-status").className = "import-status";
  document.getElementById("import-modal-title").textContent = "import js";
  document.getElementById("import-modal-body").innerHTML = `
    <div class="import-hint">paste javascript below, it'll be parsed into nodes</div>
    <textarea class="import-textarea" id="import-textarea" placeholder="// paste your js here&#10;let x = 5 + 3;&#10;console.log(x);"></textarea>
    <div class="import-status" id="import-status"></div>
  `;
  document.getElementById("import-modal").classList.add("open");
});

document.getElementById("import-modal-close").addEventListener("click", () => {
  document.getElementById("import-modal").classList.remove("open");
});

document.getElementById("import-cancel-btn").addEventListener("click", () => {
  document.getElementById("import-modal").classList.remove("open");
});

document
  .getElementById("settings-btn")
  .addEventListener("click", buildSettingsModal);

document.getElementById("embed-btn").addEventListener("click", () => {
  const payload = btoa(JSON.stringify({ nodes, conns, frames }));
  const url = `${location.origin}${location.pathname.replace("index.html", "").replace(/\/$/, "")}/embed.html#${payload}`;
  const modal = document.getElementById("compile-modal");
  const body = document.getElementById("modal-body");
  const foot = document.getElementById("modal-foot");
  const title = document.getElementById("modal-title");
  title.textContent = "embed";
  body.innerHTML = "";
  foot.style.display = "flex";
  modal.classList.add("open");

  const hint = document.createElement("div");
  hint.style.cssText =
    "font-size:11px;color:var(--cream3);margin-bottom:10px;line-height:1.7;";
  hint.textContent =
    "paste this iframe into any page. the graph is encoded in the url — no server needed.";

  const cb = document.createElement("div");
  cb.className = "codebox";
  cb.id = "codebox";
  cb.textContent = `<iframe\n  src="${url}"\n  width="100%"\n  height="500"\n  style="border:none;border-radius:12px"\n></iframe>`;

  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.style.cssText =
    "font-size:11px;color:var(--accent);display:block;margin-top:9px;font-family:'DM Mono',monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
  link.textContent = url;

  body.appendChild(hint);
  body.appendChild(cb);
  body.appendChild(link);
});

document.getElementById("import-go-btn").addEventListener("click", () => {
  const raw = document.getElementById("import-textarea")?.value?.trim();
  if (!raw) return;

  const body = document.getElementById("import-modal-body");
  const title = document.getElementById("import-modal-title");
  title.textContent = "parsing...";
  body.innerHTML = `<div class="import-parsing"><span id="import-dots">.</span> analyzing code</div>`;

  const dots = document.getElementById("import-dots");
  let d = 0;
  const dotInt = setInterval(() => {
    d = (d + 1) % 3;
    dots.textContent = ".".repeat(d + 1);
  }, 350);

  const delay = SETTINGS.compileDelay ? 1000 + Math.random() * 2000 : 0;
  setTimeout(async () => {
    clearInterval(dotInt);
    try {
      const result = await parseJSIntoNodes(raw);
      document.getElementById("import-modal").classList.remove("open");
      toast(`imported ${result} node${result !== 1 ? "s" : ""}`);
    } catch (err) {
      title.textContent = "import js";
      body.innerHTML = `
        <div class="import-hint">paste javascript below, it'll be parsed into nodes</div>
        <textarea class="import-textarea" id="import-textarea" placeholder="// paste your js here&#10;let x = 5 + 3;&#10;console.log(x);"></textarea>
        <div class="import-status err" id="import-status">parse error: ${err.message}</div>
      `;
      document.getElementById("import-textarea").value = raw;
    }
  }, delay);
});

async function parseJSIntoNodes(code) {
  if (!window.acorn) {
    await new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src =
        "https://cdnjs.cloudflare.com/ajax/libs/acorn/8.11.3/acorn.min.js";
      s.onload = res;
      s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  const ast = window.acorn.parse(code, { ecmaVersion: 2022 });
  let count = 0;
  const unhandled = new Set();
  const existingCount = Object.keys(nodes).length;
  const baseX = (existingCount % 4) * 240 + 80;
  const baseY = 80 + Math.floor(existingCount / 4) * 200;

  function placeNode(type, x, y, fields) {
    const id = makeNode(type, x, y);
    if (!id || !nodes[id]) return id;
    if (fields) {
      Object.entries(fields).forEach(([k, v]) => {
        nodes[id].f[k] = String(v);
      });
      const el = document.getElementById("node-" + id);
      if (el) {
        TYPES[nodes[id].type]?.fields.forEach((fd, i) => {
          const inp = el.querySelectorAll(".nfinput, .nfsel")[i];
          if (inp) inp.value = nodes[id].f[fd.id] ?? "";
        });
      }
    }
    count++;
    return id;
  }

  function exprToNode(node, x, y) {
    if (!node) return placeNode("raw_js", x, y, { code: "/* unresolved */" });

    if (node.type === "Literal") {
      if (typeof node.value === "number")
        return placeNode("number", x, y, { v: String(node.value) });
      if (typeof node.value === "string")
        return placeNode("string", x, y, { v: node.value });
      if (typeof node.value === "boolean")
        return placeNode("boolean", x, y, { v: String(node.value) });
      if (node.value === null) return placeNode("null_val", x, y, {});
    }

    if (node.type === "Identifier") {
      if (node.name === "undefined")
        return placeNode("undefined_val", x, y, {});
      return placeNode("raw_js", x, y, { code: node.name });
    }

    if (node.type === "BinaryExpression") {
      const opMap = {
        "+": "add",
        "-": "subtract",
        "*": "multiply",
        "/": "divide",
        "%": "modulo",
        "**": "power",
      };
      const cmpOps = ["===", "!==", "<", ">", "<=", ">="];
      if (opMap[node.operator]) {
        const nid = placeNode(opMap[node.operator], x, y, {});
        const leftId = exprToNode(node.left, x - 220, y - 60);
        const rightId = exprToNode(node.right, x - 220, y + 60);
        if (leftId) addConn(leftId, "out", nid, "a");
        if (rightId) addConn(rightId, "out", nid, "b");
        return nid;
      }
      if (cmpOps.includes(node.operator)) {
        const nid = placeNode("compare", x, y, { op: node.operator });
        const leftId = exprToNode(node.left, x - 220, y - 60);
        const rightId = exprToNode(node.right, x - 220, y + 60);
        if (leftId) addConn(leftId, "out", nid, "a");
        if (rightId) addConn(rightId, "out", nid, "b");
        return nid;
      }
    }

    if (node.type === "LogicalExpression") {
      const opMap = { "&&": "and", "||": "or", "??": "nullish" };
      const t = opMap[node.operator];
      if (t) {
        const nid = placeNode(t, x, y, {});
        const leftId = exprToNode(node.left, x - 220, y - 60);
        const rightId = exprToNode(node.right, x - 220, y + 60);
        if (leftId) addConn(leftId, "out", nid, "a");
        if (rightId) addConn(rightId, "out", nid, "b");
        return nid;
      }
    }

    if (node.type === "UnaryExpression" && node.operator === "!") {
      const nid = placeNode("not", x, y, {});
      const argId = exprToNode(node.argument, x - 200, y);
      if (argId) addConn(argId, "out", nid, "a");
      return nid;
    }

    if (node.type === "ConditionalExpression") {
      const nid = placeNode("ternary", x, y, {});
      const condId = exprToNode(node.test, x - 220, y - 80);
      const thenId = exprToNode(node.consequent, x - 220, y);
      const elseId = exprToNode(node.alternate, x - 220, y + 80);
      if (condId) addConn(condId, "out", nid, "cond");
      if (thenId) addConn(thenId, "out", nid, "then");
      if (elseId) addConn(elseId, "out", nid, "else");
      return nid;
    }

    if (node.type === "TemplateLiteral") {
      if (node.expressions.length === 0) {
        return placeNode("string", x, y, { v: node.quasis[0].value.cooked });
      }
      let tpl = "";
      node.quasis.forEach((q, i) => {
        tpl += q.value.cooked + (i < node.expressions.length ? `$${i}` : "");
      });
      const nid = placeNode("template_str", x, y, { tpl });
      node.expressions.slice(0, 3).forEach((expr, i) => {
        const eid = exprToNode(expr, x - 220, y + i * 70 - 70);
        if (eid) addConn(eid, "out", nid, `v${i}`);
      });
      return nid;
    }

    if (node.type === "CallExpression") {
      const callee = node.callee;

      if (callee.type === "MemberExpression") {
        const obj = callee.object;
        const prop = callee.property.name;

        if (
          obj.type === "Identifier" &&
          obj.name === "console" &&
          prop === "log"
        ) {
          const nid = placeNode("log", x, y, {});
          if (node.arguments[0]) {
            const argId = exprToNode(node.arguments[0], x - 220, y);
            if (argId) addConn(argId, "out", nid, "val");
          }
          return nid;
        }

        if (
          obj.type === "Identifier" &&
          obj.name === "console" &&
          prop === "error"
        ) {
          const nid = placeNode("console_error", x, y, {});
          if (node.arguments[0]) {
            const argId = exprToNode(node.arguments[0], x - 220, y);
            if (argId) addConn(argId, "out", nid, "val");
          }
          return nid;
        }

        if (obj.type === "Identifier" && obj.name === "Math") {
          const mathMap = {
            abs: "abs",
            floor: "floor",
            ceil: "ceil",
            round: "round",
            random: "random",
            min: "min",
            max: "max",
            pow: "power",
            sign: "math_sign",
            trunc: "math_trunc",
            sqrt: "sqrt",
            log: "log_math",
            sin: "sin",
            cos: "cos",
            tan: "tan",
            hypot: "math_hypot",
          };
          if (mathMap[prop]) {
            const nid = placeNode(mathMap[prop], x, y, {});
            const ports = ["a", "b"];
            node.arguments.slice(0, 2).forEach((arg, i) => {
              const aid = exprToNode(arg, x - 220, y + i * 70 - 35);
              if (aid) addConn(aid, "out", nid, ports[i]);
            });
            return nid;
          }
        }

        if (obj.type === "Identifier" && obj.name === "JSON") {
          if (prop === "parse") {
            const nid = placeNode("json_parse", x, y, {});
            if (node.arguments[0]) {
              const aid = exprToNode(node.arguments[0], x - 220, y);
              if (aid) addConn(aid, "out", nid, "str");
            }
            return nid;
          }
          if (prop === "stringify") {
            const nid = placeNode("json_stringify", x, y, {});
            if (node.arguments[0]) {
              const aid = exprToNode(node.arguments[0], x - 220, y);
              if (aid) addConn(aid, "out", nid, "val");
            }
            return nid;
          }
        }

        if (obj.type === "Identifier" && obj.name === "Object") {
          const objMap = {
            keys: "obj_keys",
            values: "obj_values",
            entries: "obj_entries",
            assign: "obj_assign",
            freeze: "obj_freeze",
            fromEntries: "obj_fromEntries",
          };
          if (objMap[prop]) {
            const nid = placeNode(objMap[prop], x, y, {});
            if (node.arguments[0]) {
              const aid = exprToNode(node.arguments[0], x - 220, y);
              if (aid)
                addConn(aid, "out", nid, prop === "assign" ? "a" : "obj");
              if (prop === "assign" && node.arguments[1]) {
                const bid = exprToNode(node.arguments[1], x - 220, y + 70);
                if (bid) addConn(bid, "out", nid, "b");
              }
            }
            return nid;
          }
        }

        if (obj.type === "Identifier" && obj.name === "Array") {
          if (prop === "from") {
            const nid = placeNode("arr_from", x, y, {});
            if (node.arguments[0]) {
              const aid = exprToNode(node.arguments[0], x - 220, y);
              if (aid) addConn(aid, "out", nid, "val");
            }
            return nid;
          }
          if (prop === "isArray") {
            const nid = placeNode("arr_isarray", x, y, {});
            if (node.arguments[0]) {
              const aid = exprToNode(node.arguments[0], x - 220, y);
              if (aid) addConn(aid, "out", nid, "val");
            }
            return nid;
          }
          if (prop === "of") {
            const nid = placeNode("arr_of", x, y, {});
            node.arguments.slice(0, 3).forEach((arg, i) => {
              const aid = exprToNode(arg, x - 220, y + i * 60 - 60);
              if (aid) addConn(aid, "out", nid, `v${i}`);
            });
            return nid;
          }
        }

        const methodMap = {
          toUpperCase: "str_upper",
          toLowerCase: "str_lower",
          trim: "str_trim",
          trimStart: "str_trimstart",
          trimEnd: "str_trimend",
          split: "str_split",
          includes: "str_includes",
          replace: "str_replace",
          replaceAll: "str_replaceall",
          slice: "str_slice",
          at: null,
          push: "arr_push",
          pop: "arr_pop",
          shift: "arr_shift",
          unshift: "arr_unshift",
          map: "arr_map",
          filter: "arr_filter",
          reduce: "arr_reduce",
          find: "arr_find",
          findIndex: "arr_findindex",
          findLast: "arr_findlast",
          join: "arr_join",
          flat: "arr_flat",
          flatMap: "arr_flatmap",
          every: "arr_every",
          some: "arr_some",
          sort: "arr_sort",
          reverse: "arr_reverse",
          concat: "arr_concat",
          fill: "arr_fill",
          then: "then",
          catch: "catch_err",
          toFixed: "num_tofixed",
        };

        if (prop === "at") {
          const isStr =
            ["Literal"].includes(obj.type) && typeof obj.value === "string";
          const nid = placeNode(isStr ? "str_at" : "arr_at", x, y, {});
          const objId = exprToNode(obj, x - 220, y - 40);
          const inPort = isStr ? "str" : "arr";
          if (objId) addConn(objId, "out", nid, inPort);
          if (node.arguments[0]) {
            const idxId = exprToNode(node.arguments[0], x - 220, y + 40);
            if (idxId) addConn(idxId, "out", nid, "idx");
          }
          return nid;
        }

        if (methodMap[prop]) {
          const nid = placeNode(methodMap[prop], x, y, {});
          const objId = exprToNode(obj, x - 220, y - 40);
          const inPort = [
            "str_upper",
            "str_lower",
            "str_trim",
            "str_trimstart",
            "str_trimend",
            "str_length",
            "str_split",
            "str_includes",
            "str_replace",
            "str_replaceall",
            "str_slice",
            "str_at",
          ].includes(methodMap[prop])
            ? "str"
            : [
                  "arr_pop",
                  "arr_shift",
                  "arr_length",
                  "arr_map",
                  "arr_filter",
                  "arr_reduce",
                  "arr_find",
                  "arr_findindex",
                  "arr_findlast",
                  "arr_join",
                  "arr_flat",
                  "arr_flatmap",
                  "arr_every",
                  "arr_some",
                  "arr_sort",
                  "arr_reverse",
                  "arr_at",
                ].includes(methodMap[prop])
              ? "arr"
              : ["then", "catch_err"].includes(methodMap[prop])
                ? "promise"
                : methodMap[prop] === "num_tofixed"
                  ? "val"
                  : "obj";
          if (objId) addConn(objId, "out", nid, inPort);
          const argPorts = {
            str_split: ["sep"],
            str_includes: ["sub"],
            str_replace: ["from", "to"],
            str_replaceall: ["from", "to"],
            str_slice: ["start", "end"],
            arr_push: ["val"],
            arr_unshift: ["val"],
            arr_map: ["fn_port"],
            arr_filter: ["fn_port"],
            arr_reduce: ["fn_port"],
            arr_find: ["fn_port"],
            arr_findindex: [],
            arr_findlast: [],
            arr_join: ["sep"],
            arr_flat: [],
            arr_flatmap: ["fn_port"],
            arr_every: ["fn_port"],
            arr_some: ["fn_port"],
            arr_concat: ["b"],
            arr_fill: ["val"],
          };
          if (argPorts[methodMap[prop]]) {
            node.arguments
              .slice(0, argPorts[methodMap[prop]].length)
              .forEach((arg, i) => {
                if (arg.type === "Literal") {
                  nodes[nid] &&
                    (nodes[nid].f[argPorts[methodMap[prop]][i]] = String(
                      arg.value,
                    ));
                  const el = document.getElementById("node-" + nid);
                  if (el) {
                    const inp = el.querySelectorAll(".nfinput")[0];
                    if (inp) inp.value = String(arg.value);
                  }
                } else {
                  const aid = exprToNode(arg, x - 220, y + (i + 1) * 60);
                  if (aid)
                    addConn(aid, "out", nid, argPorts[methodMap[prop]][i]);
                }
              });
          }
          return nid;
        }

        const raw = code.slice(node.start, node.end);
        return placeNode("raw_js", x, y, { code: raw });
      }

      if (callee.type === "Identifier") {
        const name = callee.name;
        if (name === "parseInt") {
          const nid = placeNode("int_parse", x, y, {});
          if (node.arguments[0]) {
            const aid = exprToNode(node.arguments[0], x - 220, y);
            if (aid) addConn(aid, "out", nid, "val");
          }
          return nid;
        }
        if (name === "parseFloat") {
          const nid = placeNode("num_parse", x, y, {});
          if (node.arguments[0]) {
            const aid = exprToNode(node.arguments[0], x - 220, y);
            if (aid) addConn(aid, "out", nid, "val");
          }
          return nid;
        }
        if (name === "String") {
          const nid = placeNode("to_string", x, y, {});
          if (node.arguments[0]) {
            const aid = exprToNode(node.arguments[0], x - 220, y);
            if (aid) addConn(aid, "out", nid, "val");
          }
          return nid;
        }
        if (name === "Number") {
          const nid = placeNode("number_cast", x, y, {});
          if (node.arguments[0]) {
            const aid = exprToNode(node.arguments[0], x - 220, y);
            if (aid) addConn(aid, "out", nid, "val");
          }
          return nid;
        }
        if (name === "Boolean") {
          const nid = placeNode("bool_cast", x, y, {});
          if (node.arguments[0]) {
            const aid = exprToNode(node.arguments[0], x - 220, y);
            if (aid) addConn(aid, "out", nid, "val");
          }
          return nid;
        }
        if (name === "Symbol") {
          const nid = placeNode("symbol_node", x, y, {});
          if (node.arguments[0]?.type === "Literal") {
            nodes[nid] && (nodes[nid].f.desc = String(node.arguments[0].value));
          }
          return nid;
        }
        if (name === "structuredClone") {
          const nid = placeNode("structured_clone", x, y, {});
          if (node.arguments[0]) {
            const aid = exprToNode(node.arguments[0], x - 220, y);
            if (aid) addConn(aid, "out", nid, "val");
          }
          return nid;
        }
        if (name === "alert") {
          const nid = placeNode("alert_node", x, y, {});
          if (node.arguments[0]) {
            const aid = exprToNode(node.arguments[0], x - 220, y);
            if (aid) addConn(aid, "out", nid, "val");
          }
          return nid;
        }
        if (name === "isNaN") {
          const nid = placeNode("isnan", x, y, {});
          if (node.arguments[0]) {
            const aid = exprToNode(node.arguments[0], x - 220, y);
            if (aid) addConn(aid, "out", nid, "val");
          }
          return nid;
        }
        if (name === "isFinite") {
          const nid = placeNode("isfinite", x, y, {});
          if (node.arguments[0]) {
            const aid = exprToNode(node.arguments[0], x - 220, y);
            if (aid) addConn(aid, "out", nid, "val");
          }
          return nid;
        }
        const nid = placeNode("call", x, y, { fn: name });
        node.arguments.slice(0, 3).forEach((arg, i) => {
          const aid = exprToNode(arg, x - 220, y + i * 70 - 70);
          if (aid) addConn(aid, "out", nid, `a${i}`);
        });
        return nid;
      }
    }

    if (node.type === "ArrayExpression") {
      const items = node.elements
        .map((el) => {
          if (!el) return "";
          if (el.type === "Literal") return String(el.value);
          return code.slice(el.start, el.end);
        })
        .join(", ");
      return placeNode("arr_literal", x, y, { items });
    }

    if (node.type === "ObjectExpression") {
      const props = node.properties
        .map((p) => {
          const key = p.key.name || p.key.value;
          const val =
            p.value.type === "Literal"
              ? JSON.stringify(p.value.value)
              : code.slice(p.value.start, p.value.end);
          return `${key}: ${val}`;
        })
        .join(", ");
      return placeNode("obj_literal", x, y, { props });
    }

    if (node.type === "MemberExpression" && !node.computed) {
      const nid = placeNode("obj_get", x, y, { key: node.property.name });
      const objId = exprToNode(node.object, x - 200, y);
      if (objId) addConn(objId, "out", nid, "obj");
      return nid;
    }

    if (node.type === "MemberExpression" && node.computed) {
      const nid = placeNode("arr_index", x, y, {});
      const arrId = exprToNode(node.object, x - 220, y - 40);
      const idxId = exprToNode(node.property, x - 220, y + 40);
      if (arrId) addConn(arrId, "out", nid, "arr");
      if (idxId) addConn(idxId, "out", nid, "idx");
      return nid;
    }

    if (node.type === "SpreadElement") return exprToNode(node.argument, x, y);

    if (node.type === "AwaitExpression") {
      const nid = placeNode("await_node", x, y, {});
      const pid = exprToNode(node.argument, x - 200, y);
      if (pid) addConn(pid, "out", nid, "promise");
      return nid;
    }

    if (
      node.type === "ArrowFunctionExpression" ||
      node.type === "FunctionExpression"
    ) {
      const raw = code.slice(node.start, node.end);
      return placeNode("raw_js", x, y, { code: raw });
    }

    unhandled.add(node.type);
    return placeNode("raw_js", x, y, {
      code: code.slice(node.start, node.end),
    });
  }

  function stmtToNodes(stmt, x, y) {
    if (stmt.type === "VariableDeclaration") {
      stmt.declarations.forEach((decl, i) => {
        const varId = placeNode("variable", x, y + i * 160, {
          kind: stmt.kind,
          name: decl.id.name,
        });
        if (decl.init) {
          const valId = exprToNode(decl.init, x - 240, y + i * 160 - 20);
          if (valId) addConn(valId, "out", varId, "val");
        }
      });
      return;
    }

    if (stmt.type === "ExpressionStatement") {
      exprToNode(stmt.expression, x, y);
      return;
    }

    if (stmt.type === "ReturnStatement") {
      const nid = placeNode("ret", x, y, {});
      if (stmt.argument) {
        const valId = exprToNode(stmt.argument, x - 220, y);
        if (valId) addConn(valId, "out", nid, "val");
      }
      return;
    }

    if (stmt.type === "IfStatement") {
      const nid = placeNode("if_stmt", x, y, {
        body: stmt.consequent
          ? code
              .slice(stmt.consequent.start, stmt.consequent.end)
              .replace(/^\{|\}$/g, "")
              .trim()
          : "",
      });
      const condId = exprToNode(stmt.test, x - 220, y - 40);
      if (condId) addConn(condId, "out", nid, "cond");
      return;
    }

    if (stmt.type === "ForStatement") {
      placeNode("for_loop", x, y, {
        init: stmt.init ? code.slice(stmt.init.start, stmt.init.end) : "",
        cond: stmt.test ? code.slice(stmt.test.start, stmt.test.end) : "",
        update: stmt.update
          ? code.slice(stmt.update.start, stmt.update.end)
          : "",
        body: stmt.body
          ? code
              .slice(stmt.body.start, stmt.body.end)
              .replace(/^\{|\}$/g, "")
              .trim()
          : "",
      });
      return;
    }

    if (stmt.type === "ForOfStatement") {
      const nid = placeNode("for_of", x, y, {
        item: stmt.left.declarations?.[0]?.id?.name || "item",
        body: code
          .slice(stmt.body.start, stmt.body.end)
          .replace(/^\{|\}$/g, "")
          .trim(),
      });
      const iterId = exprToNode(stmt.right, x - 220, y - 40);
      if (iterId) addConn(iterId, "out", nid, "iter");
      return;
    }

    if (stmt.type === "ForInStatement") {
      const nid = placeNode("for_in", x, y, {
        key: stmt.left.declarations?.[0]?.id?.name || "key",
        body: code
          .slice(stmt.body.start, stmt.body.end)
          .replace(/^\{|\}$/g, "")
          .trim(),
      });
      const objId = exprToNode(stmt.right, x - 220, y - 40);
      if (objId) addConn(objId, "out", nid, "obj");
      return;
    }

    if (stmt.type === "WhileStatement") {
      const nid = placeNode("while_loop", x, y, {
        body: code
          .slice(stmt.body.start, stmt.body.end)
          .replace(/^\{|\}$/g, "")
          .trim(),
      });
      const condId = exprToNode(stmt.test, x - 220, y - 40);
      if (condId) addConn(condId, "out", nid, "cond");
      return;
    }

    if (stmt.type === "DoWhileStatement") {
      const nid = placeNode("do_while", x, y, {
        body: code
          .slice(stmt.body.start, stmt.body.end)
          .replace(/^\{|\}$/g, "")
          .trim(),
      });
      const condId = exprToNode(stmt.test, x - 220, y - 40);
      if (condId) addConn(condId, "out", nid, "cond");
      return;
    }

    if (stmt.type === "FunctionDeclaration") {
      const params = stmt.params.map((p) => p.name).join(", ");
      placeNode("func", x, y, { name: stmt.id.name, params });
      return;
    }

    if (stmt.type === "TryStatement") {
      placeNode("try_catch", x, y, {
        try_body: code
          .slice(stmt.block.start, stmt.block.end)
          .replace(/^\{|\}$/g, "")
          .trim(),
        catch_var: stmt.handler?.param?.name || "err",
        catch_body: stmt.handler
          ? code
              .slice(stmt.handler.body.start, stmt.handler.body.end)
              .replace(/^\{|\}$/g, "")
              .trim()
          : "",
      });
      return;
    }

    if (stmt.type === "SwitchStatement") {
      const cases = stmt.cases
        .map((c) => code.slice(c.start, c.end))
        .join("\n");
      const nid = placeNode("switch_stmt", x, y, { cases });
      const valId = exprToNode(stmt.discriminant, x - 220, y - 40);
      if (valId) addConn(valId, "out", nid, "val");
      return;
    }

    if (stmt.type === "ThrowStatement") {
      const nid = placeNode("throw_node", x, y, {});
      if (stmt.argument) {
        const aid = exprToNode(stmt.argument, x - 220, y);
        if (aid) addConn(aid, "out", nid, "val");
      }
      return;
    }

    if (stmt.type === "BreakStatement") {
      placeNode("break_node", x, y, {});
      return;
    }
    if (stmt.type === "ContinueStatement") {
      placeNode("continue_node", x, y, {});
      return;
    }

    unhandled.add(stmt.type);
    placeNode("raw_js", x, y, { code: code.slice(stmt.start, stmt.end) });
  }

  ast.body.forEach((stmt, i) => {
    stmtToNodes(stmt, baseX + 280, baseY + i * 200);
  });

  drawWires();
  showHint();

  if (unhandled.size) {
    setTimeout(
      () => toast(`fell back to raw js: ${[...unhandled].join(", ")}`),
      400,
    );
  }

  return count;
}

function formatVal(v) {
  if (v === null) return "null";
  if (v === undefined) return "undefined";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (v instanceof Error) return v.stack || v.message;
  try {
    const s = JSON.stringify(v, null, 2);
    if (s && s.length < 2000) return s;
    return String(v);
  } catch {
    return String(v);
  }
}

function appendConsoleEntry(output, level, args, ms) {
  const badges = { log: "·", info: "i", warn: "▲", error: "✕", system: "·" };
  const entry = document.createElement("div");
  entry.className = "console-entry " + level;
  const badge = document.createElement("span");
  badge.className = "console-badge";
  badge.textContent = badges[level] || "·";
  const text = document.createElement("span");
  text.className = "console-text";
  text.textContent = args.map(formatVal).join(" ");
  const meta = document.createElement("span");
  meta.className = "console-meta";
  meta.textContent = ms + "ms";
  entry.appendChild(badge);
  entry.appendChild(text);
  if (level !== "system") entry.appendChild(meta);
  output.appendChild(entry);
  output.scrollTop = output.scrollHeight;
}

function runCode() {
  if (Object.values(nodes).some(n => TYPES[n.type]?.isEvent || TYPES[n.type]?.isGlobal)) {
    runInPreview();
    return;
  }
  const output = document.getElementById("run-output");
  output.innerHTML = "";
  document.getElementById("run-header-label").textContent = "running...";
  document.getElementById("run-dot").classList.remove("err");

  let code;
  try {
    code = compileCode();
  } catch (e) {
    appendConsoleEntry(output, "error", ["compile error: " + e.message], 0);
    document.getElementById("run-header-label").textContent = "compile error";
    document.getElementById("run-dot").classList.add("err");
    return;
  }

  const referencedIds = new Set();
  Object.values(nodes).forEach((n) => {
    if (n.type === "asset_ref" && n.f.id) referencedIds.add(n.f.id);
  });
  const assetsPayload = {};
  referencedIds.forEach((id) => {
    const a = assetCache[id];
    if (a)
      assetsPayload[id] = {
        id: a.id,
        name: a.name,
        kind: a.kind,
        data: a.data,
      };
  });

  const start = performance.now();

  const workerSrc = `
    const __assets = ${JSON.stringify(assetsPayload)};
    function __showHtmlPreview(html) { self.postMessage({ type: "html_preview", html }); }
    const _start = Date.now();
    const console = {
      log: (...a) => self.postMessage({ type: "log", level: "log", args: a, ms: Date.now() - _start }),
      error: (...a) => self.postMessage({ type: "log", level: "error", args: a, ms: Date.now() - _start }),
      warn: (...a) => self.postMessage({ type: "log", level: "warn", args: a, ms: Date.now() - _start }),
      info: (...a) => self.postMessage({ type: "log", level: "info", args: a, ms: Date.now() - _start }),
      table: (...a) => self.postMessage({ type: "log", level: "log", args: a, ms: Date.now() - _start }),
    };
    function alert(msg) { self.postMessage({ type: "log", level: "log", args: ["[alert] " + String(msg)], ms: Date.now() - _start }); }
    try {
      ${code}
      self.postMessage({ type: "done", ms: Date.now() - _start });
    } catch(e) {
      self.postMessage({ type: "error", msg: e.stack || e.message, ms: Date.now() - _start });
    }
  `;

  const blob = new Blob([workerSrc], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url);

  const timeout = setTimeout(() => {
    worker.terminate();
    URL.revokeObjectURL(url);
    const ms = Math.round(performance.now() - start);
    appendConsoleEntry(
      output,
      "error",
      ["execution timed out after 5s — infinite loop?"],
      ms,
    );
    document.getElementById("run-dot").classList.add("err");
    document.getElementById("run-header-label").textContent =
      "timed out " + ms + "ms";
  }, 5000);

  worker.addEventListener("message", (e) => {
    const d = e.data;
    if (d.type === "html_preview") {
      openHtmlPreview(d.html);
      return;
    }
    if (d.type === "log") {
      appendConsoleEntry(
        output,
        d.level,
        d.args.map((a) => {
          if (a === null) return "null";
          if (a === undefined) return "undefined";
          if (typeof a === "object") {
            try {
              return JSON.stringify(a, null, 2);
            } catch {
              return String(a);
            }
          }
          return String(a);
        }),
        d.ms,
      );
    } else if (d.type === "done") {
      clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(url);
      const ms = Math.round(performance.now() - start);
      document.getElementById("run-dot").classList.remove("err");
      document.getElementById("run-header-label").textContent =
        "finished in " + ms + "ms";
      if (output.querySelectorAll(".console-entry:not(.system)").length === 0)
        appendConsoleEntry(output, "system", ["(no output)"], ms);
    } else if (d.type === "error") {
      clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(url);
      const ms = Math.round(performance.now() - start);
      appendConsoleEntry(output, "error", [d.msg], d.ms);
      document.getElementById("run-dot").classList.add("err");
      document.getElementById("run-header-label").textContent =
        "finished with errors  " + ms + "ms";
    }
  });

  worker.addEventListener("error", (e) => {
    clearTimeout(timeout);
    worker.terminate();
    URL.revokeObjectURL(url);
    const ms = Math.round(performance.now() - start);
    appendConsoleEntry(output, "error", [e.message || "worker error"], ms);
    document.getElementById("run-dot").classList.add("err");
    document.getElementById("run-header-label").textContent =
      "finished with errors  " + ms + "ms";
  });
}

document.getElementById("run-btn").addEventListener("click", runCode);
document.getElementById("run-clear-btn").addEventListener("click", () => {
  document.getElementById("run-output").innerHTML = "";
});

function startLoader() {
  const bar = document.getElementById("loader-bar");
  const loader = document.getElementById("loader");
  const dur = 1000 + Math.random() * 4000;
  bar.style.transition = `width ${dur}ms linear`;
  requestAnimationFrame(() => {
    bar.style.width = "100%";
  });
  setTimeout(() => {
    loader.classList.add("done");
    setTimeout(() => loader.remove(), 450);
  }, dur);
}

function showCtx(x, y, title, rows) {
  const menu = document.getElementById("ctx-menu");
  const header = document.getElementById("ctx-header");
  const rowsEl = document.getElementById("ctx-rows");
  header.textContent = title;
  rowsEl.innerHTML = "";
  rows.forEach(([k, v]) => {
    const row = document.createElement("div");
    row.className = "ctx-row";
    row.innerHTML = `<span class="ctx-row-key">${k}</span><span class="ctx-row-val">${v}</span>`;
    rowsEl.appendChild(row);
  });
  menu.classList.add("open");
  const mw = 220,
    mh = menu.offsetHeight || 200;
  menu.style.left = (x + mw > window.innerWidth ? x - mw : x) + "px";
  menu.style.top = (y + mh > window.innerHeight ? y - mh : y) + "px";
}

function hideCtx() {
  document.getElementById("ctx-menu").classList.remove("open");
}

document.addEventListener("click", hideCtx);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") hideCtx();
});

document.addEventListener("contextmenu", (e) => {
  e.preventDefault();

  if (e.target.closest("#canvas-wrap")) {
    const target = e.target;

    if (target.classList.contains("port")) {
      const n = nodes[target.dataset.node];
      return showCtx(e.clientX, e.clientY, "port", [
        ["node", n?.type || "?"],
        ["id", target.dataset.port],
        ["dir", target.dataset.dir],
        ["live", target.classList.contains("live") ? "yes" : "no"],
      ]);
    }
    if (target.classList.contains("wire")) {
      const c = conns[target.dataset.cid];
      return (
        c &&
        showCtx(e.clientX, e.clientY, "wire", [
          ["from", nodes[c.fn]?.type || c.fn],
          ["out port", c.fp],
          ["to", nodes[c.tn]?.type || c.tn],
          ["in port", c.tp],
        ])
      );
    }
    const nodeEl = target.closest(".node");
    if (nodeEl) {
      const nid = nodeEl.id.replace("node-", "");
      const n = nodes[nid];
      const def = TYPES[n?.type];
      const rows = [
        ["type", n?.type || "?"],
        ["cat", def?.cat || "?"],
        ["id", nid],
        ["xy", `${Math.round(n?.x)}, ${Math.round(n?.y)}`],
        ["ins", def?.ins?.length ?? 0],
        ["outs", def?.outs?.length ?? 0],
      ];
      Object.entries(n?.f || {}).forEach(([k, v]) =>
        rows.push([k, String(v).slice(0, 28) || '""']),
      );
      return showCtx(e.clientX, e.clientY, def?.label || "node", rows);
    }
    return showCtx(e.clientX, e.clientY, "canvas", [
      ["nodes", Object.keys(nodes).length],
      ["wires", Object.keys(conns).length],
      ["zoom", Math.round(zoom * 100) + "%"],
      ["pan", `${Math.round(-pan.x / zoom)}, ${Math.round(-pan.y / zoom)}`],
    ]);
  }

  if (e.target.closest("#sidebar")) {
    const item = e.target.closest(".palette-item");
    if (item) {
      const label =
        item.querySelector(".palette-dot + *")?.textContent?.trim() || "";
      const type = Object.entries(TYPES).find(
        ([, d]) => d.label === label,
      )?.[0];
      const def = type ? TYPES[type] : null;
      if (def)
        return showCtx(e.clientX, e.clientY, def.label, [
          ["type", type],
          ["cat", def.cat],
          ["ins", def.ins.length],
          ["outs", def.outs.length],
          ["expr", def.expr ? "yes" : "no"],
          ["stmt", def.stmt ? "yes" : "no"],
        ]);
    }
    return showCtx(e.clientX, e.clientY, "palette", [
      ["tab", activeTab],
      ["total types", Object.keys(TYPES).length],
    ]);
  }

  if (e.target.closest("#toolbar")) {
    const btn = e.target.closest(".btn");
    return showCtx(
      e.clientX,
      e.clientY,
      btn ? "button" : "toolbar",
      btn
        ? [
            ["label", btn.textContent.trim()],
            ["id", btn.id || "—"],
          ]
        : [
            ["nodes", Object.keys(nodes).length],
            ["wires", Object.keys(conns).length],
            ["app", "cupcake visual js"],
          ],
    );
  }

  if (e.target.closest("#console-panel") || e.target.closest("#cat-corner")) {
    return showCtx(e.clientX, e.clientY, "console", [
      [
        "status",
        document.getElementById("run-header-label")?.textContent || "idle",
      ],
      [
        "entries",
        document.querySelectorAll(".console-entry:not(.system)").length,
      ],
    ]);
  }

  showCtx(e.clientX, e.clientY, "cupcake visual js", [
    ["nodes", Object.keys(nodes).length],
    ["wires", Object.keys(conns).length],
    ["zoom", Math.round(zoom * 100) + "%"],
  ]);
});

const consolePanel = document.getElementById("console-panel");
const resizeHandle = document.createElement("div");
resizeHandle.style.cssText =
  "position:absolute;top:-4px;left:0;right:0;height:8px;cursor:ns-resize;z-index:200;";
consolePanel.appendChild(resizeHandle);

let resizing = false,
  resizeStartY = 0,
  resizeStartH = 0;

resizeHandle.addEventListener("mousedown", (e) => {
  resizing = true;
  resizeStartY = e.clientY;
  resizeStartH = consolePanel.offsetHeight;
  e.preventDefault();
});

document.addEventListener("mousemove", (e) => {
  if (!resizing) return;
  const delta = resizeStartY - e.clientY;
  const newH = Math.max(
    80,
    Math.min(window.innerHeight - 100, resizeStartH + delta),
  );
  consolePanel.style.height = newH + "px";
  document.getElementById("canvas-wrap").style.bottom = newH + "px";
  document.getElementById("sidebar").style.bottom = newH + "px";
  document.getElementById("cat-corner").style.height = newH + "px";
  syncMinimapBottom();
});

document.addEventListener("mouseup", () => {
  if (resizing) savePanelSizes();
  resizing = false;
});

const sidebar = document.getElementById("sidebar");
const sideResizeHandle = document.createElement("div");
sideResizeHandle.style.cssText =
  "position:absolute;top:0;right:-4px;bottom:0;width:8px;cursor:ew-resize;z-index:200;";
sidebar.appendChild(sideResizeHandle);

let sideResizing = false,
  sideStartX = 0,
  sideStartW = 0;

sideResizeHandle.addEventListener("mousedown", (e) => {
  sideResizing = true;
  sideStartX = e.clientX;
  sideStartW = sidebar.offsetWidth;
  e.preventDefault();
});

document.addEventListener("mousemove", (e) => {
  if (!sideResizing) return;
  const newW = Math.max(
    140,
    Math.min(400, sideStartW + e.clientX - sideStartX),
  );
  sidebar.style.width = newW + "px";
  document.getElementById("canvas-wrap").style.left = newW + "px";
  document.getElementById("console-panel").style.left = newW + "px";
  document.getElementById("cat-corner").style.width = newW + "px";
  document.getElementById("hint").style.left = `calc(50% + ${newW / 2}px)`;
  document.getElementById("minimap").style.right = "0px";
});

document.addEventListener("mouseup", () => {
  if (sideResizing) savePanelSizes();
  sideResizing = false;
});

function savePanelSizes() {
  localStorage.setItem("cupcake_sidebar_w", sidebar.offsetWidth);
  localStorage.setItem("cupcake_console_h", consolePanel.offsetHeight);
}

function loadPanelSizes() {
  const sw = localStorage.getItem("cupcake_sidebar_w");
  const ch = localStorage.getItem("cupcake_console_h");
  if (sw) {
    const newW = parseInt(sw);
    sidebar.style.width = newW + "px";
    document.getElementById("canvas-wrap").style.left = newW + "px";
    document.getElementById("console-panel").style.left = newW + "px";
    document.getElementById("cat-corner").style.width = newW + "px";
    document.getElementById("hint").style.left = `calc(50% + ${newW / 2}px)`;
  }
  if (ch) {
    const newH = parseInt(ch);
    consolePanel.style.height = newH + "px";
    document.getElementById("canvas-wrap").style.bottom = newH + "px";
    document.getElementById("sidebar").style.bottom = newH + "px";
    document.getElementById("cat-corner").style.height = newH + "px";
  }
}

const cur = document.getElementById("cursor");
const curDot = document.getElementById("cursor-dot");

let mouseX = 0,
  mouseY = 0;
let curX = 0,
  curY = 0;
const ease = 0.16;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  curDot.style.left = mouseX + "px";
  curDot.style.top = mouseY + "px";
  const el = document.elementFromPoint(e.clientX, e.clientY);
  cur.className = "";
  if (!el) return;
  const computed = window.getComputedStyle(el).cursor;
  if (el.classList.contains("port")) {
    cur.classList.add("state-crosshair");
  } else if (
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.isContentEditable
  ) {
    cur.classList.add("state-text");
  } else if (
    el.classList.contains("frame-resize") ||
    computed === "se-resize"
  ) {
    cur.classList.add("state-se");
  } else if (computed === "ns-resize") {
    cur.classList.add("state-ns");
  } else if (computed === "ew-resize") {
    cur.classList.add("state-ew");
  } else if (
    el.tagName === "BUTTON" ||
    el.tagName === "SELECT" ||
    el.classList.contains("palette-item") ||
    el.classList.contains("stab") ||
    el.classList.contains("dd-row") ||
    el.classList.contains("search-row") ||
    el.classList.contains("nclose") ||
    el.classList.contains("wire") ||
    el.classList.contains("frame-delete")
  ) {
    cur.classList.add("state-pointer");
  } else if (
    el.classList.contains("node-head") ||
    computed === "grab" ||
    computed === "grabbing"
  ) {
    cur.classList.add("state-grab");
  }
});

(function loop() {
  curX += (mouseX - curX) * ease;
  curY += (mouseY - curY) * ease;
  cur.style.left = curX + "px";
  cur.style.top = curY + "px";
  requestAnimationFrame(loop);
})();

document.addEventListener("mousedown", () => cur.classList.add("big"));
document.addEventListener("mouseup", () => cur.classList.remove("big"));

let dragFrame = null,
  dragFrameStart = null,
  dragFrameOrigin = null,
  dragFrameNodeOrigins = null;
let resizeFrame = null,
  resizeFrameStart = null,
  resizeFrameOrigin = null;

function nodesInsideFrame(fid) {
  const f = frames[fid];
  return Object.values(nodes).filter(
    (n) =>
      n.x + 80 > f.x && n.x < f.x + f.w && n.y + 20 > f.y && n.y < f.y + f.h,
  );
}

function makeFrame(x, y, w, h) {
  snapshot();
  const id = uid();
  frames[id] = {
    id,
    x,
    y,
    w: Math.max(120, w),
    h: Math.max(80, h),
    label: "group",
  };
  renderFrame(id, true);
  return id;
}

function deleteFrame(id) {
  snapshot();
  delete frames[id];
  document.getElementById("frame-" + id)?.remove();
}

function renderFrame(id, snap = false) {
  const f = frames[id];
  const el = document.createElement("div");
  el.className = "frame";
  el.id = "frame-" + id;
  el.style.left = f.x + "px";
  el.style.top = f.y + "px";
  el.style.width = f.w + "px";
  el.style.height = f.h + "px";

  if (snap) {
    el.style.transform = "scale(0.96)";
    el.style.opacity = "0.4";
    el.style.transition =
      "transform 0.2s cubic-bezier(0.34,1.56,0.64,1), opacity 0.15s";
    requestAnimationFrame(() => {
      el.style.transform = "scale(1)";
      el.style.opacity = "1";
      setTimeout(() => {
        el.style.transition = "";
        el.style.transform = "";
      }, 220);
    });
  }

  const label = document.createElement("input");
  label.className = "frame-label";
  label.value = f.label;
  label.spellcheck = false;
  label.addEventListener("input", (e) => {
    f.label = e.target.value;
  });
  label.addEventListener("mousedown", (e) => e.stopPropagation());

  const del = document.createElement("button");
  del.className = "frame-delete";
  del.textContent = "×";
  del.addEventListener("click", (e) => {
    e.stopPropagation();
    deleteFrame(id);
  });

  const resizeHandle = document.createElement("div");
  resizeHandle.className = "frame-resize";
  resizeHandle.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    e.preventDefault();
    resizeFrame = id;
    resizeFrameStart = { x: e.clientX, y: e.clientY };
    resizeFrameOrigin = { w: f.w, h: f.h };
  });

  el.appendChild(label);
  el.appendChild(del);
  el.appendChild(resizeHandle);

  el.addEventListener("mousedown", (e) => {
    if (e.target === resizeHandle || e.target === label || e.target === del)
      return;
    e.stopPropagation();
    document
      .querySelectorAll(".frame")
      .forEach((f) => f.classList.remove("sel-frame"));
    el.classList.add("sel-frame");
    dragFrame = id;
    dragFrameStart = { x: e.clientX, y: e.clientY };
    dragFrameOrigin = { x: f.x, y: f.y };
    dragFrameNodeOrigins = {};
    nodesInsideFrame(id).forEach((n) => {
      dragFrameNodeOrigins[n.id] = { x: n.x, y: n.y };
    });
  });

  document
    .getElementById("canvas")
    .insertBefore(el, document.getElementById("canvas").firstChild);
}

// secret: shift + drag to make a frame
let drawingFrame = false,
  frameDrawStart = null,
  framePreview = null;

canvasWrap.addEventListener("mousedown", (e) => {
  if (e.button !== 0 || !e.shiftKey) return;
  if (
    e.target !== canvasWrap &&
    e.target.id !== "grid-bg" &&
    e.target.id !== "canvas" &&
    e.target.id !== "svg-overlay"
  )
    return;
  e.preventDefault();
  e.stopPropagation();
  drawingFrame = true;
  frameDrawStart = clientToCanvas(e.clientX, e.clientY);
  framePreview = document.createElement("div");
  framePreview.style.cssText = `position:absolute;border:1.5px dashed var(--accent2);border-radius:10px;background:rgba(212,184,122,0.05);pointer-events:none;z-index:2;`;
  framePreview.style.left = frameDrawStart.x + "px";
  framePreview.style.top = frameDrawStart.y + "px";
  framePreview.style.width = "0px";
  framePreview.style.height = "0px";
  document.getElementById("canvas").appendChild(framePreview);
});

function drawMinimap() {
  const canvas = document.getElementById("minimap-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = 140,
    H = 90;
  canvas.width = W;
  canvas.height = H;
  ctx.clearRect(0, 0, W, H);
  const nodeVals = Object.values(nodes);
  if (!nodeVals.length) return;
  const xs = nodeVals.map((n) => n.x);
  const ys = nodeVals.map((n) => n.y);
  const minX = Math.min(...xs) - 60,
    minY = Math.min(...ys) - 60;
  const maxX = Math.max(...xs) + 240,
    maxY = Math.max(...ys) + 140;
  const scale = Math.min(W / (maxX - minX), H / (maxY - minY)) * 0.88;
  const offX = (W - (maxX - minX) * scale) / 2 - minX * scale;
  const offY = (H - (maxY - minY) * scale) / 2 - minY * scale;
  nodeVals.forEach((n) => {
    const def = TYPES[n.type];
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = def?.col || "#303030";
    const x = n.x * scale + offX,
      y = n.y * scale + offY;
    const w = Math.max(4, 170 * scale),
      h = Math.max(2, 56 * scale);
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  const cw = document.getElementById("canvas-wrap").getBoundingClientRect();
  const vpX = (-pan.x / zoom) * scale + offX;
  const vpY = (-pan.y / zoom) * scale + offY;
  const vpW = (cw.width / zoom) * scale;
  const vpH = (cw.height / zoom) * scale;
  ctx.strokeStyle = "rgba(212,184,122,0.7)";
  ctx.lineWidth = 1;
  ctx.strokeRect(vpX, vpY, vpW, vpH);
  ctx.fillStyle = "rgba(212,184,122,0.05)";
  ctx.fillRect(vpX, vpY, vpW, vpH);
  canvas._s = scale;
  canvas._ox = offX;
  canvas._oy = offY;
}

function syncMinimapBottom() {
  const mm = document.getElementById("minimap");
  if (!mm) return;
  const panel = document.getElementById("console-panel");
  const isOpen = panel.classList.contains("open");
  const consoleH = isOpen ? panel.offsetHeight : 0;
  mm.style.bottom = consoleH + 8 + "px";
}

document.getElementById("minimap-canvas").addEventListener("click", (e) => {
  const canvas = e.target;
  if (!canvas._s) return;
  const r = canvas.getBoundingClientRect();
  const wx = (e.clientX - r.left - canvas._ox) / canvas._s;
  const wy = (e.clientY - r.top - canvas._oy) / canvas._s;
  const cw = document.getElementById("canvas-wrap").getBoundingClientRect();
  pan.x = cw.width / 2 - wx * zoom;
  pan.y = cw.height / 2 - wy * zoom;
  applyTransform();
  drawWires();
});

function toggleShortcuts() {
  const existing = document.getElementById("shortcuts-modal");
  if (existing) {
    existing.remove();
    return;
  }
  const overlay = document.createElement("div");
  overlay.className = "overlay open";
  overlay.id = "shortcuts-modal";
  overlay.innerHTML = `
    <div class="modal" style="width:480px">
      <div class="mtop">
        <span class="mtitle">keyboard shortcuts</span>
        <button class="mclose" onclick="document.getElementById('shortcuts-modal').remove()">✕</button>
      </div>
      <div class="mbody" style="column-count:2;column-gap:28px;padding:16px 20px">
        ${[
          ["canvas", ""],
          ["drag canvas", "pan"],
          ["scroll", "zoom"],
          ["shift + drag", "draw frame"],
          ["", ""],
          ["nodes", ""],
          ["click palette item", "add node"],
          ["drag node header", "move"],
          ["shift + click", "multi-select"],
          ["delete / backspace", "delete selected"],
          ["", ""],
          ["editing", ""],
          ["⌘/ctrl + z", "undo"],
          ["⌘/ctrl + shift+z", "redo"],
          ["⌘/ctrl + c", "copy"],
          ["⌘/ctrl + v", "paste"],
          ["⌘/ctrl + a", "select all"],
          ["", ""],
          ["search", ""],
          ["⌘/ctrl + f", "find on canvas"],
          ["⌘/ctrl + b", "quick add node"],
          ["escape", "cancel / close"],
          ["?", "this panel"],
        ]
          .map(([k, v]) =>
            k === ""
              ? `<div style="height:10px"></div>`
              : v === ""
                ? `<div style="font-size:9px;font-weight:600;letter-spacing:.8px;color:var(--cream3);text-transform:uppercase;padding:2px 0 4px">${k}</div>`
                : `<div style="display:flex;justify-content:space-between;gap:12px;padding:3px 0;font-size:11px;border-bottom:1px solid var(--b1)">
            <span style="font-family:'DM Mono',monospace;color:var(--accent)">${k}</span>
            <span style="color:var(--cream2)">${v}</span>
          </div>`,
          )
          .join("")}
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

document.getElementById("download-btn").addEventListener("click", () => {
  const cb = document.getElementById("modal-body").querySelector(".codebox");
  if (!cb) return;
  const blob = new Blob([cb.textContent], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cupcake-export.js";
  a.click();
  URL.revokeObjectURL(url);
  toast("downloaded!");
});

let findVisible = false;

function toggleFind() {
  if (searchVisible) hideSearch();
  findVisible = !findVisible;
  const bar = document.getElementById("find-bar");
  if (findVisible) {
    bar.classList.add("open");
    const inp = document.getElementById("find-input");
    inp.value = "";
    inp.focus();
    renderFindResults("");
  } else hideFind();
}

function hideFind() {
  findVisible = false;
  document.getElementById("find-bar").classList.remove("open");
  document.getElementById("find-results").innerHTML = "";
}

function renderFindResults(q) {
  const res = document.getElementById("find-results");
  res.innerHTML = "";
  const all = Object.values(nodes);
  if (!all.length) {
    const r = document.createElement("div");
    r.className = "search-row";
    r.style.color = "var(--cream3)";
    r.textContent = "canvas is empty";
    res.appendChild(r);
    return;
  }
  const lq = q.toLowerCase();
  const matches = all
    .filter((n) => {
      if (!q) return true;
      const def = TYPES[n.type];
      if (def?.label.toLowerCase().includes(lq)) return true;
      return Object.values(n.f || {}).some((v) =>
        String(v).toLowerCase().includes(lq),
      );
    })
    .slice(0, 12);
  if (!matches.length) {
    const r = document.createElement("div");
    r.className = "search-row";
    r.style.color = "var(--cream3)";
    r.textContent = "no matches";
    res.appendChild(r);
    return;
  }
  matches.forEach((n) => {
    const def = TYPES[n.type];
    const preview = Object.values(n.f || {}).find((v) => v)?.[0] || "";
    const hint = preview ? ` · ${String(preview).slice(0, 22)}` : "";
    const row = document.createElement("div");
    row.className = "search-row";
    row.innerHTML = `<span class="search-dot" style="background:${def?.col}"></span><span class="search-label">${def?.label || n.type}${hint}</span><span class="search-cat">${Math.round(n.x)}, ${Math.round(n.y)}</span>`;
    row.addEventListener("click", () => {
      jumpToNode(n.id);
      hideFind();
    });
    res.appendChild(row);
  });
}

function jumpToNode(id) {
  const n = nodes[id];
  if (!n) return;
  const cw = document.getElementById("canvas-wrap").getBoundingClientRect();
  pan.x = cw.width / 2 - n.x * zoom;
  pan.y = cw.height / 2 - n.y * zoom;
  applyTransform();
  drawWires();
  selectNode(id, false);
  const el = document.getElementById("node-" + id);
  if (!el) return;
  el.style.transition = "box-shadow 0.12s";
  el.style.boxShadow = "0 0 0 3px var(--accent), 0 8px 32px rgba(0,0,0,.6)";
  setTimeout(() => {
    el.style.boxShadow = "";
    setTimeout(() => (el.style.transition = ""), 300);
  }, 900);
}

document
  .getElementById("find-input")
  .addEventListener("input", (e) => renderFindResults(e.target.value.trim()));
document.getElementById("find-input").addEventListener("keydown", (e) => {
  if (e.key === "Escape") hideFind();
  if (e.key === "Enter") {
    const first = document.querySelector("#find-results .search-row");
    if (first) first.click();
  }
});

const CAT_FRAMES = [
  // meow <3
  (fly) =>
    `  /\\_/\\  ${fly[0]}\n ( ·ω· ) ${fly[1]}\n  (づ づ)${fly[2]}\n   |  |  ${fly[3]}`,
  (fly) =>
    `  /\\_/\\  ${fly[0]}\n ( °ω°) ${fly[1]}\n  (づ づ)${fly[2]}\n   |  |  ${fly[3]}`,
  (fly) =>
    `  /\\_/\\  ${fly[0]}\n ( ·ω·)=${fly[1]}\n  (づ  )${fly[2]}\n   |  |  ${fly[3]}`,
  (fly) =>
    `   /\\_/\\ ${fly[0]}\n  (°ω° ) ${fly[1]}\n   (づ づ)${fly[2]}\n    |  | ${fly[3]}`,
  (fly) =>
    `  /\\_/\\  ${fly[0]}\n =(·ω· ) ${fly[1]}\n  (  づ)${fly[2]}\n   |  |  ${fly[3]}`,
  (fly) =>
    `  /\\_/\\  ${fly[0]}\n ( ·ω·)↑ ${fly[1]}\n  /|  |  ${fly[2]}\n / |  |  ${fly[3]}`,
  (fly) =>
    ` /\\_/\\   ${fly[0]}\n(·ω· )↑  ${fly[1]}\n |  |    ${fly[2]}\n |  |    ${fly[3]}`,
  (fly) =>
    `  /\\_/\\ ✦${fly[0]}\n (xωx )  ${fly[1]}\n  (づ づ)${fly[2]}\n   |  |  ${fly[3]}`,
];

const SNEEZE_FRAMES = [
  "  /\\_/\\  \n ( ·ω· ) \n  (づ づ)\n   |  |  ",
  "  /\\_/\\  \n ( ·ω̃· ) \n  (づ づ)\n   |  |  ",
  "  /\\_/\\  \n ( >ω< ) \n  (づ づ)\n   |  |  ",
  "  /\\_/\\  \n ( >ω< ) \n  (づ づ)\n   |  |  ",
  "  /\\_/\\  \n (っAω`)っ\n  ~~     \n   achoo!",
  "  /\\_/\\  \n (っAω`)っ\n  ~~~    \n  *achoo*",
  "  /\\_/\\  \n ( ;ω; ) \n  (づ づ)\n   *snf* ",
  "  /\\_/\\  \n ( ·ω· ) \n  (づ づ)\n   |  |  ",
];

const FLY_PATHS = [
  ["✦", "  ", "  ", "  "],
  ["  ", "✦ ", "  ", "  "],
  ["  ", "  ", "✦ ", "  "],
  ["  ", "  ", "  ", "✦ "],
  ["  ", "  ", "✦ ", "  "],
  ["  ", "✦ ", "  ", "  "],
  ["✦ ", "  ", "  ", "  "],
];

let catFrame = 0;
let flyFrame = 0;
let catDir = 1;
let sneezing = false;
let sneezeFrame = 0;
let sneezeTimeout = null;

function scheduleSneeze() {
  const delay = 18000 + Math.random() * 42000;
  sneezeTimeout = setTimeout(() => {
    sneezing = true;
    sneezeFrame = 0;
  }, delay);
}

function tickCat() {
  const el = document.getElementById("cat-ascii");
  if (!el) return;

  if (sneezing) {
    el.textContent = SNEEZE_FRAMES[sneezeFrame];
    sneezeFrame++;
    if (sneezeFrame >= SNEEZE_FRAMES.length) {
      sneezing = false;
      sneezeFrame = 0;
      scheduleSneeze();
    }
    return;
  }

  flyFrame = (flyFrame + 1) % FLY_PATHS.length;
  catFrame = (catFrame + catDir + CAT_FRAMES.length) % CAT_FRAMES.length;
  if (catFrame === CAT_FRAMES.length - 1 || catFrame === 0) catDir *= -1;
  el.textContent = CAT_FRAMES[catFrame](FLY_PATHS[flyFrame]);
}

setInterval(tickCat, 320);
scheduleSneeze();

if (
  window.innerWidth < 768 ||
  /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
) {
  document.getElementById("mobile-block").style.display = "flex";
  document.getElementById("loader").remove();
} else {
  boot();
}

document
  .getElementById("assets-btn")
  .addEventListener("click", buildAssetPanel);

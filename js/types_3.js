// types_3.js
const TYPES_3 = {
  global_var: {
    label: "global variable",
    cat: "events",
    col: "var(--col-event)",
    fields: [
      { id: "kind", label: "kind", kind: "select", opts: ["let", "const", "var"], def: "let" },
      { id: "name", label: "name", kind: "text", def: "myVar" },
      { id: "init", label: "initial value", kind: "text", def: "0" },
    ],
    ins: [],
    outs: [{ id: "ref", label: "ref" }],
    expr: false,
    stmt: false,
    isGlobal: true,
    ref: (n) => n.f.name || "myVar",
  },

  var_get: {
    label: "get var",
    cat: "events",
    col: "var(--col-event)",
    fields: [{ id: "name", label: "name", kind: "text", def: "myVar" }],
    ins: [],
    outs: [{ id: "out", label: "value" }],
    expr: true,
    gen: (n) => n.f.name || "myVar",
  },

  var_set: {
    label: "set var",
    cat: "events",
    col: "var(--col-event)",
    fields: [{ id: "name", label: "name", kind: "text", def: "myVar" }],
    ins: [{ id: "val", label: "value" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `${n.f.name || "myVar"} = ${ge(n.id, "val")};`,
  },

  on_domready: {
    label: "on dom ready",
    cat: "events",
    col: "var(--col-event)",
    fields: [],
    ins: [],
    outs: [],
    execOuts: [{ id: "__exec_out", label: "then" }],
    expr: false,
    stmt: false,
    isEvent: true,
    compileEvent: (n, ge, body) =>
      `document.addEventListener("DOMContentLoaded", () => {\n${body}\n});`,
  },

  on_click: {
    label: "on click",
    cat: "events",
    col: "var(--col-event)",
    fields: [
      { id: "sel", label: "selector", kind: "text", def: "button" },
      { id: "multi", label: "mode", kind: "select", opts: ["single", "all"], def: "single" },
    ],
    ins: [],
    outs: [],
    execOuts: [{ id: "__exec_out", label: "then" }],
    expr: false,
    stmt: false,
    isEvent: true,
    compileEvent: (n, ge, body) => {
      const sel = n.f.sel || "button";
      if (n.f.multi === "all") {
        return `document.querySelectorAll("${sel}").forEach(__el => __el.addEventListener("click", (__event) => {\nconst __target = __event.target;\n${body}\n}));`;
      }
      return `const __el_${n.id} = document.querySelector("${sel}");\nif (__el_${n.id}) __el_${n.id}.addEventListener("click", (__event) => {\nconst __target = __event.target;\n${body}\n});`;
    },
  },

  on_dblclick: {
    label: "on dblclick",
    cat: "events",
    col: "var(--col-event)",
    fields: [{ id: "sel", label: "selector", kind: "text", def: "button" }],
    ins: [],
    outs: [],
    execOuts: [{ id: "__exec_out", label: "then" }],
    expr: false,
    stmt: false,
    isEvent: true,
    compileEvent: (n, ge, body) => {
      const sel = n.f.sel || "button";
      return `const __el_${n.id} = document.querySelector("${sel}");\nif (__el_${n.id}) __el_${n.id}.addEventListener("dblclick", (__event) => {\nconst __target = __event.target;\n${body}\n});`;
    },
  },

  on_input: {
    label: "on input",
    cat: "events",
    col: "var(--col-event)",
    fields: [{ id: "sel", label: "selector", kind: "text", def: "input" }],
    ins: [],
    outs: [],
    execOuts: [{ id: "__exec_out", label: "then" }],
    expr: false,
    stmt: false,
    isEvent: true,
    compileEvent: (n, ge, body) => {
      const sel = n.f.sel || "input";
      return `const __el_${n.id} = document.querySelector("${sel}");\nif (__el_${n.id}) __el_${n.id}.addEventListener("input", (__event) => {\nconst __value = __event.target.value;\nconst __target = __event.target;\n${body}\n});`;
    },
  },

  on_change: {
    label: "on change",
    cat: "events",
    col: "var(--col-event)",
    fields: [{ id: "sel", label: "selector", kind: "text", def: "select" }],
    ins: [],
    outs: [],
    execOuts: [{ id: "__exec_out", label: "then" }],
    expr: false,
    stmt: false,
    isEvent: true,
    compileEvent: (n, ge, body) => {
      const sel = n.f.sel || "select";
      return `const __el_${n.id} = document.querySelector("${sel}");\nif (__el_${n.id}) __el_${n.id}.addEventListener("change", (__event) => {\nconst __value = __event.target.value;\nconst __target = __event.target;\n${body}\n});`;
    },
  },

  on_keydown: {
    label: "on keydown",
    cat: "events",
    col: "var(--col-event)",
    fields: [{ id: "key", label: "key filter (empty = any)", kind: "text", def: "" }],
    ins: [],
    outs: [],
    execOuts: [{ id: "__exec_out", label: "then" }],
    expr: false,
    stmt: false,
    isEvent: true,
    compileEvent: (n, ge, body) => {
      const filter = n.f.key ? `if (__event.key !== "${n.f.key}") return;\n` : "";
      return `document.addEventListener("keydown", (__event) => {\nconst __key = __event.key;\nconst __keyCode = __event.code;\n${filter}${body}\n});`;
    },
  },

  on_keyup: {
    label: "on keyup",
    cat: "events",
    col: "var(--col-event)",
    fields: [{ id: "key", label: "key filter (empty = any)", kind: "text", def: "" }],
    ins: [],
    outs: [],
    execOuts: [{ id: "__exec_out", label: "then" }],
    expr: false,
    stmt: false,
    isEvent: true,
    compileEvent: (n, ge, body) => {
      const filter = n.f.key ? `if (__event.key !== "${n.f.key}") return;\n` : "";
      return `document.addEventListener("keyup", (__event) => {\nconst __key = __event.key;\nconst __keyCode = __event.code;\n${filter}${body}\n});`;
    },
  },

  on_mousemove: {
    label: "on mousemove",
    cat: "events",
    col: "var(--col-event)",
    fields: [{ id: "sel", label: "target (empty = window)", kind: "text", def: "" }],
    ins: [],
    outs: [],
    execOuts: [{ id: "__exec_out", label: "then" }],
    expr: false,
    stmt: false,
    isEvent: true,
    compileEvent: (n, ge, body) => {
      const target = n.f.sel ? `document.querySelector("${n.f.sel}")` : "window";
      return `${target}.addEventListener("mousemove", (__event) => {\nconst __mouseX = __event.clientX;\nconst __mouseY = __event.clientY;\n${body}\n});`;
    },
  },

  on_scroll: {
    label: "on scroll",
    cat: "events",
    col: "var(--col-event)",
    fields: [{ id: "sel", label: "target (empty = window)", kind: "text", def: "" }],
    ins: [],
    outs: [],
    execOuts: [{ id: "__exec_out", label: "then" }],
    expr: false,
    stmt: false,
    isEvent: true,
    compileEvent: (n, ge, body) => {
      const target = n.f.sel ? `document.querySelector("${n.f.sel}")` : "window";
      return `${target}.addEventListener("scroll", () => {\nconst __scrollX = window.scrollX;\nconst __scrollY = window.scrollY;\n${body}\n});`;
    },
  },

  on_resize: {
    label: "on resize",
    cat: "events",
    col: "var(--col-event)",
    fields: [],
    ins: [],
    outs: [],
    execOuts: [{ id: "__exec_out", label: "then" }],
    expr: false,
    stmt: false,
    isEvent: true,
    compileEvent: (n, ge, body) =>
      `window.addEventListener("resize", () => {\nconst __winW = window.innerWidth;\nconst __winH = window.innerHeight;\n${body}\n});`,
  },

  on_interval: {
    label: "on interval",
    cat: "events",
    col: "var(--col-event)",
    fields: [{ id: "ms", label: "ms", kind: "number", def: "1000" }],
    ins: [],
    outs: [],
    execOuts: [{ id: "__exec_out", label: "tick" }],
    expr: false,
    stmt: false,
    isEvent: true,
    compileEvent: (n, ge, body) =>
      `let __tick_${n.id} = 0;\nsetInterval(() => {\nconst __tick = __tick_${n.id}++;\n${body}\n}, ${n.f.ms || "1000"});`,
  },

  on_animationframe: {
    label: "on animation frame",
    cat: "events",
    col: "var(--col-event)",
    fields: [],
    ins: [],
    outs: [],
    execOuts: [{ id: "__exec_out", label: "tick" }],
    expr: false,
    stmt: false,
    isEvent: true,
    compileEvent: (n, ge, body) =>
      `function __raf_${n.id}(__time) {\nconst __animTime = __time;\n${body}\nrequestAnimationFrame(__raf_${n.id});\n}\nrequestAnimationFrame(__raf_${n.id});`,
  },

  ev_key: {
    label: "event key",
    cat: "events",
    col: "var(--col-event)",
    fields: [],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: () => "__key",
  },

  ev_keycode: {
    label: "event keycode",
    cat: "events",
    col: "var(--col-event)",
    fields: [],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: () => "__keyCode",
  },

  ev_value: {
    label: "event value",
    cat: "events",
    col: "var(--col-event)",
    fields: [],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: () => "__value",
  },

  ev_target: {
    label: "event target",
    cat: "events",
    col: "var(--col-event)",
    fields: [],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: () => "__target",
  },

  ev_mouse_x: {
    label: "mouse x",
    cat: "events",
    col: "var(--col-event)",
    fields: [],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: () => "__mouseX",
  },

  ev_mouse_y: {
    label: "mouse y",
    cat: "events",
    col: "var(--col-event)",
    fields: [],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: () => "__mouseY",
  },

  ev_scroll_x: {
    label: "scroll x",
    cat: "events",
    col: "var(--col-event)",
    fields: [],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: () => "__scrollX",
  },

  ev_scroll_y: {
    label: "scroll y",
    cat: "events",
    col: "var(--col-event)",
    fields: [],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: () => "__scrollY",
  },

  ev_tick: {
    label: "tick count",
    cat: "events",
    col: "var(--col-event)",
    fields: [],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: () => "__tick",
  },

  ev_anim_time: {
    label: "anim time",
    cat: "events",
    col: "var(--col-event)",
    fields: [],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: () => "__animTime",
  },

  ev_win_w: {
    label: "window width",
    cat: "events",
    col: "var(--col-event)",
    fields: [],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: () => "window.innerWidth",
  },

  ev_win_h: {
    label: "window height",
    cat: "events",
    col: "var(--col-event)",
    fields: [],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: () => "window.innerHeight",
  },

  canvas_ctx: {
    label: "get 2d context",
    cat: "canvas",
    col: "var(--col-canvas)",
    fields: [{ id: "sel", label: "canvas selector", kind: "text", def: "#canvas" }],
    ins: [],
    outs: [{ id: "out", label: "ctx" }],
    expr: true,
    gen: (n) => `document.querySelector("${n.f.sel || "#canvas"}").getContext("2d")`,
  },

  canvas_clear: {
    label: "clear canvas",
    cat: "canvas",
    col: "var(--col-canvas)",
    fields: [],
    ins: [{ id: "ctx", label: "ctx" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => {
      const ctx = ge(n.id, "ctx");
      return `${ctx}.clearRect(0, 0, ${ctx}.canvas.width, ${ctx}.canvas.height);`;
    },
  },

  canvas_fill_rect: {
    label: "fill rect",
    cat: "canvas",
    col: "var(--col-canvas)",
    fields: [],
    ins: [
      { id: "ctx", label: "ctx" },
      { id: "x", label: "x" },
      { id: "y", label: "y" },
      { id: "w", label: "w" },
      { id: "h", label: "h" },
    ],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) =>
      `${ge(n.id, "ctx")}.fillRect(${ge(n.id, "x")}, ${ge(n.id, "y")}, ${ge(n.id, "w")}, ${ge(n.id, "h")});`,
  },

  canvas_stroke_rect: {
    label: "stroke rect",
    cat: "canvas",
    col: "var(--col-canvas)",
    fields: [],
    ins: [
      { id: "ctx", label: "ctx" },
      { id: "x", label: "x" },
      { id: "y", label: "y" },
      { id: "w", label: "w" },
      { id: "h", label: "h" },
    ],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) =>
      `${ge(n.id, "ctx")}.strokeRect(${ge(n.id, "x")}, ${ge(n.id, "y")}, ${ge(n.id, "w")}, ${ge(n.id, "h")});`,
  },

  canvas_fill_text: {
    label: "fill text",
    cat: "canvas",
    col: "var(--col-canvas)",
    fields: [],
    ins: [
      { id: "ctx", label: "ctx" },
      { id: "text", label: "text" },
      { id: "x", label: "x" },
      { id: "y", label: "y" },
    ],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) =>
      `${ge(n.id, "ctx")}.fillText(${ge(n.id, "text")}, ${ge(n.id, "x")}, ${ge(n.id, "y")});`,
  },

  canvas_begin_path: {
    label: "begin path",
    cat: "canvas",
    col: "var(--col-canvas)",
    fields: [],
    ins: [{ id: "ctx", label: "ctx" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `${ge(n.id, "ctx")}.beginPath();`,
  },

  canvas_close_path: {
    label: "close path",
    cat: "canvas",
    col: "var(--col-canvas)",
    fields: [],
    ins: [{ id: "ctx", label: "ctx" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `${ge(n.id, "ctx")}.closePath();`,
  },

  canvas_move_to: {
    label: "move to",
    cat: "canvas",
    col: "var(--col-canvas)",
    fields: [],
    ins: [
      { id: "ctx", label: "ctx" },
      { id: "x", label: "x" },
      { id: "y", label: "y" },
    ],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `${ge(n.id, "ctx")}.moveTo(${ge(n.id, "x")}, ${ge(n.id, "y")});`,
  },

  canvas_line_to: {
    label: "line to",
    cat: "canvas",
    col: "var(--col-canvas)",
    fields: [],
    ins: [
      { id: "ctx", label: "ctx" },
      { id: "x", label: "x" },
      { id: "y", label: "y" },
    ],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `${ge(n.id, "ctx")}.lineTo(${ge(n.id, "x")}, ${ge(n.id, "y")});`,
  },

  canvas_arc: {
    label: "arc",
    cat: "canvas",
    col: "var(--col-canvas)",
    fields: [
      { id: "start", label: "start angle", kind: "number", def: "0" },
      { id: "end", label: "end angle", kind: "number", def: "6.28" },
    ],
    ins: [
      { id: "ctx", label: "ctx" },
      { id: "x", label: "x" },
      { id: "y", label: "y" },
      { id: "r", label: "radius" },
    ],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) =>
      `${ge(n.id, "ctx")}.arc(${ge(n.id, "x")}, ${ge(n.id, "y")}, ${ge(n.id, "r")}, ${n.f.start || "0"}, ${n.f.end || "6.28"});`,
  },

  canvas_fill: {
    label: "fill",
    cat: "canvas",
    col: "var(--col-canvas)",
    fields: [],
    ins: [{ id: "ctx", label: "ctx" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `${ge(n.id, "ctx")}.fill();`,
  },

  canvas_stroke: {
    label: "stroke",
    cat: "canvas",
    col: "var(--col-canvas)",
    fields: [],
    ins: [{ id: "ctx", label: "ctx" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `${ge(n.id, "ctx")}.stroke();`,
  },

  canvas_set_fill: {
    label: "set fill style",
    cat: "canvas",
    col: "var(--col-canvas)",
    fields: [{ id: "color", label: "color", kind: "text", def: "#ffffff" }],
    ins: [
      { id: "ctx", label: "ctx" },
      { id: "color_in", label: "color (wired)" },
    ],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => {
      const c = Object.values(conns).find(c => c.tn === n.id && c.tp === "color_in");
      return `${ge(n.id, "ctx")}.fillStyle = ${c ? ge(n.id, "color_in") : `"${n.f.color || "#ffffff"}"`};`;
    },
  },

  canvas_set_stroke: {
    label: "set stroke style",
    cat: "canvas",
    col: "var(--col-canvas)",
    fields: [{ id: "color", label: "color", kind: "text", def: "#ffffff" }],
    ins: [
      { id: "ctx", label: "ctx" },
      { id: "color_in", label: "color (wired)" },
    ],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => {
      const c = Object.values(conns).find(c => c.tn === n.id && c.tp === "color_in");
      return `${ge(n.id, "ctx")}.strokeStyle = ${c ? ge(n.id, "color_in") : `"${n.f.color || "#ffffff"}"`};`;
    },
  },

  canvas_set_linewidth: {
    label: "set line width",
    cat: "canvas",
    col: "var(--col-canvas)",
    fields: [{ id: "w", label: "width", kind: "number", def: "1" }],
    ins: [
      { id: "ctx", label: "ctx" },
      { id: "w_in", label: "width (wired)" },
    ],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => {
      const c = Object.values(conns).find(c => c.tn === n.id && c.tp === "w_in");
      return `${ge(n.id, "ctx")}.lineWidth = ${c ? ge(n.id, "w_in") : (n.f.w || "1")};`;
    },
  },

  canvas_set_font: {
    label: "set font",
    cat: "canvas",
    col: "var(--col-canvas)",
    fields: [{ id: "font", label: "font", kind: "text", def: "16px sans-serif" }],
    ins: [
      { id: "ctx", label: "ctx" },
      { id: "font_in", label: "font (wired)" },
    ],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => {
      const c = Object.values(conns).find(c => c.tn === n.id && c.tp === "font_in");
      return `${ge(n.id, "ctx")}.font = ${c ? ge(n.id, "font_in") : `"${n.f.font || "16px sans-serif"}"`};`;
    },
  },

  canvas_set_alpha: {
    label: "set alpha",
    cat: "canvas",
    col: "var(--col-canvas)",
    fields: [],
    ins: [
      { id: "ctx", label: "ctx" },
      { id: "alpha", label: "alpha (0-1)" },
    ],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `${ge(n.id, "ctx")}.globalAlpha = ${ge(n.id, "alpha")};`,
  },

  canvas_save: {
    label: "save",
    cat: "canvas",
    col: "var(--col-canvas)",
    fields: [],
    ins: [{ id: "ctx", label: "ctx" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `${ge(n.id, "ctx")}.save();`,
  },

  canvas_restore: {
    label: "restore",
    cat: "canvas",
    col: "var(--col-canvas)",
    fields: [],
    ins: [{ id: "ctx", label: "ctx" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `${ge(n.id, "ctx")}.restore();`,
  },

  canvas_translate: {
    label: "translate",
    cat: "canvas",
    col: "var(--col-canvas)",
    fields: [],
    ins: [
      { id: "ctx", label: "ctx" },
      { id: "x", label: "x" },
      { id: "y", label: "y" },
    ],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `${ge(n.id, "ctx")}.translate(${ge(n.id, "x")}, ${ge(n.id, "y")});`,
  },

  canvas_rotate: {
    label: "rotate",
    cat: "canvas",
    col: "var(--col-canvas)",
    fields: [],
    ins: [
      { id: "ctx", label: "ctx" },
      { id: "angle", label: "angle (rad)" },
    ],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `${ge(n.id, "ctx")}.rotate(${ge(n.id, "angle")});`,
  },

  canvas_scale: {
    label: "scale",
    cat: "canvas",
    col: "var(--col-canvas)",
    fields: [],
    ins: [
      { id: "ctx", label: "ctx" },
      { id: "x", label: "sx" },
      { id: "y", label: "sy" },
    ],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `${ge(n.id, "ctx")}.scale(${ge(n.id, "x")}, ${ge(n.id, "y")});`,
  },

  canvas_w: {
    label: "canvas width",
    cat: "canvas",
    col: "var(--col-canvas)",
    fields: [{ id: "sel", label: "selector", kind: "text", def: "#canvas" }],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n) => `document.querySelector("${n.f.sel || "#canvas"}").width`,
  },

  canvas_h: {
    label: "canvas height",
    cat: "canvas",
    col: "var(--col-canvas)",
    fields: [{ id: "sel", label: "selector", kind: "text", def: "#canvas" }],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n) => `document.querySelector("${n.f.sel || "#canvas"}").height`,
  },
};

Object.assign(TYPES, TYPES_3);

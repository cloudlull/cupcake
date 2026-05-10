const TYPES = {
  string: {
    label: "string",
    cat: "values",
    col: "var(--col-val)",
    fields: [{ id: "v", label: "value", kind: "text", def: "hello" }],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) =>
      `"${(n.f.v || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`,
  },
  number: {
    label: "number",
    cat: "values",
    col: "var(--col-val)",
    fields: [{ id: "v", label: "value", kind: "number", def: "0" }],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${n.f.v || "0"}`,
  },
  boolean: {
    label: "boolean",
    cat: "values",
    col: "var(--col-val)",
    fields: [
      {
        id: "v",
        label: "value",
        kind: "select",
        opts: ["true", "false"],
        def: "true",
      },
    ],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${n.f.v || "true"}`,
  },
  null_val: {
    label: "null",
    cat: "values",
    col: "var(--col-val)",
    fields: [],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: () => "null",
  },
  undefined_val: {
    label: "undefined",
    cat: "values",
    col: "var(--col-val)",
    fields: [],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: () => "undefined",
  },
  variable: {
    label: "variable",
    cat: "variables",
    col: "var(--col-var)",
    fields: [
      {
        id: "kind",
        label: "kind",
        kind: "select",
        opts: ["let", "const", "var"],
        def: "let",
      },
      { id: "name", label: "name", kind: "text", def: "x" },
    ],
    ins: [{ id: "val", label: "value" }],
    outs: [{ id: "ref", label: "ref" }],
    expr: false,
    stmt: true,
    gen: (n, ge) =>
      `${n.f.kind || "let"} ${n.f.name || "x"} = ${ge(n.id, "val")};`,
    ref: (n) => n.f.name || "x",
  },
  assign: {
    label: "assign",
    cat: "variables",
    col: "var(--col-var)",
    fields: [{ id: "name", label: "variable name", kind: "text", def: "x" }],
    ins: [{ id: "val", label: "value" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `${n.f.name || "x"} = ${ge(n.id, "val")};`,
  },
  add: {
    label: "add",
    cat: "math",
    col: "var(--col-math)",
    fields: [],
    ins: [
      { id: "a", label: "a" },
      { id: "b", label: "b" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `(${ge(n.id, "a")} + ${ge(n.id, "b")})`,
  },
  subtract: {
    label: "subtract",
    cat: "math",
    col: "var(--col-math)",
    fields: [],
    ins: [
      { id: "a", label: "a" },
      { id: "b", label: "b" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `(${ge(n.id, "a")} - ${ge(n.id, "b")})`,
  },
  multiply: {
    label: "multiply",
    cat: "math",
    col: "var(--col-math)",
    fields: [],
    ins: [
      { id: "a", label: "a" },
      { id: "b", label: "b" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `(${ge(n.id, "a")} * ${ge(n.id, "b")})`,
  },
  divide: {
    label: "divide",
    cat: "math",
    col: "var(--col-math)",
    fields: [],
    ins: [
      { id: "a", label: "a" },
      { id: "b", label: "b" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `(${ge(n.id, "a")} / ${ge(n.id, "b")})`,
  },
  modulo: {
    label: "modulo",
    cat: "math",
    col: "var(--col-math)",
    fields: [],
    ins: [
      { id: "a", label: "a" },
      { id: "b", label: "b" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `(${ge(n.id, "a")} % ${ge(n.id, "b")})`,
  },
  power: {
    label: "power",
    cat: "math",
    col: "var(--col-math)",
    fields: [],
    ins: [
      { id: "a", label: "base" },
      { id: "b", label: "exp" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `Math.pow(${ge(n.id, "a")}, ${ge(n.id, "b")})`,
  },
  abs: {
    label: "abs",
    cat: "math",
    col: "var(--col-math)",
    fields: [],
    ins: [{ id: "a", label: "value" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `Math.abs(${ge(n.id, "a")})`,
  },
  floor: {
    label: "floor",
    cat: "math",
    col: "var(--col-math)",
    fields: [],
    ins: [{ id: "a", label: "value" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `Math.floor(${ge(n.id, "a")})`,
  },
  ceil: {
    label: "ceil",
    cat: "math",
    col: "var(--col-math)",
    fields: [],
    ins: [{ id: "a", label: "value" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `Math.ceil(${ge(n.id, "a")})`,
  },
  round: {
    label: "round",
    cat: "math",
    col: "var(--col-math)",
    fields: [],
    ins: [{ id: "a", label: "value" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `Math.round(${ge(n.id, "a")})`,
  },
  random: {
    label: "random",
    cat: "math",
    col: "var(--col-math)",
    fields: [],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: () => `Math.random()`,
  },
  min: {
    label: "min",
    cat: "math",
    col: "var(--col-math)",
    fields: [],
    ins: [
      { id: "a", label: "a" },
      { id: "b", label: "b" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `Math.min(${ge(n.id, "a")}, ${ge(n.id, "b")})`,
  },
  max: {
    label: "max",
    cat: "math",
    col: "var(--col-math)",
    fields: [],
    ins: [
      { id: "a", label: "a" },
      { id: "b", label: "b" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `Math.max(${ge(n.id, "a")}, ${ge(n.id, "b")})`,
  },
  compare: {
    label: "compare",
    cat: "logic",
    col: "var(--col-logic)",
    fields: [
      {
        id: "op",
        label: "operator",
        kind: "select",
        opts: ["===", "!==", "<", ">", "<=", ">="],
        def: "===",
      },
    ],
    ins: [
      { id: "a", label: "a" },
      { id: "b", label: "b" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `(${ge(n.id, "a")} ${n.f.op || "==="} ${ge(n.id, "b")})`,
  },
  and: {
    label: "and",
    cat: "logic",
    col: "var(--col-logic)",
    fields: [],
    ins: [
      { id: "a", label: "a" },
      { id: "b", label: "b" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `(${ge(n.id, "a")} && ${ge(n.id, "b")})`,
  },
  or: {
    label: "or",
    cat: "logic",
    col: "var(--col-logic)",
    fields: [],
    ins: [
      { id: "a", label: "a" },
      { id: "b", label: "b" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `(${ge(n.id, "a")} || ${ge(n.id, "b")})`,
  },
  not: {
    label: "not",
    cat: "logic",
    col: "var(--col-logic)",
    fields: [],
    ins: [{ id: "a", label: "a" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `(!${ge(n.id, "a")})`,
  },
  nullish: {
    label: "nullish (??)",
    cat: "logic",
    col: "var(--col-logic)",
    fields: [],
    ins: [
      { id: "a", label: "value" },
      { id: "b", label: "fallback" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `(${ge(n.id, "a")} ?? ${ge(n.id, "b")})`,
  },
  ternary: {
    label: "if / else",
    cat: "control",
    col: "var(--col-flow)",
    fields: [],
    ins: [
      { id: "cond", label: "condition" },
      { id: "then", label: "then" },
      { id: "else", label: "else" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) =>
      `(${ge(n.id, "cond")} ? ${ge(n.id, "then")} : ${ge(n.id, "else")})`,
  },
  if_stmt: {
    label: "if statement",
    cat: "control",
    col: "var(--col-flow)",
    fields: [
      { id: "body", label: "body (raw js)", kind: "text", def: "// body here" },
    ],
    ins: [{ id: "cond", label: "condition" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `if (${ge(n.id, "cond")}) {\n  ${n.f.body || ""}\n}`,
  },
  for_loop: {
    label: "for loop",
    cat: "control",
    col: "var(--col-flow)",
    fields: [
      { id: "init", label: "init", kind: "text", def: "let i = 0" },
      { id: "cond", label: "condition", kind: "text", def: "i < 10" },
      { id: "update", label: "update", kind: "text", def: "i++" },
      { id: "body", label: "body", kind: "text", def: "console.log(i)" },
    ],
    ins: [],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n) =>
      `for (${n.f.init || ""}; ${n.f.cond || ""}; ${n.f.update || ""}) {\n  ${n.f.body || ""}\n}`,
  },
  while_loop: {
    label: "while loop",
    cat: "control",
    col: "var(--col-flow)",
    fields: [{ id: "body", label: "body", kind: "text", def: "" }],
    ins: [{ id: "cond", label: "condition" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `while (${ge(n.id, "cond")}) {\n  ${n.f.body || ""}\n}`,
  },
  switch_stmt: {
    label: "switch",
    cat: "control",
    col: "var(--col-flow)",
    fields: [
      {
        id: "cases",
        label: "cases (raw js)",
        kind: "text",
        def: "case 'a': break;",
      },
    ],
    ins: [{ id: "val", label: "value" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `switch (${ge(n.id, "val")}) {\n  ${n.f.cases || ""}\n}`,
  },
  try_catch: {
    label: "try / catch",
    cat: "control",
    col: "var(--col-flow)",
    fields: [
      { id: "try_body", label: "try body", kind: "text", def: "" },
      { id: "catch_var", label: "catch var", kind: "text", def: "err" },
      {
        id: "catch_body",
        label: "catch body",
        kind: "text",
        def: "console.error(err)",
      },
    ],
    ins: [],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n) =>
      `try {\n  ${n.f.try_body || ""}\n} catch (${n.f.catch_var || "err"}) {\n  ${n.f.catch_body || ""}\n}`,
  },
  func: {
    label: "function",
    cat: "functions",
    col: "var(--col-fn)",
    fields: [
      { id: "name", label: "name", kind: "text", def: "myFn" },
      { id: "params", label: "params (comma sep)", kind: "text", def: "" },
    ],
    ins: [{ id: "body", label: "return value" }],
    outs: [{ id: "ref", label: "ref" }],
    expr: false,
    stmt: true,
    gen: (n, ge) =>
      `function ${n.f.name || "myFn"}(${n.f.params || ""}) {\n  return ${ge(n.id, "body")};\n}`,
    ref: (n) => n.f.name || "myFn",
  },
  arrow_fn: {
    label: "arrow fn",
    cat: "functions",
    col: "var(--col-fn)",
    fields: [
      { id: "name", label: "name", kind: "text", def: "myFn" },
      { id: "params", label: "params", kind: "text", def: "" },
    ],
    ins: [{ id: "body", label: "return value" }],
    outs: [{ id: "ref", label: "ref" }],
    expr: false,
    stmt: true,
    gen: (n, ge) =>
      `const ${n.f.name || "myFn"} = (${n.f.params || ""}) => ${ge(n.id, "body")};`,
    ref: (n) => n.f.name || "myFn",
  },
  call: {
    label: "call",
    cat: "functions",
    col: "var(--col-fn)",
    fields: [{ id: "fn", label: "function name", kind: "text", def: "myFn" }],
    ins: [
      { id: "a0", label: "arg 1" },
      { id: "a1", label: "arg 2" },
      { id: "a2", label: "arg 3" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => {
      const args = ["a0", "a1", "a2"]
        .map((a) => {
          const c = Object.values(conns).find(
            (c) => c.tn === n.id && c.tp === a,
          );
          return c ? ge(n.id, a) : null;
        })
        .filter(Boolean);
      return `${n.f.fn || "myFn"}(${args.join(", ")})`;
    },
  },
  method_call: {
    label: "method call",
    cat: "functions",
    col: "var(--col-fn)",
    fields: [{ id: "method", label: "method", kind: "text", def: "toString" }],
    ins: [
      { id: "obj", label: "object" },
      { id: "a0", label: "arg 1" },
      { id: "a1", label: "arg 2" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => {
      const args = ["a0", "a1"]
        .map((a) => {
          const c = Object.values(conns).find(
            (c) => c.tn === n.id && c.tp === a,
          );
          return c ? ge(n.id, a) : null;
        })
        .filter(Boolean);
      return `${ge(n.id, "obj")}.${n.f.method || "toString"}(${args.join(", ")})`;
    },
  },
  ret: {
    label: "return",
    cat: "functions",
    col: "var(--col-fn)",
    fields: [],
    ins: [{ id: "val", label: "value" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `return ${ge(n.id, "val")};`,
  },
  str_concat: {
    label: "concat",
    cat: "strings",
    col: "var(--col-string)",
    fields: [],
    ins: [
      { id: "a", label: "a" },
      { id: "b", label: "b" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `(${ge(n.id, "a")} + ${ge(n.id, "b")})`,
  },
  template_str: {
    label: "template string",
    cat: "strings",
    col: "var(--col-string)",
    fields: [
      {
        id: "tpl",
        label: "template (use $0 $1 $2)",
        kind: "text",
        def: "hello $0!",
      },
    ],
    ins: [
      { id: "v0", label: "val 1" },
      { id: "v1", label: "val 2" },
      { id: "v2", label: "val 3" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => {
      let tpl = n.f.tpl || "";
      ["v0", "v1", "v2"].forEach((v, i) => {
        const c = Object.values(conns).find((c) => c.tn === n.id && c.tp === v);
        if (c) tpl = tpl.replace("$" + i, "${" + ge(n.id, v) + "}");
      });
      return "`" + tpl + "`";
    },
  },
  str_length: {
    label: "length",
    cat: "strings",
    col: "var(--col-string)",
    fields: [],
    ins: [{ id: "str", label: "string" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "str")}.length`,
  },
  str_upper: {
    label: "to uppercase",
    cat: "strings",
    col: "var(--col-string)",
    fields: [],
    ins: [{ id: "str", label: "string" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "str")}.toUpperCase()`,
  },
  str_lower: {
    label: "to lowercase",
    cat: "strings",
    col: "var(--col-string)",
    fields: [],
    ins: [{ id: "str", label: "string" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "str")}.toLowerCase()`,
  },
  str_trim: {
    label: "trim",
    cat: "strings",
    col: "var(--col-string)",
    fields: [],
    ins: [{ id: "str", label: "string" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "str")}.trim()`,
  },
  str_split: {
    label: "split",
    cat: "strings",
    col: "var(--col-string)",
    fields: [{ id: "sep", label: "separator", kind: "text", def: "," }],
    ins: [{ id: "str", label: "string" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "str")}.split("${n.f.sep || ","}")`,
  },
  str_includes: {
    label: "includes",
    cat: "strings",
    col: "var(--col-string)",
    fields: [],
    ins: [
      { id: "str", label: "string" },
      { id: "sub", label: "substring" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "str")}.includes(${ge(n.id, "sub")})`,
  },
  str_replace: {
    label: "replace",
    cat: "strings",
    col: "var(--col-string)",
    fields: [],
    ins: [
      { id: "str", label: "string" },
      { id: "from", label: "from" },
      { id: "to", label: "to" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) =>
      `${ge(n.id, "str")}.replace(${ge(n.id, "from")}, ${ge(n.id, "to")})`,
  },
  str_slice: {
    label: "slice",
    cat: "strings",
    col: "var(--col-string)",
    fields: [],
    ins: [
      { id: "str", label: "string" },
      { id: "start", label: "start" },
      { id: "end", label: "end" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) =>
      `${ge(n.id, "str")}.slice(${ge(n.id, "start")}, ${ge(n.id, "end")})`,
  },
  arr_literal: {
    label: "array",
    cat: "arrays",
    col: "var(--col-array)",
    fields: [
      { id: "items", label: "items (comma sep)", kind: "text", def: "1, 2, 3" },
    ],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n) => `[${n.f.items || ""}]`,
  },
  arr_push: {
    label: "push",
    cat: "arrays",
    col: "var(--col-array)",
    fields: [],
    ins: [
      { id: "arr", label: "array" },
      { id: "val", label: "value" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) =>
      `(${ge(n.id, "arr")}.push(${ge(n.id, "val")}), ${ge(n.id, "arr")})`,
  },
  arr_pop: {
    label: "pop",
    cat: "arrays",
    col: "var(--col-array)",
    fields: [],
    ins: [{ id: "arr", label: "array" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "arr")}.pop()`,
  },
  arr_map: {
    label: "map",
    cat: "arrays",
    col: "var(--col-array)",
    fields: [{ id: "fn", label: "callback", kind: "text", def: "x => x" }],
    ins: [{ id: "arr", label: "array" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "arr")}.map(${n.f.fn || "x => x"})`,
  },
  arr_filter: {
    label: "filter",
    cat: "arrays",
    col: "var(--col-array)",
    fields: [{ id: "fn", label: "predicate", kind: "text", def: "x => x" }],
    ins: [{ id: "arr", label: "array" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "arr")}.filter(${n.f.fn || "x => x"})`,
  },
  arr_reduce: {
    label: "reduce",
    cat: "arrays",
    col: "var(--col-array)",
    fields: [
      { id: "fn", label: "reducer", kind: "text", def: "(acc, x) => acc + x" },
      { id: "init", label: "initial value", kind: "text", def: "0" },
    ],
    ins: [{ id: "arr", label: "array" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) =>
      `${ge(n.id, "arr")}.reduce(${n.f.fn || "(acc,x)=>acc+x"}, ${n.f.init || "0"})`,
  },
  arr_find: {
    label: "find",
    cat: "arrays",
    col: "var(--col-array)",
    fields: [{ id: "fn", label: "predicate", kind: "text", def: "x => x" }],
    ins: [{ id: "arr", label: "array" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "arr")}.find(${n.f.fn || "x => x"})`,
  },
  arr_index: {
    label: "index",
    cat: "arrays",
    col: "var(--col-array)",
    fields: [],
    ins: [
      { id: "arr", label: "array" },
      { id: "idx", label: "index" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "arr")}[${ge(n.id, "idx")}]`,
  },
  arr_length: {
    label: "length",
    cat: "arrays",
    col: "var(--col-array)",
    fields: [],
    ins: [{ id: "arr", label: "array" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "arr")}.length`,
  },
  arr_join: {
    label: "join",
    cat: "arrays",
    col: "var(--col-array)",
    fields: [{ id: "sep", label: "separator", kind: "text", def: ", " }],
    ins: [{ id: "arr", label: "array" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "arr")}.join("${n.f.sep || ", "}")`,
  },
  arr_slice: {
    label: "slice",
    cat: "arrays",
    col: "var(--col-array)",
    fields: [],
    ins: [
      { id: "arr", label: "array" },
      { id: "start", label: "start" },
      { id: "end", label: "end" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) =>
      `${ge(n.id, "arr")}.slice(${ge(n.id, "start")}, ${ge(n.id, "end")})`,
  },
  spread: {
    label: "spread",
    cat: "arrays",
    col: "var(--col-array)",
    fields: [],
    ins: [
      { id: "a", label: "arr a" },
      { id: "b", label: "arr b" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `[...${ge(n.id, "a")}, ...${ge(n.id, "b")}]`,
  },
  obj_literal: {
    label: "object",
    cat: "objects",
    col: "var(--col-obj)",
    fields: [
      { id: "props", label: "props (raw js)", kind: "text", def: "a: 1, b: 2" },
    ],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n) => `{ ${n.f.props || ""} }`,
  },
  obj_get: {
    label: "get prop",
    cat: "objects",
    col: "var(--col-obj)",
    fields: [{ id: "key", label: "key", kind: "text", def: "key" }],
    ins: [{ id: "obj", label: "object" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "obj")}.${n.f.key || "key"}`,
  },
  obj_set: {
    label: "set prop",
    cat: "objects",
    col: "var(--col-obj)",
    fields: [{ id: "key", label: "key", kind: "text", def: "key" }],
    ins: [
      { id: "obj", label: "object" },
      { id: "val", label: "value" },
    ],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) =>
      `${ge(n.id, "obj")}.${n.f.key || "key"} = ${ge(n.id, "val")};`,
  },
  obj_spread: {
    label: "spread merge",
    cat: "objects",
    col: "var(--col-obj)",
    fields: [],
    ins: [
      { id: "a", label: "obj a" },
      { id: "b", label: "obj b" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `{ ...${ge(n.id, "a")}, ...${ge(n.id, "b")} }`,
  },
  obj_keys: {
    label: "keys",
    cat: "objects",
    col: "var(--col-obj)",
    fields: [],
    ins: [{ id: "obj", label: "object" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `Object.keys(${ge(n.id, "obj")})`,
  },
  obj_values: {
    label: "values",
    cat: "objects",
    col: "var(--col-obj)",
    fields: [],
    ins: [{ id: "obj", label: "object" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `Object.values(${ge(n.id, "obj")})`,
  },
  json_parse: {
    label: "JSON.parse",
    cat: "convert",
    col: "var(--col-conv)",
    fields: [],
    ins: [{ id: "str", label: "string" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `JSON.parse(${ge(n.id, "str")})`,
  },
  json_stringify: {
    label: "JSON.stringify",
    cat: "convert",
    col: "var(--col-conv)",
    fields: [{ id: "indent", label: "indent", kind: "number", def: "2" }],
    ins: [{ id: "val", label: "value" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) =>
      `JSON.stringify(${ge(n.id, "val")}, null, ${n.f.indent || "2"})`,
  },
  num_parse: {
    label: "parseFloat",
    cat: "convert",
    col: "var(--col-conv)",
    fields: [],
    ins: [{ id: "val", label: "value" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `parseFloat(${ge(n.id, "val")})`,
  },
  int_parse: {
    label: "parseInt",
    cat: "convert",
    col: "var(--col-conv)",
    fields: [{ id: "radix", label: "radix", kind: "number", def: "10" }],
    ins: [{ id: "val", label: "value" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `parseInt(${ge(n.id, "val")}, ${n.f.radix || "10"})`,
  },
  to_string: {
    label: "toString",
    cat: "convert",
    col: "var(--col-conv)",
    fields: [],
    ins: [{ id: "val", label: "value" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `String(${ge(n.id, "val")})`,
  },
  typeof_node: {
    label: "typeof",
    cat: "convert",
    col: "var(--col-conv)",
    fields: [],
    ins: [{ id: "val", label: "value" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `typeof ${ge(n.id, "val")}`,
  },
  promise: {
    label: "new Promise",
    cat: "async",
    col: "var(--col-async)",
    fields: [
      {
        id: "resolve_val",
        label: "resolve value",
        kind: "text",
        def: "result",
      },
    ],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n) =>
      `new Promise((resolve, reject) => { resolve(${n.f.resolve_val || "result"}); })`,
  },
  then: {
    label: ".then()",
    cat: "async",
    col: "var(--col-async)",
    fields: [{ id: "fn", label: "handler", kind: "text", def: "res => res" }],
    ins: [{ id: "promise", label: "promise" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "promise")}.then(${n.f.fn || "res => res"})`,
  },
  catch_err: {
    label: ".catch()",
    cat: "async",
    col: "var(--col-async)",
    fields: [{ id: "fn", label: "handler", kind: "text", def: "err => err" }],
    ins: [{ id: "promise", label: "promise" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "promise")}.catch(${n.f.fn || "err => err"})`,
  },
  await_node: {
    label: "await",
    cat: "async",
    col: "var(--col-async)",
    fields: [],
    ins: [{ id: "promise", label: "promise" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `await ${ge(n.id, "promise")}`,
  },
  fetch_node: {
    label: "fetch",
    cat: "async",
    col: "var(--col-async)",
    fields: [
      {
        id: "method",
        label: "method",
        kind: "select",
        opts: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        def: "GET",
      },
    ],
    ins: [{ id: "url", label: "url" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) =>
      `fetch(${ge(n.id, "url")}, { method: "${n.f.method || "GET"}" })`,
  },
  set_timeout: {
    label: "setTimeout",
    cat: "async",
    col: "var(--col-async)",
    fields: [{ id: "fn", label: "callback", kind: "text", def: "() => {}" }],
    ins: [{ id: "delay", label: "delay ms" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) =>
      `setTimeout(${n.f.fn || "() => {}"}, ${ge(n.id, "delay")});`,
  },
  query_selector: {
    label: "querySelector",
    cat: "dom",
    col: "var(--col-dom)",
    fields: [{ id: "sel", label: "selector", kind: "text", def: "#app" }],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n) => `document.querySelector("${n.f.sel || "#app"}")`,
  },
  create_el: {
    label: "createElement",
    cat: "dom",
    col: "var(--col-dom)",
    fields: [{ id: "tag", label: "tag", kind: "text", def: "div" }],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n) => `document.createElement("${n.f.tag || "div"}")`,
  },
  set_text: {
    label: "set textContent",
    cat: "dom",
    col: "var(--col-dom)",
    fields: [],
    ins: [
      { id: "el", label: "element" },
      { id: "text", label: "text" },
    ],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `${ge(n.id, "el")}.textContent = ${ge(n.id, "text")};`,
  },
  set_attr: {
    label: "setAttribute",
    cat: "dom",
    col: "var(--col-dom)",
    fields: [{ id: "attr", label: "attribute", kind: "text", def: "class" }],
    ins: [
      { id: "el", label: "element" },
      { id: "val", label: "value" },
    ],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) =>
      `${ge(n.id, "el")}.setAttribute("${n.f.attr || "class"}", ${ge(n.id, "val")});`,
  },
  add_event: {
    label: "addEventListener",
    cat: "dom",
    col: "var(--col-dom)",
    fields: [
      { id: "event", label: "event", kind: "text", def: "click" },
      { id: "fn", label: "handler", kind: "text", def: "(e) => {}" },
    ],
    ins: [{ id: "el", label: "element" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) =>
      `${ge(n.id, "el")}.addEventListener("${n.f.event || "click"}", ${n.f.fn || "(e) => {}"});`,
  },
  append_child: {
    label: "appendChild",
    cat: "dom",
    col: "var(--col-dom)",
    fields: [],
    ins: [
      { id: "parent", label: "parent" },
      { id: "child", label: "child" },
    ],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `${ge(n.id, "parent")}.appendChild(${ge(n.id, "child")});`,
  },
  date_now: {
    label: "Date.now()",
    cat: "date",
    col: "var(--col-date)",
    fields: [],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: () => `Date.now()`,
  },
  new_date: {
    label: "new Date",
    cat: "date",
    col: "var(--col-date)",
    fields: [],
    ins: [{ id: "val", label: "timestamp" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `new Date(${ge(n.id, "val")})`,
  },
  date_format: {
    label: "toLocaleDateString",
    cat: "date",
    col: "var(--col-date)",
    fields: [{ id: "locale", label: "locale", kind: "text", def: "en-US" }],
    ins: [{ id: "date", label: "date" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) =>
      `${ge(n.id, "date")}.toLocaleDateString("${n.f.locale || "en-US"}")`,
  },
  log: {
    label: "console.log",
    cat: "output",
    col: "var(--col-out)",
    fields: [],
    ins: [{ id: "val", label: "value" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `console.log(${ge(n.id, "val")});`,
  },
  console_error: {
    label: "console.error",
    cat: "output",
    col: "var(--col-out)",
    fields: [],
    ins: [{ id: "val", label: "value" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `console.error(${ge(n.id, "val")});`,
  },
  alert_node: {
    label: "alert",
    cat: "output",
    col: "var(--col-out)",
    fields: [],
    ins: [{ id: "val", label: "message" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `alert(${ge(n.id, "val")});`,
  },
  comment: {
    label: "comment",
    cat: "output",
    col: "var(--col-out)",
    fields: [{ id: "text", label: "text", kind: "text", def: "note here" }],
    ins: [],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n) => `// ${n.f.text || ""}`,
  },
  raw_js: {
    label: "raw js",
    cat: "output",
    col: "var(--col-out)",
    fields: [{ id: "code", label: "code", kind: "text", def: "" }],
    ins: [],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n) => n.f.code || "",
  },
  typeof_in_stmt: {
    label: "typeof (stmt)",
    cat: "convert",
    col: "var(--col-conv)",
    fields: [],
    ins: [{ id: "val", label: "value" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `typeof ${ge(n.id, "val")}`,
  },
  instanceof: {
    label: "instanceof",
    cat: "logic",
    col: "var(--col-logic)",
    fields: [{ id: "cls", label: "class", kind: "text", def: "Array" }],
    ins: [{ id: "val", label: "value" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `(${ge(n.id, "val")} instanceof ${n.f.cls || "Array"})`,
  },
  in_op: {
    label: "in",
    cat: "logic",
    col: "var(--col-logic)",
    fields: [{ id: "key", label: "key", kind: "text", def: "prop" }],
    ins: [{ id: "obj", label: "object" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `("${n.f.key}" in ${ge(n.id, "obj")})`,
  },
  bitand: {
    label: "bitwise &",
    cat: "math",
    col: "var(--col-math)",
    fields: [],
    ins: [
      { id: "a", label: "a" },
      { id: "b", label: "b" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `(${ge(n.id, "a")} & ${ge(n.id, "b")})`,
  },
  bitor: {
    label: "bitwise |",
    cat: "math",
    col: "var(--col-math)",
    fields: [],
    ins: [
      { id: "a", label: "a" },
      { id: "b", label: "b" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `(${ge(n.id, "a")} | ${ge(n.id, "b")})`,
  },
  bitxor: {
    label: "bitwise ^",
    cat: "math",
    col: "var(--col-math)",
    fields: [],
    ins: [
      { id: "a", label: "a" },
      { id: "b", label: "b" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `(${ge(n.id, "a")} ^ ${ge(n.id, "b")})`,
  },
  bitnot: {
    label: "bitwise ~",
    cat: "math",
    col: "var(--col-math)",
    fields: [],
    ins: [{ id: "a", label: "value" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `(~${ge(n.id, "a")})`,
  },
  lshift: {
    label: "left shift",
    cat: "math",
    col: "var(--col-math)",
    fields: [],
    ins: [
      { id: "a", label: "a" },
      { id: "b", label: "b" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `(${ge(n.id, "a")} << ${ge(n.id, "b")})`,
  },
  rshift: {
    label: "right shift",
    cat: "math",
    col: "var(--col-math)",
    fields: [],
    ins: [
      { id: "a", label: "a" },
      { id: "b", label: "b" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `(${ge(n.id, "a")} >> ${ge(n.id, "b")})`,
  },
  urshift: {
    label: ">>> shift",
    cat: "math",
    col: "var(--col-math)",
    fields: [],
    ins: [
      { id: "a", label: "a" },
      { id: "b", label: "b" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `(${ge(n.id, "a")} >>> ${ge(n.id, "b")})`,
  },
  sqrt: {
    label: "sqrt",
    cat: "math",
    col: "var(--col-math)",
    fields: [],
    ins: [{ id: "a", label: "value" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `Math.sqrt(${ge(n.id, "a")})`,
  },
  log_math: {
    label: "log",
    cat: "math",
    col: "var(--col-math)",
    fields: [],
    ins: [{ id: "a", label: "value" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `Math.log(${ge(n.id, "a")})`,
  },
  sin: {
    label: "sin",
    cat: "math",
    col: "var(--col-math)",
    fields: [],
    ins: [{ id: "a", label: "radians" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `Math.sin(${ge(n.id, "a")})`,
  },
  cos: {
    label: "cos",
    cat: "math",
    col: "var(--col-math)",
    fields: [],
    ins: [{ id: "a", label: "radians" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `Math.cos(${ge(n.id, "a")})`,
  },
  tan: {
    label: "tan",
    cat: "math",
    col: "var(--col-math)",
    fields: [],
    ins: [{ id: "a", label: "radians" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `Math.tan(${ge(n.id, "a")})`,
  },
  pi: {
    label: "Math.PI",
    cat: "math",
    col: "var(--col-math)",
    fields: [],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: () => `Math.PI`,
  },
  infinity: {
    label: "Infinity",
    cat: "values",
    col: "var(--col-val)",
    fields: [],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: () => `Infinity`,
  },
  nan_val: {
    label: "NaN",
    cat: "values",
    col: "var(--col-val)",
    fields: [],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: () => `NaN`,
  },
  isnan: {
    label: "isNaN",
    cat: "convert",
    col: "var(--col-conv)",
    fields: [],
    ins: [{ id: "val", label: "value" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `isNaN(${ge(n.id, "val")})`,
  },
  isfinite: {
    label: "isFinite",
    cat: "convert",
    col: "var(--col-conv)",
    fields: [],
    ins: [{ id: "val", label: "value" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `isFinite(${ge(n.id, "val")})`,
  },
  number_cast: {
    label: "Number()",
    cat: "convert",
    col: "var(--col-conv)",
    fields: [],
    ins: [{ id: "val", label: "value" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `Number(${ge(n.id, "val")})`,
  },
  bool_cast: {
    label: "Boolean()",
    cat: "convert",
    col: "var(--col-conv)",
    fields: [],
    ins: [{ id: "val", label: "value" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `Boolean(${ge(n.id, "val")})`,
  },
  arr_includes: {
    label: "includes",
    cat: "arrays",
    col: "var(--col-array)",
    fields: [],
    ins: [
      { id: "arr", label: "array" },
      { id: "val", label: "value" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "arr")}.includes(${ge(n.id, "val")})`,
  },
  arr_indexof: {
    label: "indexOf",
    cat: "arrays",
    col: "var(--col-array)",
    fields: [],
    ins: [
      { id: "arr", label: "array" },
      { id: "val", label: "value" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "arr")}.indexOf(${ge(n.id, "val")})`,
  },
  arr_flat: {
    label: "flat",
    cat: "arrays",
    col: "var(--col-array)",
    fields: [{ id: "depth", label: "depth", kind: "number", def: "1" }],
    ins: [{ id: "arr", label: "array" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "arr")}.flat(${n.f.depth || 1})`,
  },
  arr_flatmap: {
    label: "flatMap",
    cat: "arrays",
    col: "var(--col-array)",
    fields: [{ id: "fn", label: "callback", kind: "text", def: "x => x" }],
    ins: [{ id: "arr", label: "array" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "arr")}.flatMap(${n.f.fn || "x => x"})`,
  },
  arr_every: {
    label: "every",
    cat: "arrays",
    col: "var(--col-array)",
    fields: [{ id: "fn", label: "predicate", kind: "text", def: "x => x" }],
    ins: [{ id: "arr", label: "array" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "arr")}.every(${n.f.fn || "x => x"})`,
  },
  arr_some: {
    label: "some",
    cat: "arrays",
    col: "var(--col-array)",
    fields: [{ id: "fn", label: "predicate", kind: "text", def: "x => x" }],
    ins: [{ id: "arr", label: "array" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "arr")}.some(${n.f.fn || "x => x"})`,
  },
  arr_sort: {
    label: "sort",
    cat: "arrays",
    col: "var(--col-array)",
    fields: [{ id: "fn", label: "comparator", kind: "text", def: "" }],
    ins: [{ id: "arr", label: "array" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) =>
      n.f.fn
        ? `${ge(n.id, "arr")}.sort(${n.f.fn})`
        : `${ge(n.id, "arr")}.sort()`,
  },
  arr_reverse: {
    label: "reverse",
    cat: "arrays",
    col: "var(--col-array)",
    fields: [],
    ins: [{ id: "arr", label: "array" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "arr")}.reverse()`,
  },
  arr_concat: {
    label: "concat",
    cat: "arrays",
    col: "var(--col-array)",
    fields: [],
    ins: [
      { id: "a", label: "arr a" },
      { id: "b", label: "arr b" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "a")}.concat(${ge(n.id, "b")})`,
  },
  arr_fill: {
    label: "fill",
    cat: "arrays",
    col: "var(--col-array)",
    fields: [],
    ins: [
      { id: "arr", label: "array" },
      { id: "val", label: "value" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "arr")}.fill(${ge(n.id, "val")})`,
  },
  arr_from: {
    label: "Array.from",
    cat: "arrays",
    col: "var(--col-array)",
    fields: [],
    ins: [{ id: "val", label: "iterable" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `Array.from(${ge(n.id, "val")})`,
  },
  arr_isarray: {
    label: "Array.isArray",
    cat: "arrays",
    col: "var(--col-array)",
    fields: [],
    ins: [{ id: "val", label: "value" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `Array.isArray(${ge(n.id, "val")})`,
  },
  obj_assign: {
    label: "Object.assign",
    cat: "objects",
    col: "var(--col-obj)",
    fields: [],
    ins: [
      { id: "a", label: "target" },
      { id: "b", label: "source" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `Object.assign(${ge(n.id, "a")}, ${ge(n.id, "b")})`,
  },
  obj_entries: {
    label: "entries",
    cat: "objects",
    col: "var(--col-obj)",
    fields: [],
    ins: [{ id: "obj", label: "object" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `Object.entries(${ge(n.id, "obj")})`,
  },
  obj_freeze: {
    label: "Object.freeze",
    cat: "objects",
    col: "var(--col-obj)",
    fields: [],
    ins: [{ id: "obj", label: "object" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `Object.freeze(${ge(n.id, "obj")})`,
  },
  obj_has: {
    label: "hasOwn",
    cat: "objects",
    col: "var(--col-obj)",
    fields: [{ id: "key", label: "key", kind: "text", def: "prop" }],
    ins: [{ id: "obj", label: "object" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `Object.hasOwn(${ge(n.id, "obj")}, "${n.f.key}")`,
  },
  destructure: {
    label: "destructure",
    cat: "variables",
    col: "var(--col-var)",
    fields: [
      { id: "keys", label: "keys (comma sep)", kind: "text", def: "a, b" },
      {
        id: "kind",
        label: "kind",
        kind: "select",
        opts: ["const", "let", "var"],
        def: "const",
      },
    ],
    ins: [{ id: "obj", label: "object" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) =>
      `${n.f.kind || "const"} { ${n.f.keys || "a, b"} } = ${ge(n.id, "obj")};`,
  },
  arr_destructure: {
    label: "arr destructure",
    cat: "variables",
    col: "var(--col-var)",
    fields: [
      { id: "vars", label: "vars (comma sep)", kind: "text", def: "a, b" },
      {
        id: "kind",
        label: "kind",
        kind: "select",
        opts: ["const", "let", "var"],
        def: "const",
      },
    ],
    ins: [{ id: "arr", label: "array" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) =>
      `${n.f.kind || "const"} [ ${n.f.vars || "a, b"} ] = ${ge(n.id, "arr")};`,
  },
  optional_chain: {
    label: "optional ?.",
    cat: "objects",
    col: "var(--col-obj)",
    fields: [{ id: "path", label: "path", kind: "text", def: "prop" }],
    ins: [{ id: "obj", label: "object" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "obj")}?.${n.f.path || "prop"}`,
  },
  new_set: {
    label: "new Set",
    cat: "arrays",
    col: "var(--col-array)",
    fields: [],
    ins: [{ id: "arr", label: "iterable" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `new Set(${ge(n.id, "arr")})`,
  },
  new_map: {
    label: "new Map",
    cat: "objects",
    col: "var(--col-obj)",
    fields: [],
    ins: [{ id: "arr", label: "entries" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `new Map(${ge(n.id, "arr")})`,
  },
  set_interval: {
    label: "setInterval",
    cat: "async",
    col: "var(--col-async)",
    fields: [{ id: "fn", label: "callback", kind: "text", def: "() => {}" }],
    ins: [{ id: "delay", label: "interval ms" }],
    outs: [{ id: "out", label: "id" }],
    expr: true,
    gen: (n, ge) =>
      `setInterval(${n.f.fn || "() => {}"}, ${ge(n.id, "delay")})`,
  },
  clear_timeout: {
    label: "clearTimeout",
    cat: "async",
    col: "var(--col-async)",
    fields: [],
    ins: [{ id: "id", label: "timer id" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `clearTimeout(${ge(n.id, "id")});`,
  },
  clear_interval: {
    label: "clearInterval",
    cat: "async",
    col: "var(--col-async)",
    fields: [],
    ins: [{ id: "id", label: "timer id" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `clearInterval(${ge(n.id, "id")});`,
  },
  promise_all: {
    label: "Promise.all",
    cat: "async",
    col: "var(--col-async)",
    fields: [],
    ins: [{ id: "arr", label: "promises" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `Promise.all(${ge(n.id, "arr")})`,
  },
  promise_race: {
    label: "Promise.race",
    cat: "async",
    col: "var(--col-async)",
    fields: [],
    ins: [{ id: "arr", label: "promises" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `Promise.race(${ge(n.id, "arr")})`,
  },
  promise_resolve: {
    label: "Promise.resolve",
    cat: "async",
    col: "var(--col-async)",
    fields: [],
    ins: [{ id: "val", label: "value" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `Promise.resolve(${ge(n.id, "val")})`,
  },
  async_fn: {
    label: "async fn",
    cat: "functions",
    col: "var(--col-fn)",
    fields: [
      { id: "name", label: "name", kind: "text", def: "myFn" },
      { id: "params", label: "params", kind: "text", def: "" },
    ],
    ins: [{ id: "body", label: "return value" }],
    outs: [{ id: "ref", label: "ref" }],
    expr: false,
    stmt: true,
    gen: (n, ge) =>
      `async function ${n.f.name || "myFn"}(${n.f.params || ""}) {\n  return ${ge(n.id, "body")};\n}`,
    ref: (n) => n.f.name || "myFn",
  },
  iife: {
    label: "iife",
    cat: "functions",
    col: "var(--col-fn)",
    fields: [{ id: "body", label: "body", kind: "text", def: "" }],
    ins: [],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n) => `(function() {\n  ${n.f.body || ""}\n})();`,
  },
  spread_args: {
    label: "...spread args",
    cat: "functions",
    col: "var(--col-fn)",
    fields: [],
    ins: [{ id: "arr", label: "array" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `...${ge(n.id, "arr")}`,
  },
  str_charat: {
    label: "charAt",
    cat: "strings",
    col: "var(--col-string)",
    fields: [],
    ins: [
      { id: "str", label: "string" },
      { id: "idx", label: "index" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "str")}.charAt(${ge(n.id, "idx")})`,
  },
  str_indexof: {
    label: "indexOf",
    cat: "strings",
    col: "var(--col-string)",
    fields: [],
    ins: [
      { id: "str", label: "string" },
      { id: "sub", label: "substring" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "str")}.indexOf(${ge(n.id, "sub")})`,
  },
  str_startswith: {
    label: "startsWith",
    cat: "strings",
    col: "var(--col-string)",
    fields: [],
    ins: [
      { id: "str", label: "string" },
      { id: "sub", label: "prefix" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "str")}.startsWith(${ge(n.id, "sub")})`,
  },
  str_endswith: {
    label: "endsWith",
    cat: "strings",
    col: "var(--col-string)",
    fields: [],
    ins: [
      { id: "str", label: "string" },
      { id: "sub", label: "suffix" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "str")}.endsWith(${ge(n.id, "sub")})`,
  },
  str_padstart: {
    label: "padStart",
    cat: "strings",
    col: "var(--col-string)",
    fields: [
      { id: "len", label: "length", kind: "number", def: "2" },
      { id: "ch", label: "pad char", kind: "text", def: "0" },
    ],
    ins: [{ id: "str", label: "string" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) =>
      `${ge(n.id, "str")}.padStart(${n.f.len || 2}, "${n.f.ch || "0"}")`,
  },
  str_padend: {
    label: "padEnd",
    cat: "strings",
    col: "var(--col-string)",
    fields: [
      { id: "len", label: "length", kind: "number", def: "2" },
      { id: "ch", label: "pad char", kind: "text", def: " " },
    ],
    ins: [{ id: "str", label: "string" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) =>
      `${ge(n.id, "str")}.padEnd(${n.f.len || 2}, "${n.f.ch || " "}")`,
  },
  str_repeat: {
    label: "repeat",
    cat: "strings",
    col: "var(--col-string)",
    fields: [],
    ins: [
      { id: "str", label: "string" },
      { id: "n", label: "count" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "str")}.repeat(${ge(n.id, "n")})`,
  },
  str_match: {
    label: "match",
    cat: "strings",
    col: "var(--col-string)",
    fields: [{ id: "re", label: "regex", kind: "text", def: "/pattern/g" }],
    ins: [{ id: "str", label: "string" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "str")}.match(${n.f.re || "/pattern/g"})`,
  },
  str_replaceall: {
    label: "replaceAll",
    cat: "strings",
    col: "var(--col-string)",
    fields: [],
    ins: [
      { id: "str", label: "string" },
      { id: "from", label: "from" },
      { id: "to", label: "to" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) =>
      `${ge(n.id, "str")}.replaceAll(${ge(n.id, "from")}, ${ge(n.id, "to")})`,
  },
  query_all: {
    label: "querySelectorAll",
    cat: "dom",
    col: "var(--col-dom)",
    fields: [{ id: "sel", label: "selector", kind: "text", def: ".item" }],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n) => `document.querySelectorAll("${n.f.sel || ".item"}")`,
  },
  get_attr: {
    label: "getAttribute",
    cat: "dom",
    col: "var(--col-dom)",
    fields: [{ id: "attr", label: "attribute", kind: "text", def: "class" }],
    ins: [{ id: "el", label: "element" }],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n, ge) => `${ge(n.id, "el")}.getAttribute("${n.f.attr || "class"}")`,
  },
  remove_el: {
    label: "remove",
    cat: "dom",
    col: "var(--col-dom)",
    fields: [],
    ins: [{ id: "el", label: "element" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `${ge(n.id, "el")}.remove();`,
  },
  class_add: {
    label: "classList.add",
    cat: "dom",
    col: "var(--col-dom)",
    fields: [{ id: "cls", label: "class", kind: "text", def: "active" }],
    ins: [{ id: "el", label: "element" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) =>
      `${ge(n.id, "el")}.classList.add("${n.f.cls || "active"}");`,
  },
  class_remove: {
    label: "classList.remove",
    cat: "dom",
    col: "var(--col-dom)",
    fields: [{ id: "cls", label: "class", kind: "text", def: "active" }],
    ins: [{ id: "el", label: "element" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) =>
      `${ge(n.id, "el")}.classList.remove("${n.f.cls || "active"}");`,
  },
  class_toggle: {
    label: "classList.toggle",
    cat: "dom",
    col: "var(--col-dom)",
    fields: [{ id: "cls", label: "class", kind: "text", def: "active" }],
    ins: [{ id: "el", label: "element" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) =>
      `${ge(n.id, "el")}.classList.toggle("${n.f.cls || "active"}");`,
  },
  set_style: {
    label: "set style",
    cat: "dom",
    col: "var(--col-dom)",
    fields: [{ id: "prop", label: "property", kind: "text", def: "color" }],
    ins: [
      { id: "el", label: "element" },
      { id: "val", label: "value" },
    ],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) =>
      `${ge(n.id, "el")}.style["${n.f.prop || "color"}"] = ${ge(n.id, "val")};`,
  },
  inner_html: {
    label: "innerHTML",
    cat: "dom",
    col: "var(--col-dom)",
    fields: [],
    ins: [
      { id: "el", label: "element" },
      { id: "html", label: "html string" },
    ],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `${ge(n.id, "el")}.innerHTML = ${ge(n.id, "html")};`,
  },
  local_storage_get: {
    label: "localStorage.get",
    cat: "async",
    col: "var(--col-async)",
    fields: [{ id: "key", label: "key", kind: "text", def: "myKey" }],
    ins: [],
    outs: [{ id: "out", label: "out" }],
    expr: true,
    gen: (n) => `localStorage.getItem("${n.f.key || "myKey"}")`,
  },
  local_storage_set: {
    label: "localStorage.set",
    cat: "async",
    col: "var(--col-async)",
    fields: [{ id: "key", label: "key", kind: "text", def: "myKey" }],
    ins: [{ id: "val", label: "value" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) =>
      `localStorage.setItem("${n.f.key || "myKey"}", ${ge(n.id, "val")});`,
  },
  console_table: {
    label: "console.table",
    cat: "output",
    col: "var(--col-out)",
    fields: [],
    ins: [{ id: "val", label: "value" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `console.table(${ge(n.id, "val")});`,
  },
  console_warn: {
    label: "console.warn",
    cat: "output",
    col: "var(--col-out)",
    fields: [],
    ins: [{ id: "val", label: "value" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `console.warn(${ge(n.id, "val")});`,
  },
  throw_node: {
    label: "throw",
    cat: "control",
    col: "var(--col-flow)",
    fields: [{ id: "msg", label: "message", kind: "text", def: "error" }],
    ins: [{ id: "val", label: "value (optional)" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => {
      const c = Object.values(conns).find(
        (c) => c.tn === n.id && c.tp === "val",
      );
      return c
        ? `throw ${ge(n.id, "val")};`
        : `throw new Error("${n.f.msg || "error"}");`;
    },
  },
  break_node: {
    label: "break",
    cat: "control",
    col: "var(--col-flow)",
    fields: [],
    ins: [],
    outs: [],
    expr: false,
    stmt: true,
    gen: () => `break;`,
  },
  continue_node: {
    label: "continue",
    cat: "control",
    col: "var(--col-flow)",
    fields: [],
    ins: [],
    outs: [],
    expr: false,
    stmt: true,
    gen: () => `continue;`,
  },
  for_of: {
    label: "for...of",
    cat: "control",
    col: "var(--col-flow)",
    fields: [
      { id: "item", label: "item var", kind: "text", def: "item" },
      { id: "body", label: "body", kind: "text", def: "console.log(item)" },
    ],
    ins: [{ id: "iter", label: "iterable" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) =>
      `for (const ${n.f.item || "item"} of ${ge(n.id, "iter")}) {\n  ${n.f.body || ""}\n}`,
  },
  for_in: {
    label: "for...in",
    cat: "control",
    col: "var(--col-flow)",
    fields: [
      { id: "key", label: "key var", kind: "text", def: "key" },
      { id: "body", label: "body", kind: "text", def: "console.log(key)" },
    ],
    ins: [{ id: "obj", label: "object" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) =>
      `for (const ${n.f.key || "key"} in ${ge(n.id, "obj")}) {\n  ${n.f.body || ""}\n}`,
  },
  do_while: {
    label: "do...while",
    cat: "control",
    col: "var(--col-flow)",
    fields: [{ id: "body", label: "body", kind: "text", def: "" }],
    ins: [{ id: "cond", label: "condition" }],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n, ge) => `do {\n  ${n.f.body || ""}\n} while (${ge(n.id, "cond")});`,
  },
  label_stmt: {
    label: "labeled stmt",
    cat: "control",
    col: "var(--col-flow)",
    fields: [
      { id: "lbl", label: "label", kind: "text", def: "outer" },
      { id: "body", label: "body", kind: "text", def: "" },
    ],
    ins: [],
    outs: [],
    expr: false,
    stmt: true,
    gen: (n) => `${n.f.lbl || "outer"}: {\n  ${n.f.body || ""}\n}`,
  },
  subgraph: {
    label: "subgraph / macro",
    cat: "functions",
    col: "var(--col-fn)",
    fields: [
      { id: "name", label: "name", kind: "text", def: "macro" },
      { id: "code", label: "body (raw js)", kind: "text", def: "" },
    ],
    ins: [
      { id: "a0", label: "in 1" },
      { id: "a1", label: "in 2" },
    ],
    outs: [{ id: "out", label: "out" }],
    expr: false,
    stmt: true,
    gen: (n, ge) => {
      const c0 = Object.values(conns).find(
        (c) => c.tn === n.id && c.tp === "a0",
      );
      const c1 = Object.values(conns).find(
        (c) => c.tn === n.id && c.tp === "a1",
      );
      return `(function ${n.f.name || "macro"}(${c0 ? "__a0" : ""}, ${c1 ? "__a1" : ""}) {\n  ${n.f.code || ""}\n})(${c0 ? ge(n.id, "a0") : ""}${c0 && c1 ? ", " : ""}${c1 ? ge(n.id, "a1") : ""})`;
    },
  },
};

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
let history = [],
  future = [],
  multiSel = new Set(),
  clipboard = [];
let searchQ = "",
  searchVisible = false;
let drawWiresScheduled = false;

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

function applyTransform() {
  document.getElementById("canvas").style.transform =
    `translate(${pan.x}px,${pan.y}px) scale(${zoom})`;
  document.getElementById("grid-bg").style.backgroundPosition =
    `${pan.x}px ${pan.y}px`;
  document.getElementById("grid-bg").style.backgroundSize =
    `${24 * zoom}px ${24 * zoom}px`;
  updateCoords();
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
  const dx = Math.abs(x2 - x1) * 0.55;
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

function getWireExpr(nodeId, portId) {
  if (!nodeId || !nodes[nodeId]) return "?";
  const src = nodes[nodeId];
  const def = TYPES[src?.type];
  if (!def) return "?";
  if (def.ref) return def.ref(src);
  if (def.expr) {
    function ge(nid, pid) {
      const c = Object.values(conns).find((c) => c.tn === nid && c.tp === pid);
      if (!c) return "…";
      return getWireExpr(c.fn, c.fp);
    }
    return def.gen(src, ge);
  }
  return src.type;
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
      const col = TYPES[nodes[c.fn]?.type]?.col;
      if (col) path.style.stroke = col;
      path.dataset.cid = c.id;
      path.addEventListener("click", (ev) => {
        ev.stopPropagation();
        removeConn(c.id);
      });
      svg.appendChild(path);
      const mid = { x: (fp.x + tp.x) / 2, y: (fp.y + tp.y) / 2 };
      const badge = document.createElementNS("http://www.w3.org/2000/svg", "g");
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
    });
    refreshPortStates();
  });
}

function refreshPortStates() {
  document.querySelectorAll(".port").forEach((p) => p.classList.remove("live"));
  Object.values(conns).forEach((c) => {
    portEl(c.fn, "out", c.fp)?.classList.add("live");
    portEl(c.tn, "in", c.tp)?.classList.add("live");
  });
}

function removeConn(id) {
  delete conns[id];
  drawWires();
}

function addConn(fn, fp, tn, tp) {
  if (fn === tn) return;
  snapshot();
  const existing = Object.values(conns).find((c) => c.tn === tn && c.tp === tp);
  if (existing) delete conns[existing.id];
  const id = cuid();
  conns[id] = { id, fn, fp, tn, tp };
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
  nodes[id] = { id, type, x, y, f };
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
  history.push(JSON.stringify({ nodes, conns, nid }));
  if (history.length > 60) history.shift();
  future = [];
}

function undo() {
  if (!history.length) return toast("nothing to undo");
  future.push(JSON.stringify({ nodes, conns, nid }));
  const s = JSON.parse(history.pop());
  nodes = s.nodes;
  conns = s.conns;
  nid = s.nid;
  document.querySelectorAll(".node").forEach((e) => e.remove());
  Object.keys(nodes).forEach((id) => renderNode(id));
  drawWires();
  showHint();
  toast("undo");
}

function redo() {
  if (!future.length) return toast("nothing to redo");
  history.push(JSON.stringify({ nodes, conns, nid }));
  const s = JSON.parse(future.pop());
  nodes = s.nodes;
  conns = s.conns;
  nid = s.nid;
  document.querySelectorAll(".node").forEach((e) => e.remove());
  Object.keys(nodes).forEach((id) => renderNode(id));
  drawWires();
  showHint();
  toast("redo");
}

function nukeAll() {
  snapshot();
  nodes = {};
  conns = {};
  document.querySelectorAll(".node").forEach((e) => e.remove());
  multiSel.clear();
  drawWires();
  showHint();
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
      inp.value = n.f[fld.id] || "";
    }
    inp.addEventListener("input", (e) => {
      n.f[fld.id] = e.target.value;
    });
    inp.addEventListener("change", (e) => {
      n.f[fld.id] = e.target.value;
    });
    inp.addEventListener("mousedown", (e) => e.stopPropagation());
    fdiv.appendChild(inp);
    body.appendChild(fdiv);
  });

  const portSec = document.createElement("div");
  portSec.className = "ports-wrap";

  const lcol = document.createElement("div");
  lcol.className = "pcol";
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
      if (pending) {
        addConn(pending.fn, pending.fp, id, p.id);
        clearPending();
      } else {
        const ex = Object.values(conns).find(
          (c) => c.tn === id && c.tp === p.id,
        );
        if (ex) {
          removeConn(ex.id);
        }
      }
    });
  });
  portSec.appendChild(lcol);

  const rcol = document.createElement("div");
  rcol.className = "pcol right";
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
      pending = { fn: id, fp: p.id };
      dot.classList.add("active");
    });
  });
  portSec.appendChild(rcol);
  body.appendChild(portSec);
  wrap.appendChild(body);
  document.getElementById("canvas").appendChild(wrap);

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
  if (dragNode) {
    const n = nodes[dragNode];
    if (!n) return;
    const dx = (e.clientX - dragStart.x) / zoom;
    const dy = (e.clientY - dragStart.y) / zoom;
    if (multiSel.has(dragNode) && dragMultiOrigins) {
      multiSel.forEach((mid) => {
        if (!nodes[mid] || !dragMultiOrigins[mid]) return;
        nodes[mid].x = dragMultiOrigins[mid].x + dx;
        nodes[mid].y = dragMultiOrigins[mid].y + dy;
        const el = document.getElementById("node-" + mid);
        if (el) {
          el.style.left = nodes[mid].x + "px";
          el.style.top = nodes[mid].y + "px";
        }
      });
    } else {
      n.x = dragNodeOrigin.x + dx;
      n.y = dragNodeOrigin.y + dy;
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

document.addEventListener("mouseup", () => {
  dragNode = null;
  dragMultiOrigins = null;
  if (panning) {
    panning = false;
    canvasWrap.style.cursor = "default";
  }
  const wasResizing = resizing || sideResizing;
  resizing = false;
  sideResizing = false;
  if (wasResizing) savePanelSizes();
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
      toggleSearch();
    }
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
  function getExpr(nodeId, portId) {
    const c = Object.values(conns).find(
      (c) => c.tn === nodeId && c.tp === portId,
    );
    if (!c) return "/* unconnected */";
    const src = nodes[c.fn];
    const def = TYPES[src?.type];
    if (!def) return "/* error */";
    if (def.ref) return def.ref(src);
    if (def.expr) return def.gen(src, getExpr);
    return "/* non-expr */";
  }
  const sorted = Object.values(nodes).sort((a, b) => a.y - b.y);
  const lines = [];
  sorted.forEach((n) => {
    const def = TYPES[n.type];
    if (!def) return;
    if (def.stmt) {
      lines.push(def.gen(n, getExpr));
    } else if (def.expr) {
      const hasOutConn = Object.values(conns).some((c) => c.fn === n.id);
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

function buildSaveLoad() {
  const saveMenu = document.getElementById("save-dd-menu");
  const loadMenu = document.getElementById("load-dd-menu");
  for (let i = 1; i <= 5; i++) {
    const sr = document.createElement("div");
    sr.className = "dd-row";
    sr.id = `save-s${i}`;
    sr.innerHTML = `<span class="dd-dot-fill"></span> slot ${i}`;
    sr.addEventListener("click", () => saveSlot(i));
    saveMenu.appendChild(sr);

    const lr = document.createElement("div");
    lr.className = "dd-row";
    lr.id = `load-s${i}`;
    lr.innerHTML = `<span class="dd-dot-fill"></span> slot ${i}`;
    lr.addEventListener("click", () => loadSlot(i));
    loadMenu.appendChild(lr);
  }
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
  setTimeout(() => {
    clearInterval(dotInterval);
    let code;
    try {
      code = compileCode();
    } catch (err) {
      code = "// compile error: " + err.message;
    }
    title.textContent = "compiled output";
    body.innerHTML = "";
    const cb = document.createElement("div");
    cb.className = "codebox";
    cb.id = "codebox";
    cb.textContent = code;
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
    const req = indexedDB.open("cupcake_v2", 1);
    req.onupgradeneeded = (e) =>
      e.target.result.createObjectStore("slots", { keyPath: "slot" });
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

function dbKeys() {
  return new Promise((res) => {
    const req = db
      .transaction("slots", "readonly")
      .objectStore("slots")
      .getAllKeys();
    req.onsuccess = (e) => res(e.target.result);
  });
}

async function saveSlot(slot) {
  closeAllDD();
  await dbSet(slot, JSON.stringify({ nodes, conns, nid }));
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
  nid = data.nid || 100;
  Object.keys(nodes).forEach((id) => renderNode(id));
  drawWires();
  showHint();
  toast(`loaded slot ${slot}`);
}

async function refreshIndicators() {
  const filled = await dbKeys();
  for (let i = 1; i <= 5; i++) {
    const has = filled.includes(i);
    document.getElementById(`save-s${i}`)?.classList.toggle("filled", has);
    document.getElementById(`load-s${i}`)?.classList.toggle("filled", has);
  }
}

async function boot() {
  startLoader();
  buildSidebar();
  buildSaveLoad();
  loadPanelSizes();
  await initDB();
  await refreshIndicators();
  applyTransform();
  showHint();
  document.getElementById("console-panel").classList.add("open");
  document.getElementById("canvas-wrap").classList.add("console-open");
  document.getElementById("sidebar").classList.add("console-open");
  document.getElementById("cat-corner").classList.add("open");
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

  const delay = 1200 + Math.random() * 1800;
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
          if (prop === "keys") {
            const nid = placeNode("obj_keys", x, y, {});
            if (node.arguments[0]) {
              const aid = exprToNode(node.arguments[0], x - 220, y);
              if (aid) addConn(aid, "out", nid, "obj");
            }
            return nid;
          }
          if (prop === "values") {
            const nid = placeNode("obj_values", x, y, {});
            if (node.arguments[0]) {
              const aid = exprToNode(node.arguments[0], x - 220, y);
              if (aid) addConn(aid, "out", nid, "obj");
            }
            return nid;
          }
        }

        const strMethods = {
          toUpperCase: "str_upper",
          toLowerCase: "str_lower",
          trim: "str_trim",
          length: "str_length",
        };
        const arrMethods = { pop: "arr_pop", length: "arr_length" };

        const methodMap = {
          toUpperCase: "str_upper",
          toLowerCase: "str_lower",
          trim: "str_trim",
          split: "str_split",
          includes: "str_includes",
          replace: "str_replace",
          slice: "str_slice",
          push: "arr_push",
          pop: "arr_pop",
          map: "arr_map",
          filter: "arr_filter",
          reduce: "arr_reduce",
          find: "arr_find",
          join: "arr_join",
          then: "then",
          catch: "catch_err",
        };

        if (methodMap[prop]) {
          const nid = placeNode(methodMap[prop], x, y, {});
          const objId = exprToNode(obj, x - 220, y - 40);
          const inPort = [
            "str_upper",
            "str_lower",
            "str_trim",
            "str_length",
          ].includes(methodMap[prop])
            ? "str"
            : [
                  "arr_pop",
                  "arr_length",
                  "arr_map",
                  "arr_filter",
                  "arr_reduce",
                  "arr_find",
                  "arr_join",
                ].includes(methodMap[prop])
              ? "arr"
              : ["then", "catch_err"].includes(methodMap[prop])
                ? "promise"
                : "obj";
          if (objId) addConn(objId, "out", nid, inPort);
          const argPorts = {
            str_split: ["sep"],
            str_includes: ["sub"],
            str_replace: ["from", "to"],
            str_slice: ["start", "end"],
            arr_push: ["val"],
            arr_map: ["fn"],
            arr_filter: ["fn"],
            arr_reduce: ["fn"],
            arr_find: ["fn"],
            arr_join: ["sep"],
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
        if (name === "alert") {
          const nid = placeNode("alert_node", x, y, {});
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

    if (node.type === "SpreadElement") {
      return exprToNode(node.argument, x, y);
    }

    if (node.type === "AwaitExpression") {
      const nid = placeNode("await_node", x, y, {});
      const pid = exprToNode(node.argument, x - 200, y);
      if (pid) addConn(pid, "out", nid, "promise");
      return nid;
    }

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

    placeNode("raw_js", x, y, { code: code.slice(stmt.start, stmt.end) });
  }

  ast.body.forEach((stmt, i) => {
    stmtToNodes(stmt, baseX + 280, baseY + i * 200);
  });

  drawWires();
  showHint();
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
  const panel = document.getElementById("console-panel");
  const output = document.getElementById("run-output");
  output.innerHTML = "";
  document.getElementById("run-header-label").textContent = "running...";
  document.getElementById("run-dot").classList.remove("err");
  panel.classList.add("open");
  document.getElementById("canvas-wrap").classList.add("console-open");
  document.getElementById("sidebar").classList.add("console-open");

  let code;
  try {
    code = compileCode();
  } catch (e) {
    appendConsoleEntry(output, "error", ["compile error: " + e.message], 0);
    return;
  }

  const start = performance.now();
  const entries = [];

  const _log = console.log;
  const _error = console.error;
  const _warn = console.warn;
  const _info = console.info;
  const _alert = window.alert;

  const cap =
    (level) =>
    (...args) => {
      const ms = Math.round(performance.now() - start);
      appendConsoleEntry(output, level, args, ms);
      entries.push({ level, args });
    };

  console.log = cap("log");
  console.error = cap("error");
  console.warn = cap("warn");
  console.info = cap("info");
  window.alert = (msg) => {
    const ms = Math.round(performance.now() - start);
    appendConsoleEntry(output, "log", ["[alert] " + String(msg)], ms);
  };

  let hadError = false;
  try {
    const fn = new Function(code);
    const result = fn();
    if (result instanceof Promise) {
      result.catch((e) => {
        const ms = Math.round(performance.now() - start);
        appendConsoleEntry(output, "error", [e], ms);
        hadError = true;
        finishRun(output, hadError, start);
      });
      result.then(() => finishRun(output, hadError, start));
    } else {
      finishRun(output, hadError, start);
    }
  } catch (e) {
    hadError = true;
    const ms = Math.round(performance.now() - start);
    appendConsoleEntry(output, "error", [e], ms);
    finishRun(output, hadError, start);
  } finally {
    console.log = _log;
    console.error = _error;
    console.warn = _warn;
    console.info = _info;
    window.alert = _alert;
  }
}

function finishRun(output, hadError, start) {
  const ms = Math.round(performance.now() - start);
  const dot = document.getElementById("run-dot");
  const label = document.getElementById("run-header-label");
  if (dot) dot.classList.toggle("err", hadError);
  if (label)
    label.textContent = hadError
      ? "finished with errors  " + ms + "ms"
      : "finished in " + ms + "ms";
  if (
    !hadError &&
    output.querySelectorAll(".console-entry:not(.system)").length === 0
  ) {
    appendConsoleEntry(output, "system", ["(no output)"], ms);
  }
}

document.getElementById("run-btn").addEventListener("click", runCode);
document.getElementById("run-clear-btn").addEventListener("click", () => {
  document.getElementById("run-output").innerHTML = "";
});
document.getElementById("console-close-btn").addEventListener("click", () => {
  document.getElementById("console-panel").classList.remove("open");
  document.getElementById("canvas-wrap").classList.remove("console-open");
  document.getElementById("sidebar").classList.remove("console-open");
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
});

document.addEventListener("mouseup", () => {
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
});

document.addEventListener("mouseup", () => {
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
document.addEventListener("mousemove", (e) => {
  cur.style.left = e.clientX + "px";
  cur.style.top = e.clientY + "px";
});
document.addEventListener("mousedown", () => cur.classList.add("big"));
document.addEventListener("mouseup", () => cur.classList.remove("big"));

window.addEventListener("beforeunload", (e) => {
  if (Object.keys(nodes).length > 0) {
    e.preventDefault();
    e.returnValue = "";
  }
});

const CAT_FRAMES = [
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

function tickCat() {
  // :)
  const el = document.getElementById("cat-ascii");
  if (!el) return;
  flyFrame = (flyFrame + 1) % FLY_PATHS.length;
  catFrame = (catFrame + catDir + CAT_FRAMES.length) % CAT_FRAMES.length;
  if (catFrame === CAT_FRAMES.length - 1 || catFrame === 0) catDir *= -1;
  el.textContent = CAT_FRAMES[catFrame](FLY_PATHS[flyFrame]);
}

setInterval(tickCat, 320);

if (
  window.innerWidth < 768 ||
  /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
) {
  document.getElementById("mobile-block").style.display = "flex";
  document.getElementById("loader").remove();
} else {
  boot();
}

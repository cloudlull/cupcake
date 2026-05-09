const TYPES = {
  string: {
    label: 'string', cat: 'values', col: 'var(--col-val)',
    fields: [{ id: 'v', label: 'value', kind: 'text', def: 'hello' }],
    ins: [], outs: [{ id: 'out', label: 'out' }],
    expr: true,
    gen: (n, ge) => `"${(n.f.v||'').replace(/\\/g,'\\\\').replace(/"/g,'\\"')}"`
  },
  number: {
    label: 'number', cat: 'values', col: 'var(--col-val)',
    fields: [{ id: 'v', label: 'value', kind: 'number', def: '0' }],
    ins: [], outs: [{ id: 'out', label: 'out' }],
    expr: true,
    gen: (n, ge) => `${n.f.v || '0'}`
  },
  boolean: {
    label: 'boolean', cat: 'values', col: 'var(--col-val)',
    fields: [{ id: 'v', label: 'value', kind: 'select', opts: ['true','false'], def: 'true' }],
    ins: [], outs: [{ id: 'out', label: 'out' }],
    expr: true,
    gen: (n, ge) => `${n.f.v || 'true'}`
  },
  null_val: {
    label: 'null', cat: 'values', col: 'var(--col-val)',
    fields: [],
    ins: [], outs: [{ id: 'out', label: 'out' }],
    expr: true,
    gen: () => 'null'
  },
  undefined_val: {
    label: 'undefined', cat: 'values', col: 'var(--col-val)',
    fields: [],
    ins: [], outs: [{ id: 'out', label: 'out' }],
    expr: true,
    gen: () => 'undefined'
  },
  variable: {
    label: 'variable', cat: 'variables', col: 'var(--col-var)',
    fields: [
      { id: 'kind', label: 'kind', kind: 'select', opts: ['let','const','var'], def: 'let' },
      { id: 'name', label: 'name', kind: 'text', def: 'x' }
    ],
    ins: [{ id: 'val', label: 'value' }],
    outs: [{ id: 'ref', label: 'ref' }],
    expr: false, stmt: true,
    gen: (n, ge) => `${n.f.kind||'let'} ${n.f.name||'x'} = ${ge(n.id,'val')};`,
    ref: n => n.f.name || 'x'
  },
  assign: {
    label: 'assign', cat: 'variables', col: 'var(--col-var)',
    fields: [{ id: 'name', label: 'variable name', kind: 'text', def: 'x' }],
    ins: [{ id: 'val', label: 'value' }],
    outs: [],
    expr: false, stmt: true,
    gen: (n, ge) => `${n.f.name||'x'} = ${ge(n.id,'val')};`
  },
  add: {
    label: 'add', cat: 'math', col: 'var(--col-math)',
    fields: [], ins: [{ id: 'a', label: 'a' }, { id: 'b', label: 'b' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `(${ge(n.id,'a')} + ${ge(n.id,'b')})`
  },
  subtract: {
    label: 'subtract', cat: 'math', col: 'var(--col-math)',
    fields: [], ins: [{ id: 'a', label: 'a' }, { id: 'b', label: 'b' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `(${ge(n.id,'a')} - ${ge(n.id,'b')})`
  },
  multiply: {
    label: 'multiply', cat: 'math', col: 'var(--col-math)',
    fields: [], ins: [{ id: 'a', label: 'a' }, { id: 'b', label: 'b' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `(${ge(n.id,'a')} * ${ge(n.id,'b')})`
  },
  divide: {
    label: 'divide', cat: 'math', col: 'var(--col-math)',
    fields: [], ins: [{ id: 'a', label: 'a' }, { id: 'b', label: 'b' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `(${ge(n.id,'a')} / ${ge(n.id,'b')})`
  },
  modulo: {
    label: 'modulo', cat: 'math', col: 'var(--col-math)',
    fields: [], ins: [{ id: 'a', label: 'a' }, { id: 'b', label: 'b' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `(${ge(n.id,'a')} % ${ge(n.id,'b')})`
  },
  power: {
    label: 'power', cat: 'math', col: 'var(--col-math)',
    fields: [], ins: [{ id: 'a', label: 'base' }, { id: 'b', label: 'exp' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `Math.pow(${ge(n.id,'a')}, ${ge(n.id,'b')})`
  },
  abs: {
    label: 'abs', cat: 'math', col: 'var(--col-math)',
    fields: [], ins: [{ id: 'a', label: 'value' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `Math.abs(${ge(n.id,'a')})`
  },
  floor: {
    label: 'floor', cat: 'math', col: 'var(--col-math)',
    fields: [], ins: [{ id: 'a', label: 'value' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `Math.floor(${ge(n.id,'a')})`
  },
  ceil: {
    label: 'ceil', cat: 'math', col: 'var(--col-math)',
    fields: [], ins: [{ id: 'a', label: 'value' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `Math.ceil(${ge(n.id,'a')})`
  },
  round: {
    label: 'round', cat: 'math', col: 'var(--col-math)',
    fields: [], ins: [{ id: 'a', label: 'value' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `Math.round(${ge(n.id,'a')})`
  },
  random: {
    label: 'random', cat: 'math', col: 'var(--col-math)',
    fields: [], ins: [],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: () => `Math.random()`
  },
  min: {
    label: 'min', cat: 'math', col: 'var(--col-math)',
    fields: [], ins: [{ id: 'a', label: 'a' }, { id: 'b', label: 'b' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `Math.min(${ge(n.id,'a')}, ${ge(n.id,'b')})`
  },
  max: {
    label: 'max', cat: 'math', col: 'var(--col-math)',
    fields: [], ins: [{ id: 'a', label: 'a' }, { id: 'b', label: 'b' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `Math.max(${ge(n.id,'a')}, ${ge(n.id,'b')})`
  },
  compare: {
    label: 'compare', cat: 'logic', col: 'var(--col-logic)',
    fields: [{ id: 'op', label: 'operator', kind: 'select', opts: ['===','!==','<','>','<=','>='], def: '===' }],
    ins: [{ id: 'a', label: 'a' }, { id: 'b', label: 'b' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `(${ge(n.id,'a')} ${n.f.op||'==='} ${ge(n.id,'b')})`
  },
  and: {
    label: 'and', cat: 'logic', col: 'var(--col-logic)',
    fields: [], ins: [{ id: 'a', label: 'a' }, { id: 'b', label: 'b' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `(${ge(n.id,'a')} && ${ge(n.id,'b')})`
  },
  or: {
    label: 'or', cat: 'logic', col: 'var(--col-logic)',
    fields: [], ins: [{ id: 'a', label: 'a' }, { id: 'b', label: 'b' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `(${ge(n.id,'a')} || ${ge(n.id,'b')})`
  },
  not: {
    label: 'not', cat: 'logic', col: 'var(--col-logic)',
    fields: [], ins: [{ id: 'a', label: 'a' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `(!${ge(n.id,'a')})`
  },
  nullish: {
    label: 'nullish (??)', cat: 'logic', col: 'var(--col-logic)',
    fields: [], ins: [{ id: 'a', label: 'value' }, { id: 'b', label: 'fallback' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `(${ge(n.id,'a')} ?? ${ge(n.id,'b')})`
  },
  ternary: {
    label: 'if / else', cat: 'control', col: 'var(--col-flow)',
    fields: [], ins: [{ id: 'cond', label: 'condition' }, { id: 'then', label: 'then' }, { id: 'else', label: 'else' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `(${ge(n.id,'cond')} ? ${ge(n.id,'then')} : ${ge(n.id,'else')})`
  },
  if_stmt: {
    label: 'if statement', cat: 'control', col: 'var(--col-flow)',
    fields: [{ id: 'body', label: 'body (raw js)', kind: 'text', def: '// body here' }],
    ins: [{ id: 'cond', label: 'condition' }],
    outs: [],
    expr: false, stmt: true,
    gen: (n, ge) => `if (${ge(n.id,'cond')}) {\n  ${n.f.body||''}\n}`
  },
  for_loop: {
    label: 'for loop', cat: 'control', col: 'var(--col-flow)',
    fields: [
      { id: 'init', label: 'init', kind: 'text', def: 'let i = 0' },
      { id: 'cond', label: 'condition', kind: 'text', def: 'i < 10' },
      { id: 'update', label: 'update', kind: 'text', def: 'i++' },
      { id: 'body', label: 'body', kind: 'text', def: 'console.log(i)' }
    ],
    ins: [],
    outs: [],
    expr: false, stmt: true,
    gen: (n) => `for (${n.f.init||''}; ${n.f.cond||''}; ${n.f.update||''}) {\n  ${n.f.body||''}\n}`
  },
  while_loop: {
    label: 'while loop', cat: 'control', col: 'var(--col-flow)',
    fields: [
      { id: 'body', label: 'body', kind: 'text', def: '' }
    ],
    ins: [{ id: 'cond', label: 'condition' }],
    outs: [],
    expr: false, stmt: true,
    gen: (n, ge) => `while (${ge(n.id,'cond')}) {\n  ${n.f.body||''}\n}`
  },
  switch_stmt: {
    label: 'switch', cat: 'control', col: 'var(--col-flow)',
    fields: [{ id: 'cases', label: 'cases (raw js)', kind: 'text', def: "case 'a': break;" }],
    ins: [{ id: 'val', label: 'value' }],
    outs: [],
    expr: false, stmt: true,
    gen: (n, ge) => `switch (${ge(n.id,'val')}) {\n  ${n.f.cases||''}\n}`
  },
  try_catch: {
    label: 'try / catch', cat: 'control', col: 'var(--col-flow)',
    fields: [
      { id: 'try_body', label: 'try body', kind: 'text', def: '' },
      { id: 'catch_var', label: 'catch var', kind: 'text', def: 'err' },
      { id: 'catch_body', label: 'catch body', kind: 'text', def: 'console.error(err)' }
    ],
    ins: [],
    outs: [],
    expr: false, stmt: true,
    gen: (n) => `try {\n  ${n.f.try_body||''}\n} catch (${n.f.catch_var||'err'}) {\n  ${n.f.catch_body||''}\n}`
  },
  func: {
    label: 'function', cat: 'functions', col: 'var(--col-fn)',
    fields: [
      { id: 'name', label: 'name', kind: 'text', def: 'myFn' },
      { id: 'params', label: 'params (comma sep)', kind: 'text', def: '' }
    ],
    ins: [{ id: 'body', label: 'return value' }],
    outs: [{ id: 'ref', label: 'ref' }],
    expr: false, stmt: true,
    gen: (n, ge) => `function ${n.f.name||'myFn'}(${n.f.params||''}) {\n  return ${ge(n.id,'body')};\n}`,
    ref: n => n.f.name || 'myFn'
  },
  arrow_fn: {
    label: 'arrow fn', cat: 'functions', col: 'var(--col-fn)',
    fields: [
      { id: 'name', label: 'name', kind: 'text', def: 'myFn' },
      { id: 'params', label: 'params', kind: 'text', def: '' }
    ],
    ins: [{ id: 'body', label: 'return value' }],
    outs: [{ id: 'ref', label: 'ref' }],
    expr: false, stmt: true,
    gen: (n, ge) => `const ${n.f.name||'myFn'} = (${n.f.params||''}) => ${ge(n.id,'body')};`,
    ref: n => n.f.name || 'myFn'
  },
  call: {
    label: 'call', cat: 'functions', col: 'var(--col-fn)',
    fields: [{ id: 'fn', label: 'function name', kind: 'text', def: 'myFn' }],
    ins: [{ id: 'a0', label: 'arg 1' }, { id: 'a1', label: 'arg 2' }, { id: 'a2', label: 'arg 3' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => {
      const args = ['a0','a1','a2'].map(a => {
        const c = Object.values(conns).find(c => c.tn === n.id && c.tp === a);
        return c ? ge(n.id, a) : null;
      }).filter(Boolean);
      return `${n.f.fn||'myFn'}(${args.join(', ')})`;
    }
  },
  method_call: {
    label: 'method call', cat: 'functions', col: 'var(--col-fn)',
    fields: [{ id: 'method', label: 'method', kind: 'text', def: 'toString' }],
    ins: [{ id: 'obj', label: 'object' }, { id: 'a0', label: 'arg 1' }, { id: 'a1', label: 'arg 2' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => {
      const args = ['a0','a1'].map(a => {
        const c = Object.values(conns).find(c => c.tn === n.id && c.tp === a);
        return c ? ge(n.id, a) : null;
      }).filter(Boolean);
      return `${ge(n.id,'obj')}.${n.f.method||'toString'}(${args.join(', ')})`;
    }
  },
  ret: {
    label: 'return', cat: 'functions', col: 'var(--col-fn)',
    fields: [], ins: [{ id: 'val', label: 'value' }], outs: [],
    expr: false, stmt: true,
    gen: (n, ge) => `return ${ge(n.id,'val')};`
  },
  str_concat: {
    label: 'concat', cat: 'strings', col: 'var(--col-string)',
    fields: [], ins: [{ id: 'a', label: 'a' }, { id: 'b', label: 'b' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `(${ge(n.id,'a')} + ${ge(n.id,'b')})`
  },
  template_str: {
    label: 'template string', cat: 'strings', col: 'var(--col-string)',
    fields: [{ id: 'tpl', label: 'template (use $0 $1 $2)', kind: 'text', def: 'hello $0!' }],
    ins: [{ id: 'v0', label: 'val 1' }, { id: 'v1', label: 'val 2' }, { id: 'v2', label: 'val 3' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => {
      let tpl = n.f.tpl || '';
      ['v0','v1','v2'].forEach((v, i) => {
        const c = Object.values(conns).find(c => c.tn === n.id && c.tp === v);
        if (c) tpl = tpl.replace('$' + i, '${' + ge(n.id, v) + '}');
      });
      return '`' + tpl + '`';
    }
  },
  str_length: {
    label: 'length', cat: 'strings', col: 'var(--col-string)',
    fields: [], ins: [{ id: 'str', label: 'string' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `${ge(n.id,'str')}.length`
  },
  str_upper: {
    label: 'to uppercase', cat: 'strings', col: 'var(--col-string)',
    fields: [], ins: [{ id: 'str', label: 'string' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `${ge(n.id,'str')}.toUpperCase()`
  },
  str_lower: {
    label: 'to lowercase', cat: 'strings', col: 'var(--col-string)',
    fields: [], ins: [{ id: 'str', label: 'string' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `${ge(n.id,'str')}.toLowerCase()`
  },
  str_trim: {
    label: 'trim', cat: 'strings', col: 'var(--col-string)',
    fields: [], ins: [{ id: 'str', label: 'string' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `${ge(n.id,'str')}.trim()`
  },
  str_split: {
    label: 'split', cat: 'strings', col: 'var(--col-string)',
    fields: [{ id: 'sep', label: 'separator', kind: 'text', def: ',' }],
    ins: [{ id: 'str', label: 'string' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `${ge(n.id,'str')}.split("${n.f.sep||','}")`
  },
  str_includes: {
    label: 'includes', cat: 'strings', col: 'var(--col-string)',
    fields: [], ins: [{ id: 'str', label: 'string' }, { id: 'sub', label: 'substring' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `${ge(n.id,'str')}.includes(${ge(n.id,'sub')})`
  },
  str_replace: {
    label: 'replace', cat: 'strings', col: 'var(--col-string)',
    fields: [], ins: [{ id: 'str', label: 'string' }, { id: 'from', label: 'from' }, { id: 'to', label: 'to' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `${ge(n.id,'str')}.replace(${ge(n.id,'from')}, ${ge(n.id,'to')})`
  },
  str_slice: {
    label: 'slice', cat: 'strings', col: 'var(--col-string)',
    fields: [], ins: [{ id: 'str', label: 'string' }, { id: 'start', label: 'start' }, { id: 'end', label: 'end' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `${ge(n.id,'str')}.slice(${ge(n.id,'start')}, ${ge(n.id,'end')})`
  },
  arr_literal: {
    label: 'array', cat: 'arrays', col: 'var(--col-array)',
    fields: [{ id: 'items', label: 'items (comma sep)', kind: 'text', def: '1, 2, 3' }],
    ins: [], outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n) => `[${n.f.items||''}]`
  },
  arr_push: {
    label: 'push', cat: 'arrays', col: 'var(--col-array)',
    fields: [], ins: [{ id: 'arr', label: 'array' }, { id: 'val', label: 'value' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `(${ge(n.id,'arr')}.push(${ge(n.id,'val')}), ${ge(n.id,'arr')})`
  },
  arr_pop: {
    label: 'pop', cat: 'arrays', col: 'var(--col-array)',
    fields: [], ins: [{ id: 'arr', label: 'array' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `${ge(n.id,'arr')}.pop()`
  },
  arr_map: {
    label: 'map', cat: 'arrays', col: 'var(--col-array)',
    fields: [{ id: 'fn', label: 'callback', kind: 'text', def: 'x => x' }],
    ins: [{ id: 'arr', label: 'array' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `${ge(n.id,'arr')}.map(${n.f.fn||'x => x'})`
  },
  arr_filter: {
    label: 'filter', cat: 'arrays', col: 'var(--col-array)',
    fields: [{ id: 'fn', label: 'predicate', kind: 'text', def: 'x => x' }],
    ins: [{ id: 'arr', label: 'array' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `${ge(n.id,'arr')}.filter(${n.f.fn||'x => x'})`
  },
  arr_reduce: {
    label: 'reduce', cat: 'arrays', col: 'var(--col-array)',
    fields: [
      { id: 'fn', label: 'reducer', kind: 'text', def: '(acc, x) => acc + x' },
      { id: 'init', label: 'initial value', kind: 'text', def: '0' }
    ],
    ins: [{ id: 'arr', label: 'array' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `${ge(n.id,'arr')}.reduce(${n.f.fn||'(acc,x)=>acc+x'}, ${n.f.init||'0'})`
  },
  arr_find: {
    label: 'find', cat: 'arrays', col: 'var(--col-array)',
    fields: [{ id: 'fn', label: 'predicate', kind: 'text', def: 'x => x' }],
    ins: [{ id: 'arr', label: 'array' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `${ge(n.id,'arr')}.find(${n.f.fn||'x => x'})`
  },
  arr_index: {
    label: 'index', cat: 'arrays', col: 'var(--col-array)',
    fields: [], ins: [{ id: 'arr', label: 'array' }, { id: 'idx', label: 'index' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `${ge(n.id,'arr')}[${ge(n.id,'idx')}]`
  },
  arr_length: {
    label: 'length', cat: 'arrays', col: 'var(--col-array)',
    fields: [], ins: [{ id: 'arr', label: 'array' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `${ge(n.id,'arr')}.length`
  },
  arr_join: {
    label: 'join', cat: 'arrays', col: 'var(--col-array)',
    fields: [{ id: 'sep', label: 'separator', kind: 'text', def: ', ' }],
    ins: [{ id: 'arr', label: 'array' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `${ge(n.id,'arr')}.join("${n.f.sep||', '}")`
  },
  arr_slice: {
    label: 'slice', cat: 'arrays', col: 'var(--col-array)',
    fields: [], ins: [{ id: 'arr', label: 'array' }, { id: 'start', label: 'start' }, { id: 'end', label: 'end' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `${ge(n.id,'arr')}.slice(${ge(n.id,'start')}, ${ge(n.id,'end')})`
  },
  spread: {
    label: 'spread', cat: 'arrays', col: 'var(--col-array)',
    fields: [], ins: [{ id: 'a', label: 'arr a' }, { id: 'b', label: 'arr b' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `[...${ge(n.id,'a')}, ...${ge(n.id,'b')}]`
  },
  obj_literal: {
    label: 'object', cat: 'objects', col: 'var(--col-obj)',
    fields: [{ id: 'props', label: 'props (raw js)', kind: 'text', def: 'a: 1, b: 2' }],
    ins: [], outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n) => `{ ${n.f.props||''} }`
  },
  obj_get: {
    label: 'get prop', cat: 'objects', col: 'var(--col-obj)',
    fields: [{ id: 'key', label: 'key', kind: 'text', def: 'key' }],
    ins: [{ id: 'obj', label: 'object' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `${ge(n.id,'obj')}.${n.f.key||'key'}`
  },
  obj_set: {
    label: 'set prop', cat: 'objects', col: 'var(--col-obj)',
    fields: [{ id: 'key', label: 'key', kind: 'text', def: 'key' }],
    ins: [{ id: 'obj', label: 'object' }, { id: 'val', label: 'value' }],
    outs: [], expr: false, stmt: true,
    gen: (n, ge) => `${ge(n.id,'obj')}.${n.f.key||'key'} = ${ge(n.id,'val')};`
  },
  obj_spread: {
    label: 'spread merge', cat: 'objects', col: 'var(--col-obj)',
    fields: [], ins: [{ id: 'a', label: 'obj a' }, { id: 'b', label: 'obj b' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `{ ...${ge(n.id,'a')}, ...${ge(n.id,'b')} }`
  },
  obj_keys: {
    label: 'keys', cat: 'objects', col: 'var(--col-obj)',
    fields: [], ins: [{ id: 'obj', label: 'object' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `Object.keys(${ge(n.id,'obj')})`
  },
  obj_values: {
    label: 'values', cat: 'objects', col: 'var(--col-obj)',
    fields: [], ins: [{ id: 'obj', label: 'object' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `Object.values(${ge(n.id,'obj')})`
  },
  json_parse: {
    label: 'JSON.parse', cat: 'convert', col: 'var(--col-conv)',
    fields: [], ins: [{ id: 'str', label: 'string' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `JSON.parse(${ge(n.id,'str')})`
  },
  json_stringify: {
    label: 'JSON.stringify', cat: 'convert', col: 'var(--col-conv)',
    fields: [{ id: 'indent', label: 'indent', kind: 'number', def: '2' }],
    ins: [{ id: 'val', label: 'value' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `JSON.stringify(${ge(n.id,'val')}, null, ${n.f.indent||'2'})`
  },
  num_parse: {
    label: 'parseFloat', cat: 'convert', col: 'var(--col-conv)',
    fields: [], ins: [{ id: 'val', label: 'value' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `parseFloat(${ge(n.id,'val')})`
  },
  int_parse: {
    label: 'parseInt', cat: 'convert', col: 'var(--col-conv)',
    fields: [{ id: 'radix', label: 'radix', kind: 'number', def: '10' }],
    ins: [{ id: 'val', label: 'value' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `parseInt(${ge(n.id,'val')}, ${n.f.radix||'10'})`
  },
  to_string: {
    label: 'toString', cat: 'convert', col: 'var(--col-conv)',
    fields: [], ins: [{ id: 'val', label: 'value' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `String(${ge(n.id,'val')})`
  },
  typeof_node: {
    label: 'typeof', cat: 'convert', col: 'var(--col-conv)',
    fields: [], ins: [{ id: 'val', label: 'value' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `typeof ${ge(n.id,'val')}`
  },
  promise: {
    label: 'new Promise', cat: 'async', col: 'var(--col-async)',
    fields: [
      { id: 'resolve_val', label: 'resolve value', kind: 'text', def: 'result' }
    ],
    ins: [],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n) => `new Promise((resolve, reject) => { resolve(${n.f.resolve_val||'result'}); })`
  },
  then: {
    label: '.then()', cat: 'async', col: 'var(--col-async)',
    fields: [{ id: 'fn', label: 'handler', kind: 'text', def: 'res => res' }],
    ins: [{ id: 'promise', label: 'promise' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `${ge(n.id,'promise')}.then(${n.f.fn||'res => res'})`
  },
  catch_err: {
    label: '.catch()', cat: 'async', col: 'var(--col-async)',
    fields: [{ id: 'fn', label: 'handler', kind: 'text', def: 'err => err' }],
    ins: [{ id: 'promise', label: 'promise' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `${ge(n.id,'promise')}.catch(${n.f.fn||'err => err'})`
  },
  await_node: {
    label: 'await', cat: 'async', col: 'var(--col-async)',
    fields: [], ins: [{ id: 'promise', label: 'promise' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `await ${ge(n.id,'promise')}`
  },
  fetch_node: {
    label: 'fetch', cat: 'async', col: 'var(--col-async)',
    fields: [{ id: 'method', label: 'method', kind: 'select', opts: ['GET','POST','PUT','DELETE','PATCH'], def: 'GET' }],
    ins: [{ id: 'url', label: 'url' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `fetch(${ge(n.id,'url')}, { method: "${n.f.method||'GET'}" })`
  },
  set_timeout: {
    label: 'setTimeout', cat: 'async', col: 'var(--col-async)',
    fields: [{ id: 'fn', label: 'callback', kind: 'text', def: '() => {}' }],
    ins: [{ id: 'delay', label: 'delay ms' }],
    outs: [],
    expr: false, stmt: true,
    gen: (n, ge) => `setTimeout(${n.f.fn||'() => {}'}, ${ge(n.id,'delay')});`
  },
  query_selector: {
    label: 'querySelector', cat: 'dom', col: 'var(--col-dom)',
    fields: [{ id: 'sel', label: 'selector', kind: 'text', def: '#app' }],
    ins: [],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n) => `document.querySelector("${n.f.sel||'#app'}")`
  },
  create_el: {
    label: 'createElement', cat: 'dom', col: 'var(--col-dom)',
    fields: [{ id: 'tag', label: 'tag', kind: 'text', def: 'div' }],
    ins: [],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n) => `document.createElement("${n.f.tag||'div'}")`
  },
  set_text: {
    label: 'set textContent', cat: 'dom', col: 'var(--col-dom)',
    fields: [], ins: [{ id: 'el', label: 'element' }, { id: 'text', label: 'text' }],
    outs: [], expr: false, stmt: true,
    gen: (n, ge) => `${ge(n.id,'el')}.textContent = ${ge(n.id,'text')};`
  },
  set_attr: {
    label: 'setAttribute', cat: 'dom', col: 'var(--col-dom)',
    fields: [{ id: 'attr', label: 'attribute', kind: 'text', def: 'class' }],
    ins: [{ id: 'el', label: 'element' }, { id: 'val', label: 'value' }],
    outs: [], expr: false, stmt: true,
    gen: (n, ge) => `${ge(n.id,'el')}.setAttribute("${n.f.attr||'class'}", ${ge(n.id,'val')});`
  },
  add_event: {
    label: 'addEventListener', cat: 'dom', col: 'var(--col-dom)',
    fields: [
      { id: 'event', label: 'event', kind: 'text', def: 'click' },
      { id: 'fn', label: 'handler', kind: 'text', def: '(e) => {}' }
    ],
    ins: [{ id: 'el', label: 'element' }],
    outs: [], expr: false, stmt: true,
    gen: (n, ge) => `${ge(n.id,'el')}.addEventListener("${n.f.event||'click'}", ${n.f.fn||'(e) => {}'});`
  },
  append_child: {
    label: 'appendChild', cat: 'dom', col: 'var(--col-dom)',
    fields: [], ins: [{ id: 'parent', label: 'parent' }, { id: 'child', label: 'child' }],
    outs: [], expr: false, stmt: true,
    gen: (n, ge) => `${ge(n.id,'parent')}.appendChild(${ge(n.id,'child')});`
  },
  date_now: {
    label: 'Date.now()', cat: 'date', col: 'var(--col-date)',
    fields: [],
    ins: [],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: () => `Date.now()`
  },
  new_date: {
    label: 'new Date', cat: 'date', col: 'var(--col-date)',
    fields: [],
    ins: [{ id: 'val', label: 'timestamp' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `new Date(${ge(n.id,'val')})`
  },
  date_format: {
    label: 'toLocaleDateString', cat: 'date', col: 'var(--col-date)',
    fields: [{ id: 'locale', label: 'locale', kind: 'text', def: 'en-US' }],
    ins: [{ id: 'date', label: 'date' }],
    outs: [{ id: 'out', label: 'out' }], expr: true,
    gen: (n, ge) => `${ge(n.id,'date')}.toLocaleDateString("${n.f.locale||'en-US'}")`
  },
  log: {
    label: 'console.log', cat: 'output', col: 'var(--col-out)',
    fields: [], ins: [{ id: 'val', label: 'value' }], outs: [],
    expr: false, stmt: true,
    gen: (n, ge) => `console.log(${ge(n.id,'val')});`
  },
  console_error: {
    label: 'console.error', cat: 'output', col: 'var(--col-out)',
    fields: [], ins: [{ id: 'val', label: 'value' }], outs: [],
    expr: false, stmt: true,
    gen: (n, ge) => `console.error(${ge(n.id,'val')});`
  },
  alert_node: {
    label: 'alert', cat: 'output', col: 'var(--col-out)',
    fields: [], ins: [{ id: 'val', label: 'message' }], outs: [],
    expr: false, stmt: true,
    gen: (n, ge) => `alert(${ge(n.id,'val')});`
  },
  comment: {
    label: 'comment', cat: 'output', col: 'var(--col-out)',
    fields: [{ id: 'text', label: 'text', kind: 'text', def: 'note here' }],
    ins: [], outs: [], expr: false, stmt: true,
    gen: (n) => `// ${n.f.text||''}`
  },
  raw_js: {
    label: 'raw js', cat: 'output', col: 'var(--col-out)',
    fields: [{ id: 'code', label: 'code', kind: 'text', def: '' }],
    ins: [], outs: [], expr: false, stmt: true,
    gen: (n) => n.f.code || ''
  }
};

const TABS = [
  { id: 'values', label: 'values' },
  { id: 'variables', label: 'vars' },
  { id: 'math', label: 'math' },
  { id: 'logic', label: 'logic' },
  { id: 'control', label: 'flow' },
  { id: 'functions', label: 'fns' },
  { id: 'strings', label: 'str' },
  { id: 'arrays', label: 'arr' },
  { id: 'objects', label: 'obj' },
  { id: 'convert', label: 'conv' },
  { id: 'async', label: 'async' },
  { id: 'dom', label: 'dom' },
  { id: 'date', label: 'date' },
  { id: 'output', label: 'out' },
];

let nodes = {};
let conns = {};
let nid = 1;
let pan = { x: 60, y: 60 };
let zoom = 1;
let dragNode = null, dragStart = null, dragNodeOrigin = null;
let panning = false, panStart = null, panOrigin = null;
let pending = null;
let selected = null;
let db = null;

function uid() { return 'n' + (nid++); }
function cuid() { return 'c' + (nid++); }

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(t._tid);
  t._tid = setTimeout(() => t.classList.remove('on'), 1900);
}

function showHint() {
  const h = document.getElementById('hint');
  h.style.opacity = Object.keys(nodes).length === 0 ? '1' : '0';
}

function updateCoords() {
  const ox = Math.round(-pan.x / zoom);
  const oy = Math.round(-pan.y / zoom);
  document.getElementById('coord-x').textContent = ox;
  document.getElementById('coord-y').textContent = oy;
  document.getElementById('coord-z').textContent = Math.round(zoom * 100) + '%';
}

function applyTransform() {
  document.getElementById('canvas').style.transform = `translate(${pan.x}px,${pan.y}px) scale(${zoom})`;
  document.getElementById('grid-bg').style.backgroundPosition = `${pan.x}px ${pan.y}px`;
  document.getElementById('grid-bg').style.backgroundSize = `${24*zoom}px ${24*zoom}px`;
  updateCoords();
}

function portEl(nid, dir, pid) {
  return document.getElementById(`p-${nid}-${dir}-${pid}`);
}

function portPos(nid, dir, pid) {
  const el = portEl(nid, dir, pid);
  if (!el) return null;
  const canvasEl = document.getElementById('canvas');
  const cr = canvasEl.getBoundingClientRect();
  const pr = el.getBoundingClientRect();
  return {
    x: (pr.left + pr.width / 2 - cr.left) / zoom,
    y: (pr.top + pr.height / 2 - cr.top) / zoom
  };
}

function bezier(x1, y1, x2, y2) {
  const dx = Math.abs(x2 - x1) * 0.55;
  return `M ${x1} ${y1} C ${x1+dx} ${y1}, ${x2-dx} ${y2}, ${x2} ${y2}`;
}

function drawWires() {
  const svg = document.getElementById('svg-overlay');
  Array.from(svg.querySelectorAll('.wire:not(.temp)')).forEach(e => e.remove());
  Object.values(conns).forEach(c => {
    const fp = portPos(c.fn, 'out', c.fp);
    const tp = portPos(c.tn, 'in', c.tp);
    if (!fp || !tp) return;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', bezier(fp.x, fp.y, tp.x, tp.y));
    path.classList.add('wire');
    const col = TYPES[nodes[c.fn]?.type]?.col;
    if (col) path.style.stroke = col;
    path.dataset.cid = c.id;
    path.addEventListener('click', ev => {
      ev.stopPropagation();
      removeConn(c.id);
    });
    svg.appendChild(path);
  });
  refreshPortStates();
}

function refreshPortStates() {
  document.querySelectorAll('.port').forEach(p => p.classList.remove('live'));
  Object.values(conns).forEach(c => {
    portEl(c.fn, 'out', c.fp)?.classList.add('live');
    portEl(c.tn, 'in', c.tp)?.classList.add('live');
  });
}

function removeConn(id) {
  delete conns[id];
  drawWires();
}

function addConn(fn, fp, tn, tp) {
  if (fn === tn) return;
  const existing = Object.values(conns).find(c => c.tn === tn && c.tp === tp);
  if (existing) delete conns[existing.id];
  const id = cuid();
  conns[id] = { id, fn, fp, tn, tp };
  drawWires();
}

function clearPending() {
  document.querySelectorAll('.port.active').forEach(p => p.classList.remove('active'));
  document.getElementById('svg-overlay').querySelectorAll('.temp').forEach(e => e.remove());
  pending = null;
}

function spawnNode(type) {
  const cw = document.getElementById('canvas-wrap');
  const rect = cw.getBoundingClientRect();
  const cx = (rect.width / 2 - pan.x) / zoom + (Math.random()-0.5)*80;
  const cy = (rect.height / 2 - pan.y) / zoom + (Math.random()-0.5)*60;
  makeNode(type, cx, cy);
}

function makeNode(type, x, y) {
  const def = TYPES[type];
  if (!def) return;
  const id = uid();
  const f = {};
  def.fields.forEach(fld => f[fld.id] = fld.def || '');
  nodes[id] = { id, type, x, y, f };
  renderNode(id);
  drawWires();
  showHint();
  return id;
}

function deleteNode(id) {
  Object.keys(conns).forEach(cid => {
    if (conns[cid].fn === id || conns[cid].tn === id) delete conns[cid];
  });
  delete nodes[id];
  document.getElementById('node-' + id)?.remove();
  drawWires();
  showHint();
}

function nukeAll() {
  nodes = {}; conns = {};
  document.querySelectorAll('.node').forEach(e => e.remove());
  drawWires(); showHint();
}

function renderNode(id) {
  const n = nodes[id];
  const def = TYPES[n.type];
  const wrap = document.createElement('div');
  wrap.className = 'node';
  wrap.id = 'node-' + id;
  wrap.style.left = n.x + 'px';
  wrap.style.top = n.y + 'px';

  const head = document.createElement('div');
  head.className = 'node-head';
  head.innerHTML = `<div class="nd" style="background:${def.col}"></div><span class="nlabel">${def.label}</span>`;
  const xbtn = document.createElement('button');
  xbtn.className = 'nclose'; xbtn.textContent = '×';
  xbtn.addEventListener('click', e => { e.stopPropagation(); deleteNode(id); });
  head.appendChild(xbtn);
  wrap.appendChild(head);

  const body = document.createElement('div');
  body.className = 'nbody';

  def.fields.forEach(fld => {
    const fdiv = document.createElement('div');
    fdiv.className = 'nfield';
    const lbl = document.createElement('span');
    lbl.className = 'nflabel'; lbl.textContent = fld.label;
    fdiv.appendChild(lbl);
    let inp;
    if (fld.kind === 'select') {
      inp = document.createElement('select');
      inp.className = 'nfsel';
      fld.opts.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o; opt.textContent = o;
        if (n.f[fld.id] === o) opt.selected = true;
        inp.appendChild(opt);
      });
    } else {
      inp = document.createElement('input');
      inp.className = 'nfinput'; inp.type = fld.kind === 'number' ? 'number' : 'text';
      inp.value = n.f[fld.id] || '';
    }
    inp.addEventListener('input', e => { n.f[fld.id] = e.target.value; });
    inp.addEventListener('change', e => { n.f[fld.id] = e.target.value; });
    inp.addEventListener('mousedown', e => e.stopPropagation());
    fdiv.appendChild(inp);
    body.appendChild(fdiv);
  });

  const portSec = document.createElement('div');
  portSec.className = 'ports-wrap';

  const lcol = document.createElement('div');
  lcol.className = 'pcol';
  def.ins.forEach(p => {
    const row = document.createElement('div');
    row.className = 'prow';
    const dot = document.createElement('div');
    dot.className = 'port'; dot.id = `p-${id}-in-${p.id}`;
    dot.dataset.node = id; dot.dataset.port = p.id; dot.dataset.dir = 'in';
    const lbl = document.createElement('span');
    lbl.className = 'plabel'; lbl.textContent = p.label;
    row.appendChild(dot); row.appendChild(lbl);
    lcol.appendChild(row);
    dot.addEventListener('mousedown', e => {
      e.stopPropagation(); e.preventDefault();
      if (pending) {
        addConn(pending.fn, pending.fp, id, p.id);
        clearPending();
      } else {
        const ex = Object.values(conns).find(c => c.tn === id && c.tp === p.id);
        if (ex) { removeConn(ex.id); }
      }
    });
  });
  portSec.appendChild(lcol);

  const rcol = document.createElement('div');
  rcol.className = 'pcol right';
  def.outs.forEach(p => {
    const row = document.createElement('div');
    row.className = 'prow right';
    const dot = document.createElement('div');
    dot.className = 'port'; dot.id = `p-${id}-out-${p.id}`;
    dot.dataset.node = id; dot.dataset.port = p.id; dot.dataset.dir = 'out';
    const lbl = document.createElement('span');
    lbl.className = 'plabel'; lbl.textContent = p.label;
    row.appendChild(dot); row.appendChild(lbl);
    rcol.appendChild(row);
    dot.addEventListener('mousedown', e => {
      e.stopPropagation(); e.preventDefault();
      clearPending();
      pending = { fn: id, fp: p.id };
      dot.classList.add('active');
    });
  });
  portSec.appendChild(rcol);
  body.appendChild(portSec);
  wrap.appendChild(body);
  document.getElementById('canvas').appendChild(wrap);

  head.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    e.stopPropagation();
    selectNode(id);
    dragNode = id;
    dragStart = { x: e.clientX, y: e.clientY };
    dragNodeOrigin = { x: n.x, y: n.y };
  });

  wrap.addEventListener('mousedown', () => selectNode(id));
}

function selectNode(id) {
  selected = id;
  document.querySelectorAll('.node').forEach(n => n.classList.remove('sel'));
  document.getElementById('node-' + id)?.classList.add('sel');
}

const canvasWrap = document.getElementById('canvas-wrap');

canvasWrap.addEventListener('mousedown', e => {
  if (e.button !== 0) return;
  if (e.target === canvasWrap || e.target.id === 'grid-bg' || e.target.id === 'canvas' || e.target.id === 'svg-overlay') {
    if (pending) { clearPending(); return; }
    panning = true;
    panStart = { x: e.clientX, y: e.clientY };
    panOrigin = { ...pan };
    canvasWrap.style.cursor = 'grabbing';
    selected = null;
    document.querySelectorAll('.node').forEach(n => n.classList.remove('sel'));
  }
});

document.addEventListener('mousemove', e => {
  if (dragNode) {
    const n = nodes[dragNode];
    if (!n) return;
    n.x = dragNodeOrigin.x + (e.clientX - dragStart.x) / zoom;
    n.y = dragNodeOrigin.y + (e.clientY - dragStart.y) / zoom;
    const el = document.getElementById('node-' + dragNode);
    if (el) { el.style.left = n.x + 'px'; el.style.top = n.y + 'px'; }
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
    const svg = document.getElementById('svg-overlay');
    svg.querySelectorAll('.temp').forEach(e => e.remove());
    const fp = portPos(pending.fn, 'out', pending.fp);
    if (!fp) return;
    const canvasEl = document.getElementById('canvas');
    const cr = canvasEl.getBoundingClientRect();
    const mx = (e.clientX - cr.left) / zoom;
    const my = (e.clientY - cr.top) / zoom;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', bezier(fp.x, fp.y, mx, my));
    path.classList.add('wire', 'temp');
    svg.appendChild(path);
  }
});

document.addEventListener('mouseup', () => {
  dragNode = null;
  if (panning) { panning = false; canvasWrap.style.cursor = 'default'; }
});

canvasWrap.addEventListener('wheel', e => {
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
}, { passive: false });

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') clearPending();
  if ((e.key === 'Delete' || e.key === 'Backspace') && selected && !['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)) {
    deleteNode(selected);
    selected = null;
  }
});

function zoomBy(factor) {
  const cw = document.getElementById('canvas-wrap');
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

document.getElementById('zoom-in-btn').addEventListener('click', () => zoomBy(1.2));
document.getElementById('zoom-out-btn').addEventListener('click', () => zoomBy(1/1.2));
document.getElementById('home-btn').addEventListener('click', () => {
  pan = { x: 60, y: 60 };
  zoom = 1;
  applyTransform();
  drawWires();
  toast('back to origin');
});

function compileCode() {
  function getExpr(nodeId, portId) {
    const c = Object.values(conns).find(c => c.tn === nodeId && c.tp === portId);
    if (!c) return '/* unconnected */';
    const src = nodes[c.fn];
    const def = TYPES[src?.type];
    if (!def) return '/* error */';
    if (def.ref) return def.ref(src);
    if (def.expr) return def.gen(src, getExpr);
    return '/* non-expr */';
  }
  const sorted = Object.values(nodes).sort((a, b) => a.y - b.y);
  const lines = [];
  sorted.forEach(n => {
    const def = TYPES[n.type];
    if (!def) return;
    if (def.stmt) {
      lines.push(def.gen(n, getExpr));
    } else if (def.expr) {
      const hasOutConn = Object.values(conns).some(c => c.fn === n.id);
      if (!hasOutConn) lines.push(def.gen(n, getExpr) + ';');
    }
  });
  return lines.length ? lines.join('\n') : '// nothing to compile yet';
}

function closeAllDD() {
  document.querySelectorAll('.dd-menu').forEach(m => m.classList.remove('open'));
}

function toggleDD(id) {
  const menu = document.getElementById(id);
  const wasOpen = menu.classList.contains('open');
  closeAllDD();
  if (!wasOpen) menu.classList.add('open');
}

document.addEventListener('click', e => {
  if (!e.target.closest('.dd')) closeAllDD();
});

let activeTab = TABS[0].id;

function buildSidebar() {
  const tabBar = document.getElementById('sidebar-tabs');
  const panesContainer = document.getElementById('sidebar-panes');

  TABS.forEach(tab => {
    const t = document.createElement('div');
    t.className = 'stab' + (tab.id === activeTab ? ' active' : '');
    t.textContent = tab.label;
    t.dataset.tab = tab.id;
    t.addEventListener('click', () => switchTab(tab.id));
    tabBar.appendChild(t);

    const pane = document.createElement('div');
    pane.className = 'tab-pane' + (tab.id === activeTab ? ' active' : '');
    pane.id = 'pane-' + tab.id;

    const entries = Object.entries(TYPES).filter(([, def]) => def.cat === tab.id);
    entries.forEach(([type, def]) => {
      const item = document.createElement('div');
      item.className = 'palette-item';
      item.innerHTML = `<div class="palette-dot" style="background:${def.col}"></div>${def.label}`;
      item.addEventListener('click', () => spawnNode(type));
      pane.appendChild(item);
    });

    panesContainer.appendChild(pane);
  });
}

function switchTab(tabId) {
  activeTab = tabId;
  document.querySelectorAll('.stab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.id === 'pane-' + tabId));
}

function buildSaveLoad() {
  const saveMenu = document.getElementById('save-dd-menu');
  const loadMenu = document.getElementById('load-dd-menu');
  for (let i = 1; i <= 5; i++) {
    const sr = document.createElement('div');
    sr.className = 'dd-row'; sr.id = `save-s${i}`;
    sr.innerHTML = `<span class="dd-dot-fill"></span> slot ${i}`;
    sr.addEventListener('click', () => saveSlot(i));
    saveMenu.appendChild(sr);

    const lr = document.createElement('div');
    lr.className = 'dd-row'; lr.id = `load-s${i}`;
    lr.innerHTML = `<span class="dd-dot-fill"></span> slot ${i}`;
    lr.addEventListener('click', () => loadSlot(i));
    loadMenu.appendChild(lr);
  }
}

document.getElementById('save-btn').addEventListener('click', () => toggleDD('save-dd-menu'));
document.getElementById('load-btn').addEventListener('click', () => toggleDD('load-dd-menu'));
document.getElementById('clear-btn').addEventListener('click', () => { nukeAll(); toast('canvas cleared'); });

document.getElementById('compile-btn').addEventListener('click', () => {
  const modal = document.getElementById('compile-modal');
  const body = document.getElementById('modal-body');
  const foot = document.getElementById('modal-foot');
  const title = document.getElementById('modal-title');

  title.textContent = 'compiling...';
  body.innerHTML = '<div class="compile-loading"><span id="compile-dots">.</span></div>';
  foot.style.display = 'none';
  modal.classList.add('open');

  const dots = document.getElementById('compile-dots');
  let d = 0;
  const dotInterval = setInterval(() => {
    d = (d + 1) % 3;
    dots.textContent = '.'.repeat(d + 1);
  }, 350);

  const delay = 1000 + Math.random() * 2000;
  setTimeout(() => {
    clearInterval(dotInterval);
    let code;
    try { code = compileCode(); } catch(err) { code = '// compile error: ' + err.message; }
    title.textContent = 'compiled output';
    body.innerHTML = '';
    const cb = document.createElement('div');
    cb.className = 'codebox';
    cb.id = 'codebox';
    cb.textContent = code;
    body.appendChild(cb);
    foot.style.display = 'flex';
  }, delay);
});

document.getElementById('modal-close').addEventListener('click', () => document.getElementById('compile-modal').classList.remove('open'));
document.getElementById('done-btn').addEventListener('click', () => document.getElementById('compile-modal').classList.remove('open'));
document.getElementById('copy-btn').addEventListener('click', () => {
  const cb = document.getElementById('modal-body').querySelector('.codebox');
  if (!cb) return;
  const text = cb.textContent;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => toast('copied!')).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
});

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try { document.execCommand('copy'); toast('copied!'); } catch(e) { toast('copy failed'); }
  document.body.removeChild(ta);
}

function initDB() {
  return new Promise((res, rej) => {
    const req = indexedDB.open('cupcake_v2', 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore('slots', { keyPath: 'slot' });
    req.onsuccess = e => { db = e.target.result; res(); };
    req.onerror = rej;
  });
}

function dbSet(slot, data) {
  return new Promise(res => {
    const tx = db.transaction('slots', 'readwrite');
    tx.objectStore('slots').put({ slot, data });
    tx.oncomplete = res;
  });
}

function dbGet(slot) {
  return new Promise(res => {
    const req = db.transaction('slots', 'readonly').objectStore('slots').get(slot);
    req.onsuccess = e => res(e.target.result?.data || null);
  });
}

function dbKeys() {
  return new Promise(res => {
    const req = db.transaction('slots', 'readonly').objectStore('slots').getAllKeys();
    req.onsuccess = e => res(e.target.result);
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
  if (!raw) { toast(`slot ${slot} is empty`); return; }
  const data = JSON.parse(raw);
  nukeAll();
  nodes = data.nodes || {};
  conns = data.conns || {};
  nid = data.nid || 100;
  Object.keys(nodes).forEach(id => renderNode(id));
  drawWires();
  showHint();
  toast(`loaded slot ${slot}`);
}

async function refreshIndicators() {
  const filled = await dbKeys();
  for (let i = 1; i <= 5; i++) {
    const has = filled.includes(i);
    document.getElementById(`save-s${i}`)?.classList.toggle('filled', has);
    document.getElementById(`load-s${i}`)?.classList.toggle('filled', has);
  }
}

async function boot() {
  buildSidebar();
  buildSaveLoad();
  await initDB();
  await refreshIndicators();
  applyTransform();
  showHint();
}

boot();

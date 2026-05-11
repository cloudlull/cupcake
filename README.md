# cupcake 🧁

a visual node-based javascript editor that lets you build programs by connecting blocks together, then compiles them to clean js!

## what it is

cupcake is a canvas-based tool where javascript concepts become draggable nodes with ports you connect together. string operations, math, loops, fetch calls, dom manipulation -- each one is a node. wire them up, hit run, and the console shows your output. hit compile and you get formatted javascript you can copy or download!

it runs entirely in the browser. no server, no accounts, no build step!

## features

**canvas**
- drag nodes around a zoomable, pannable infinite canvas
- scroll to zoom, drag the background to pan
- shift + drag on empty canvas to draw a labeled group frame
- minimap in the bottom-right corner for navigation, click to jump

**nodes**
- 100+ node types covering values, math, logic, control flow, functions, strings, arrays, objects, async, dom, dates, and more
- connect output ports to input ports to wire data between nodes
- click a wire to delete it
- right-click anything for an info panel

**editing**
- undo / redo with full history
- copy and paste nodes (preserves internal connections)
- select multiple nodes with shift+click
- drag a group frame to move everything inside it together
- find nodes on the canvas with ctrl+f
- quick-add nodes by searching with ctrl+b

**running code**
- the run button executes compiled output in a sandboxed web worker
- infinite loops and bad code time out after 5 seconds instead of freezing the tab
- console shows log, warn, error, and info output with timestamps
- alerts are intercepted and shown inline

**compiling**
- nodes sort by vertical position and generate javascript in order
- prettier formats the output automatically
- toggle esm mode to wrap output as an es module with exports
- download the result as a .js file or copy to clipboard

**importing**
- paste existing javascript and it parses into nodes automatically
- handles variables, math, comparisons, loops, function calls, array/object methods, and more

**saving**
- 5 save slots backed by indexeddb
- panel sizes are saved to localstorage and restored on reload

**embed**
- generates an iframe snippet that encodes your graph in the url
- no server needed, the entire graph lives in the hash

## keyboard shortcuts

| shortcut | action |
|---|---|
| ctrl/cmd + z | undo |
| ctrl/cmd + shift + z | redo |
| ctrl/cmd + c | copy selected |
| ctrl/cmd + v | paste |
| ctrl/cmd + a | select all |
| ctrl/cmd + f | find node on canvas |
| ctrl/cmd + b | quick-add node search |
| delete / backspace | delete selected node(s) |
| shift + drag canvas | draw a group frame |
| scroll | zoom in/out |
| escape | cancel pending connection or close search |
| ? | keyboard shortcut reference |

## node categories

| category | what's in it |
|---|---|
| values | string, number, boolean, null, undefined, NaN, Infinity |
| variables | let/const/var declaration, assignment, destructuring |
| math | arithmetic, Math methods, bitwise ops, trig |
| logic | comparisons, and/or/not, nullish coalescing, instanceof, in |
| control flow | if, for, while, do...while, for...of, for...in, switch, try/catch, break, continue |
| functions | function, arrow fn, async fn, call, method call, return, iife |
| strings | concat, template strings, slice, split, replace, match, regex tester, and more |
| arrays | push/pop, map, filter, reduce, find, sort, flat, Set, and more |
| objects | get/set prop, spread merge, Object.keys/values/entries/assign/freeze |
| convert | JSON.parse/stringify, parseInt, parseFloat, Number, Boolean, typeof |
| async | fetch, http request, await, .then/.catch, setTimeout, setInterval, Promise.all/race |
| dom | querySelector, createElement, setAttribute, classList, addEventListener, innerHTML |
| date | Date.now, new Date, toLocaleDateString |
| output | console.log/error/warn/table, alert, comment, raw js |

## running locally

cupcake is static html, css, and js. drop the files in any folder and open index.html (or app.html, index.html just redirects you to app.html anyways), or serve with anything:

```
npx serve .
python -m http.server
```

no dependencies to install.

## technical notes

- compiled code runs in a `Worker` created from a blob url, completely isolated from the main thread
- saves use indexeddb via a simple slot system
- wires are svg bezier curves drawn over the canvas in a single overlay element
- the js importer uses acorn to parse code into an ast, then maps ast nodes to cupcake node types
- prettier is loaded on demand from unpkg when you first compile
- the canvas is a 6000x6000px div with css transform for pan/zoom

## browser support

desktop only. chrome, firefox, and safari all work. mobile is blocked by design since the editor needs a pointer and enough screen real estate to be usable! sorry mobile guys :(

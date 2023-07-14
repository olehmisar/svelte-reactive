# svelte-reactive

An alternative to svelte's `derived` store with API similar to $ in svelte components.

```js
// svelte's derived
const sum = derived([a, b], ([$a, $b]) => $a + $b);

// VS

// svelte-reactive
const sum = reactive(($) => $(a) + $(b));
```

## Installation

```bash
npm install svelte-reactive
```

## Usage

```js
import { writable, get } from "svelte/store";
import { reactive } from "svelte-reactive";

const a = writable(1);
const b = writable(2);
const sum = reactive(($) => $(a) + $(b));
console.log(get(sum)); // 3
a.set(5);
console.log(get(sum)); // 7
```

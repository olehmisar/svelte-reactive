# svelte-reactive

An alternative to svelte's `derived` store with API similar to $ in svelte components.

```js
// svelte-reactive
const sum = reactive(($) => $(numberA) + $(numberB));

// VS

// svelte's derived
const sum = derived(
  [numberA, numberB],
  ([$numberA, $numberB]) => $numberA + $numberB,
);
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

Works with `if` blocks too:

```js
const numerator = writable(1);
const denominator = writable(0);
const fraction = reactive(($) => {
  if ($(denominator) === 0) {
    return 0;
  }
  return $(numerator) / $(denominator);
});
console.log(get(fraction)); // 0
b.set(2);
console.log(get(fraction)); // 0.5
```

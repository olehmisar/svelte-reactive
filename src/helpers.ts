import type { Readable } from "svelte/store";

export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function readStoreToArray<T>(store: Readable<T>) {
  const values: T[] = [];
  store.subscribe((value) => values.push(value));
  return values;
}

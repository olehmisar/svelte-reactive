import { readable, type Readable, type Unsubscriber } from "svelte/store";

export function reactive<T>(fn: ($: Getter) => T): Readable<T> {
  return readable<T>(undefined, (set) => {
    const subscriptions = new Map<Readable<unknown>, Unsubscriber>();
    const values = new Map<Readable<unknown>, unknown>();
    let started = false;
    const $: Getter = (store) => {
      if (!subscriptions.has(store)) {
        subscriptions.set(
          store,
          store.subscribe((value) => {
            values.set(store, value);
            if (started && subscriptions.has(store)) {
              sync();
            }
          }),
        );
      }
      return values.get(store) as any;
    };
    function sync() {
      set(fn($));
    }
    sync();
    started = true;
    return function stop() {
      for (const unsubscribe of subscriptions.values()) {
        unsubscribe();
      }
      started = false;
    };
  });
}

type Getter = <S>(store: Readable<S>) => S;

import { readable, type Readable, type Unsubscriber } from "svelte/store";

export function reactive<T>(fn: ($: Getter) => T): Readable<T> {
  // TODO: this is a hack, maybe remove it in the future?
  let wasCalled = false;
  return readable<T>(undefined, (set) => {
    const subscriptions = new Map<Readable<unknown>, Unsubscriber>();
    const values = new Map<Readable<unknown>, unknown>();
    let started = false;
    const $: Getter = (store) => {
      wasCalled = true;

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
      if (!wasCalled) {
        console.error("reactive: $ is not used. This is likely a mistake.");
      }
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

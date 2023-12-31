import { reactive } from "$lib/reactive";
import { get, writable } from "svelte/store";
import { describe, expect, it, vi } from "vitest";
import { readStoreToArray, sleep } from "./helpers";

describe("reactive", () => {
  it("adds 1 + 2 to equal 3", () => {
    const a = writable(1);
    const b = writable(2);
    const sum = reactive(($) => $(a) + $(b));
    expect(get(sum)).toBe(3);
  });

  it("works for a stream of data", async () => {
    const a = writable(1, (set) => {
      (async () => {
        await sleep(1);
        set(2);
      })();
    });
    const b = writable(2, (set) => {
      (async () => {
        await sleep(2);
        set(3);
      })();
    });
    const sum = reactive(($) => $(a) + $(b));
    const values = readStoreToArray(sum);
    await sleep(3);
    expect(values).toEqual([3, 4, 5]);
  });

  it("works with if", async () => {
    const a = writable(1);
    const b = writable(2);
    // initially set to false to test if it picks up dependencies dynamically
    const show = writable(false);
    const sum = reactive(($) => ($(show) ? $(a) + $(b) : 0));
    const values = readStoreToArray(sum);
    expect(values).toEqual([0]);
    show.set(true);
    expect(values).toEqual([0, 3]);
    a.set(2);
    expect(values).toEqual([0, 3, 4]);
    show.set(false);
    expect(values).toEqual([0, 3, 4, 0]);
    a.set(3);
    b.set(4);
    show.set(true);
    expect(values).toEqual([0, 3, 4, 0, 7]);
  });

  it("works with for loop", async () => {
    const stores = [writable(1), writable(10), writable(100)];
    const sum = reactive(($) => {
      let total = 0;
      for (const store of stores) {
        total += $(store);
      }
      return total;
    });
    const values = readStoreToArray(sum);
    stores[0].set(2);
    stores[1].set(20);
    stores[2].set(200);
    expect(values).toEqual([111, 112, 122, 222]);
  });

  it("correctly unsubscribes", () => {
    const a = writable(1);
    const b = writable(2);
    const sum = reactive(($) => $(a) + $(b));
    const values: number[] = [];
    const unsubscribe = sum.subscribe((value) => values.push(value));
    expect(values).toEqual([3]);
    a.set(2);
    expect(values).toEqual([3, 4]);
    unsubscribe();
    a.set(3);
    b.set(4);
    expect(values).toEqual([3, 4]);
    // if subscribed again, value is changed
    expect(get(sum)).toBe(7);
  });

  it("works with nested reactive stores", () => {
    const a = writable(1);
    const b = reactive(($) => $(a) * 2);
    const c = reactive(($) => $(b) + 3);

    const values = readStoreToArray(c);
    expect(values).toEqual([5]);

    a.set(2);
    expect(values).toEqual([5, 7]);

    a.set(3);
    expect(values).toEqual([5, 7, 9]);
  });

  it("warns if $ is not used", () => {
    const consoleSpy = vi.spyOn(console, "error");
    const a = writable(1);
    const flag = false;
    const z = reactive(($) => {
      if (!flag) {
        return;
      }
      return $(a);
    });
    get(z);
    expect(consoleSpy).toHaveBeenCalledWith(
      "reactive: $ is not used. This is likely a mistake.",
    );
  });

  describe("examples", () => {
    it("works with if", () => {
      const a = writable(1);
      const b = writable(0);
      const fraction = reactive(($) => {
        if ($(b) === 0) {
          return 0;
        }
        return $(a) / $(b);
      });
      console.log(get(fraction)); // 0
      b.set(2);
      console.log(get(fraction)); // 0.5
    });

    it("not reactive with not stores", () => {
      const numerator = writable(1);
      let denominator = 0; // not a store
      const fraction = reactive(($) => {
        if (denominator === 0) {
          return 0;
        }
        return $(numerator) / denominator;
      });
      // this will print 0 once and never again
      fraction.subscribe((value) => console.log(value));
      // this will not re-compute `fraction`
      denominator = 2;
      // even updating `numerator` will not re-compute `fraction`
      // because `$(numerator)` was never called inside `fraction`
      numerator.set(5);
    });
  });
});

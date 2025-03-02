import { reactive } from "$lib/index.js";
import { writable } from "svelte/store";

export const numerator = writable(1);
export const denominator = writable(2);
export const fraction = reactive(($) => $(numerator) / $(denominator));

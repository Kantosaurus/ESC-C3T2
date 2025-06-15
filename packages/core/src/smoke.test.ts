import { expect, test } from "vitest";
import * as core from "./index";

test("Smoke Test", () => {
  expect(!!core).toBe(true);
});

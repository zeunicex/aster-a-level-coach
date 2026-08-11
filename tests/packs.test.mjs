import assert from "node:assert/strict";
import test from "node:test";
import { canTransitionPack, packOrderForSource } from "../lib/biology-content.ts";

test("maps every live question source back to its content pack", () => {
  assert.equal(packOrderForSource("TMJC Biomolecules.pdf · printed p.16"), 2);
  assert.equal(packOrderForSource("Cellular Respiration.pdf · PDF p.11"), 6);
  assert.equal(packOrderForSource("Unknown notes"), null);
});

test("requires verification before publishing and questions before verification", () => {
  assert.equal(canTransitionPack("Draft", "Live", 12), false);
  assert.equal(canTransitionPack("Draft", "Verified", 0), false);
  assert.equal(canTransitionPack("Draft", "Verified", 12), true);
  assert.equal(canTransitionPack("Verified", "Live", 12), true);
  assert.equal(canTransitionPack("Live", "Draft", 12), true);
});

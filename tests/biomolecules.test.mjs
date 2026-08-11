import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { biomoleculeQuestions } from "../lib/biology-content.ts";

test("Biomolecules pack is source-linked and has adaptive follow-ups", () => {
  assert.equal(biomoleculeQuestions.length, 30);
  assert.equal(new Set(biomoleculeQuestions.map((question) => question.id)).size, 30);
  assert.deepEqual(new Set(biomoleculeQuestions.map((question) => question.format ?? "mcq")), new Set(["mcq", "image", "sequence", "data", "structured", "practical"]));
  for (const code of ["1(g)", "1(h)", "1(i)"]) {
    assert.ok(biomoleculeQuestions.filter((question) => question.code === code).length >= 3);
  }
  for (const question of biomoleculeQuestions) {
    assert.ok(existsSync(`public${question.sourceImage}`), question.sourceImage);
    if (question.markPoints) assert.equal(question.markPoints.length, question.marks);
    else assert.ok(question.answer >= 0 && question.answer < question.options.length);
  }
});

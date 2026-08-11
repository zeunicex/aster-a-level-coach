import assert from "node:assert/strict";
import test from "node:test";
import { gradeStructuredAnswer } from "../lib/marking.mjs";

test("automatically awards only mark points supported by the written response", () => {
  const points = [
    "ATP hydrolysis transfers phosphate to the transport protein",
    "Phosphorylation changes the protein conformation",
    "The solute is moved against its concentration gradient",
    "The solute is released on the opposite side",
  ];
  const result = gradeStructuredAnswer(points, "ATP is hydrolysed and phosphate binds the pump. This changes the pump shape so ions move against the concentration gradient.");
  assert.deepEqual(result.awardedPointIndexes, [0, 1, 2]);
});

test("does not award vague answers that repeat only generic words", () => {
  const points = ["Hydrogen bonds form between parallel cellulose chains", "The chains assemble into strong microfibrils"];
  assert.deepEqual(gradeStructuredAnswer(points, "The structure is strong and useful.").awardedPointIndexes, []);
});

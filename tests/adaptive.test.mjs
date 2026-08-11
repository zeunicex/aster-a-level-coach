import assert from "node:assert/strict";
import test from "node:test";
import { evidenceConfidence, evidenceDelta, pickNextQuestion } from "../lib/adaptive.mjs";

test("weights independent, confident answers more than hinted or uncertain answers", () => {
  assert.equal(evidenceDelta({ correct: true, confidence: "High", difficulty: 2 }), 4);
  assert.equal(evidenceDelta({ correct: true, confidence: "Low", usedHint: true, difficulty: 2 }), 1);
  assert.equal(evidenceDelta({ correct: false, confidence: "High", difficulty: 3 }), -3);
});

test("keeps mastery confidence separate from the mastery score", () => {
  assert.equal(evidenceConfidence(2), "Low");
  assert.equal(evidenceConfidence(6), "Medium");
  assert.equal(evidenceConfidence(12), "High");
});

test("follows a wrong answer with another question on the same objective", () => {
  const questions = [
    { id: "a", code: "5.2", difficulty: 2 },
    { id: "b", code: "5.2", difficulty: 1 },
    { id: "c", code: "4.1", difficulty: 3 },
  ];
  const mastery = [
    { code: "5.2", score: 55, confidence: "Low" },
    { code: "4.1", score: 55, confidence: "Low" },
  ];
  assert.equal(pickNextQuestion({ questions, seenIds: ["a"], mastery, lastResult: { code: "5.2", correct: false } }).id, "b");
});

import assert from "node:assert/strict";
import test from "node:test";
import { dateKey, evidenceConfidence, evidenceDelta, evidenceDeltaFromMarks, isReviewDue, nextReviewDate, normalizeReviewDate, objectiveNeedsPractice, pickNextQuestion, reliableMastery, reviewLabel } from "../lib/adaptive.mjs";

test("weights independent, confident answers more than hinted or uncertain answers", () => {
  assert.equal(evidenceDelta({ correct: true, confidence: "High", difficulty: 2 }), 4);
  assert.equal(evidenceDelta({ correct: true, confidence: "Low", usedHint: true, difficulty: 2 }), 1);
  assert.equal(evidenceDelta({ correct: false, confidence: "High", difficulty: 3 }), -3);
});

test("uses partial marks without pretending a response is fully secure", () => {
  assert.equal(evidenceDeltaFromMarks({ awardedMarks: 3, totalMarks: 4, confidence: "Medium", difficulty: 3 }), 4);
  assert.equal(evidenceDeltaFromMarks({ awardedMarks: 2, totalMarks: 4, confidence: "Medium", difficulty: 3 }), 0);
  assert.equal(evidenceDeltaFromMarks({ awardedMarks: 1, totalMarks: 4, confidence: "High", difficulty: 3 }), -3);
});

test("keeps mastery confidence separate from the mastery score", () => {
  assert.equal(evidenceConfidence(2), "Low");
  assert.equal(evidenceConfidence(6), "Medium");
  assert.equal(evidenceConfidence(12), "High");
});

test("uses real review dates and upgrades legacy labels without losing progress", () => {
  const today = "2026-08-11";
  assert.equal(dateKey(new Date("2026-08-10T16:30:00Z")), today);
  assert.equal(normalizeReviewDate("Today", today), today);
  assert.equal(normalizeReviewDate("Tomorrow", today), "2026-08-12");
  assert.equal(normalizeReviewDate("3 days", today), "2026-08-14");
  assert.equal(nextReviewDate({ correct: true, confidence: "High", evidence: 5, today }), "2026-08-25");
  assert.equal(nextReviewDate({ correct: false, confidence: "High", evidence: 5, today }), "2026-08-12");
  assert.equal(isReviewDue("2026-08-10", today), true);
  assert.equal(reviewLabel("2026-08-14", today), "In 3 days");
});

test("rests well-assessed objectives until their scheduled review", () => {
  const today = "2026-08-11";
  assert.equal(objectiveNeedsPractice({ score: 84, evidence: 11, confidence: "High", due: "2026-09-10" }, today), false);
  assert.equal(objectiveNeedsPractice({ score: 84, evidence: 11, confidence: "High", due: today }, today), true);
  assert.equal(objectiveNeedsPractice({ score: 79, evidence: 11, confidence: "High", due: "2026-09-10" }, today), true);
  assert.equal(objectiveNeedsPractice({ score: 84, evidence: 8, confidence: "Medium", due: "2026-09-10" }, today), true);
});

test("requires stable independent success across multiple formats before mastery", () => {
  const objective = { score: 84, evidence: 11, confidence: "High", due: "2026-09-10" };
  const mixed = [
    { correct: true, usedHint: false, confidence: "High", format: "structured" },
    { correct: true, usedHint: false, confidence: "Medium", format: "mcq" },
    { correct: true, usedHint: false, confidence: "High", format: "data" },
    { correct: true, usedHint: false, confidence: "High", format: "mcq" },
  ];
  assert.equal(reliableMastery(objective, mixed, "2026-08-11"), true);
  assert.equal(reliableMastery(objective, mixed.map((attempt) => ({ ...attempt, format: "mcq" })), "2026-08-11"), false);
  assert.equal(reliableMastery(objective, mixed.map((attempt) => ({ ...attempt, usedHint: true })), "2026-08-11"), false);
  assert.equal(objectiveNeedsPractice({ ...objective, mastered: true }, "2026-08-11"), false);
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

test("changes format when retesting the same objective after an error", () => {
  const questions = [
    { id: "a", code: "3(c)", difficulty: 2, format: "mcq" },
    { id: "b", code: "3(c)", difficulty: 2, format: "structured" },
    { id: "c", code: "3(c)", difficulty: 3, format: "mcq" },
  ];
  const mastery = [{ code: "3(c)", score: 50, confidence: "Low" }];
  assert.equal(pickNextQuestion({ questions, seenIds: ["a"], mastery, lastResult: { code: "3(c)", correct: false, format: "mcq" } }).id, "b");
});

test("adds format variety within an adaptive session", () => {
  const questions = [
    { id: "a", code: "3(c)", difficulty: 2, format: "mcq" },
    { id: "b", code: "3(d)", difficulty: 3, format: "mcq" },
    { id: "c", code: "3(d)", difficulty: 2, format: "data" },
  ];
  const mastery = [{ code: "3(c)", score: 50, confidence: "Low" }, { code: "3(d)", score: 50, confidence: "Low" }];
  assert.equal(pickNextQuestion({ questions, seenIds: ["a"], mastery }).id, "c");
});

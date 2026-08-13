import assert from "node:assert/strict";
import test from "node:test";
import { verifiedBiologyQuestions } from "../lib/biology-content.ts";
import { buildQuestionQualityReport, masteryPolicy, runStructuredScoringBenchmark } from "../lib/quality.mjs";

test("all live Biology questions pass the shared structural QC gate", () => {
  const report = buildQuestionQualityReport(verifiedBiologyQuestions);
  assert.equal(report.ready, report.total);
  assert.deepEqual(report.errors, []);
  assert.equal(report.objectives, 99);
  assert.equal(report.formats, 6);
  assert.ok(report.transfer > 0);
  assert.equal(report.calibration.calibrated, 0);
  assert.equal(report.calibration.provisional, 9);
});

test("structured scorer matches the initial human-labelled benchmark", () => {
  const benchmark = runStructuredScoringBenchmark();
  assert.equal(benchmark.passed, benchmark.total);
  assert.equal(benchmark.agreement, 100);
});

test("durable mastery policy explicitly requires spacing and transfer", () => {
  assert.ok(masteryPolicy.some((rule) => /seven days/i.test(rule)));
  assert.ok(masteryPolicy.some((rule) => /transfer/i.test(rule)));
});

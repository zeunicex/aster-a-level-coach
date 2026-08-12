import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import {
  biomoleculeQuestions, cellCycleQuestions, cellQuestions, climateQuestions, communicationQuestions,
  enzymeQuestions, eukaryoteQuestions, evolutionQuestions, examChallengeQuestions, geneExpressionQuestions, immunityQuestions,
  inheritanceQuestions, mutationQuestions, pdfPipeline, photosynthesisQuestions, practicalSkills,
  packOrderForSource, prokaryoteQuestions, respirationQuestions, syllabusAreas, techniqueQuestions, transportQuestions,
  verifiedBiologyQuestions, virusQuestions,
} from "../lib/biology-content.ts";

const formats = new Set(["mcq", "image", "sequence", "data", "structured", "practical"]);
const packs = [
  cellQuestions, biomoleculeQuestions, enzymeQuestions, transportQuestions, photosynthesisQuestions,
  respirationQuestions, cellCycleQuestions, geneExpressionQuestions, mutationQuestions, techniqueQuestions,
  eukaryoteQuestions, virusQuestions, prokaryoteQuestions, inheritanceQuestions, communicationQuestions,
  evolutionQuestions, immunityQuestions, climateQuestions,
];
const letters = (prefix, chars) => [...chars].map((letter) => `${prefix}(${letter})`);
const expectedCodes = new Set([
  ...letters("1", "abcdefghijklmnopqrstuv"),
  ...letters("2", "abcdefghijklmnopqrstuvwxyz"), "2(aa)", "2(bb)", "2(cc)", "2(dd)",
  ...letters("3", "abcdefghijklmnop"),
  ...letters("4", "abcdefghijkl"),
  ...letters("A", "abcdefghi"),
  ...letters("B", "abcdefghij"),
]);

test("complete official 9744 map and 18-PDF pipeline are verified", () => {
  assert.equal(syllabusAreas.reduce((sum, area) => sum + area.outcomes, 0), 99);
  assert.equal(syllabusAreas.reduce((sum, area) => sum + area.sourced, 0), 99);
  assert.equal(syllabusAreas.reduce((sum, area) => sum + area.verified, 0), 99);
  assert.equal(practicalSkills.length, 4);
  assert.equal(pdfPipeline.length, 18);
  assert.equal(pdfPipeline.reduce((sum, file) => sum + file.pages, 0), 909);
  assert.equal(pdfPipeline.reduce((sum, file) => sum + file.images, 0), 2070);
  assert.equal(pdfPipeline.filter((file) => file.status === "Verified").length, 18);
  assert.ok(pdfPipeline.every((file) => file.questions === 30));
});

test("all 18 Biology packs are mature, varied and source-linked", () => {
  assert.deepEqual(packs.map((pack) => pack.length), Array(18).fill(30));
  assert.equal(verifiedBiologyQuestions.length, 549);
  assert.equal(new Set(verifiedBiologyQuestions.map((question) => question.id)).size, 549);

  for (const pack of packs) {
    assert.deepEqual(new Set(pack.map((question) => question.format ?? "mcq")), formats);
    for (const question of pack) {
      assert.ok(expectedCodes.has(question.code), `${question.id}: ${question.code}`);
      assert.ok(existsSync(`public${question.sourceImage}`), question.sourceImage);
      assert.match(question.source, /pdf/i);
      if (question.markPoints) {
        assert.equal(question.markPoints.length, question.marks, question.id);
        assert.ok(question.modelAnswer, question.id);
      } else {
        assert.ok(question.answer >= 0 && question.answer < question.options.length, question.id);
      }
    }
  }
});

test("exam-readiness layer adds long, unseen, apparatus and thin-outcome coverage", () => {
  assert.equal(examChallengeQuestions.length, 9);
  assert.ok(examChallengeQuestions.some((question) => question.marks === 25));
  assert.ok(examChallengeQuestions.some((question) => question.marks >= 10 && question.passage));
  assert.ok(examChallengeQuestions.some((question) => question.marks >= 10 && question.apparatus));
  assert.ok(examChallengeQuestions.filter((question) => question.apparatus).every((question) => question.masteryCredit === false));
  assert.ok(examChallengeQuestions.every((question) => question.calibration?.status === "Provisional"));
  for (const code of ["2(aa)", "4(k)", "B(i)"]) assert.ok(verifiedBiologyQuestions.filter((question) => question.code === code).length >= 3, code);
});

test("every official 9744 content outcome has verified question evidence", () => {
  const actualCodes = new Set(verifiedBiologyQuestions.map((question) => question.code));
  assert.deepEqual(actualCodes, expectedCodes);
  for (const code of expectedCodes) assert.ok(verifiedBiologyQuestions.some((question) => question.code === code), code);
});

test("9744 remaps close the former protein, central-dogma, operon, respiration and stem-cell gaps", () => {
  for (const code of ["1(m)", "1(n)", "1(o)", "1(v)", "2(a)", "2(b)", "2(c)", "2(i)", "2(j)", "3(k)"]) {
    assert.ok(verifiedBiologyQuestions.filter((question) => question.code === code).length >= 3, code);
  }
  assert.equal(new Set(respirationQuestions.map((question) => question.format ?? "mcq")).size, 6);
  const respirationPracticals = verifiedBiologyQuestions.filter((question) => question.code === "3(k)");
  assert.ok(respirationPracticals.every((question) => question.sourceUrl?.startsWith("https://")));
  assert.ok(respirationPracticals.every((question) => packOrderForSource(question.source) === 6));
  assert.ok(respirationPracticals.some((question) => /concentration/i.test(question.prompt)));
  assert.ok(respirationPracticals.some((question) => /substrate/i.test(question.prompt)));
  assert.ok(respirationPracticals.some((question) => /temperature/i.test(question.prompt)));
});

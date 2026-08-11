import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import {
  enzymeQuestions,
  pdfPipeline,
  photosynthesisQuestions,
  practicalSkills,
  respirationQuestions,
  syllabusAreas,
  transportQuestions,
  verifiedBiologyQuestions,
} from "../lib/biology-content.ts";

test("complete 9477 map and 17-PDF pipeline use verified source counts", () => {
  assert.equal(syllabusAreas.reduce((sum, area) => sum + area.outcomes, 0), 101);
  assert.equal(syllabusAreas.reduce((sum, area) => sum + area.sourced, 0), 96);
  assert.equal(practicalSkills.length, 4);
  assert.equal(pdfPipeline.length, 17);
  assert.equal(pdfPipeline.reduce((sum, file) => sum + file.pages, 0), 852);
  assert.equal(pdfPipeline.reduce((sum, file) => sum + file.images, 0), 1866);
  assert.equal(pdfPipeline.filter((file) => file.status === "Verified").length, 5);
});

test("Enzymes and Cellular Transport are continuous verified packs", () => {
  assert.equal(enzymeQuestions.length, 12);
  assert.equal(transportQuestions.length, 12);
  assert.equal(verifiedBiologyQuestions.length, 72);
  assert.equal(new Set(verifiedBiologyQuestions.map((question) => question.id)).size, 72);

  for (const code of ["1(g)", "1(h)", "1(i)", "1(j)", "1(k)", "1(l)", "1(p)", "1(q)", "1(r)", "1(s)"]) {
    assert.ok(verifiedBiologyQuestions.filter((question) => question.code === code).length >= 3, code);
  }

  for (const question of [...enzymeQuestions, ...transportQuestions]) {
    assert.ok(existsSync(`public${question.sourceImage}`), question.sourceImage);
    assert.ok(question.answer >= 0 && question.answer < question.options.length);
    assert.match(question.source, /PDF pp?\./);
  }
});

test("Photosynthesis and Cellular Respiration verify the sourced energy outcomes", () => {
  assert.equal(photosynthesisQuestions.length, 18);
  assert.equal(respirationQuestions.length, 18);
  for (const code of ["3(a)", "3(b)", "3(c)", "3(d)", "3(e)", "3(f)", "3(g)", "3(h)", "3(i)", "3(j)", "3(l)"]) {
    assert.ok(verifiedBiologyQuestions.filter((question) => question.code === code).length >= 3, code);
  }
  assert.equal(verifiedBiologyQuestions.some((question) => question.code === "3(k)"), false);
  for (const question of [...photosynthesisQuestions, ...respirationQuestions]) {
    assert.ok(existsSync(`public${question.sourceImage}`), question.sourceImage);
    assert.ok(question.answer >= 0 && question.answer < question.options.length);
    assert.match(question.source, /PDF pp?\./);
  }
});

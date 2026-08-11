import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import {
  biomoleculeQuestions,
  cellCycleQuestions,
  enzymeQuestions,
  geneExpressionQuestions,
  mutationQuestions,
  pdfPipeline,
  photosynthesisQuestions,
  practicalSkills,
  respirationQuestions,
  syllabusAreas,
  techniqueQuestions,
  transportQuestions,
  verifiedBiologyQuestions,
} from "../lib/biology-content.ts";

test("complete 9477 map and 17-PDF pipeline use verified source counts", () => {
  assert.equal(syllabusAreas.reduce((sum, area) => sum + area.outcomes, 0), 101);
  assert.equal(syllabusAreas.reduce((sum, area) => sum + area.sourced, 0), 96);
  assert.equal(syllabusAreas.reduce((sum, area) => sum + area.verified, 0), 33);
  assert.equal(practicalSkills.length, 4);
  assert.equal(pdfPipeline.length, 17);
  assert.equal(pdfPipeline.reduce((sum, file) => sum + file.pages, 0), 852);
  assert.equal(pdfPipeline.reduce((sum, file) => sum + file.images, 0), 1866);
  assert.equal(pdfPipeline.filter((file) => file.status === "Verified").length, 9);
});

test("Core 1 packs are mature and continuous", () => {
  assert.deepEqual([biomoleculeQuestions.length, enzymeQuestions.length, transportQuestions.length], [30, 30, 30]);
  assert.equal(verifiedBiologyQuestions.length, 270);
  assert.equal(new Set(verifiedBiologyQuestions.map((question) => question.id)).size, 270);

  for (const code of ["1(g)", "1(h)", "1(i)", "1(j)", "1(k)", "1(l)", "1(p)", "1(q)", "1(r)", "1(s)"]) {
    assert.ok(verifiedBiologyQuestions.filter((question) => question.code === code).length >= 3, code);
  }

  for (const pack of [biomoleculeQuestions, enzymeQuestions, transportQuestions]) {
    assert.deepEqual(new Set(pack.map((question) => question.format ?? "mcq")), new Set(["mcq", "image", "sequence", "data", "structured", "practical"]));
    for (const question of pack) {
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

test("four Core 2 packs are mature, source-linked and cover six question formats", () => {
  const packs = [cellCycleQuestions, geneExpressionQuestions, mutationQuestions, techniqueQuestions];
  assert.deepEqual(packs.map((pack) => pack.length), [30, 30, 30, 30]);
  for (const pack of packs) {
    assert.deepEqual(new Set(pack.map((question) => question.format ?? "mcq")), new Set(["mcq", "image", "sequence", "data", "structured", "practical"]));
    for (const question of pack) {
      assert.ok(existsSync(`public${question.sourceImage}`), question.sourceImage);
      assert.match(question.source, /PDF p\./);
      if (question.markPoints) {
        assert.equal(question.markPoints.length, question.marks, question.id);
        assert.ok(question.modelAnswer, question.id);
      } else {
        assert.ok(question.answer >= 0 && question.answer < question.options.length, question.id);
      }
    }
  }
  for (const code of ["2(a)", "2(b)", "2(k)", "2(l)", "2(m)", "2(n)", "2(o)", "2(p)", "2(q)", "2(r)", "2(s)", "2(t)"]) {
    assert.ok(verifiedBiologyQuestions.some((question) => question.code === code), code);
  }
});

test("Photosynthesis and Cellular Respiration verify the sourced energy outcomes", () => {
  assert.equal(photosynthesisQuestions.length, 30);
  assert.equal(respirationQuestions.length, 30);
  for (const code of ["3(a)", "3(b)", "3(c)", "3(d)", "3(e)", "3(f)", "3(g)", "3(h)", "3(i)", "3(j)", "3(l)"]) {
    assert.ok(verifiedBiologyQuestions.filter((question) => question.code === code).length >= 5, code);
  }
  assert.equal(verifiedBiologyQuestions.some((question) => question.code === "3(k)"), false);
  for (const question of [...photosynthesisQuestions, ...respirationQuestions]) {
    assert.ok(existsSync(`public${question.sourceImage}`), question.sourceImage);
    if (question.markPoints) {
      assert.equal(question.markPoints.length, question.marks, question.id);
      assert.ok(question.modelAnswer, question.id);
    } else {
      assert.ok(question.answer >= 0 && question.answer < question.options.length, question.id);
    }
    assert.match(question.source, /PDF pp?\./);
  }
  assert.deepEqual(new Set([...photosynthesisQuestions, ...respirationQuestions].map((question) => question.format ?? "mcq")), new Set(["mcq", "image", "structured", "data", "sequence", "practical"]));
});

import { gradeStructuredAnswer } from "./marking.mjs";

const formats = new Set(["mcq", "image", "sequence", "data", "structured", "practical"]);

export function isTransferQuestion(question = {}) {
  const format = question.format ?? "mcq";
  return Boolean(question.passage || question.data || (question.difficulty === 3 && ["image", "structured", "practical"].includes(format)));
}

export function buildQuestionQualityReport(questions) {
  const ids = new Set();
  const prompts = new Map();
  const failed = new Set();
  const errors = [];
  const warnings = [];
  const fail = (question, issue) => {
    failed.add(question.id || "missing-id");
    errors.push(`${question.id || "Missing ID"}: ${issue}`);
  };

  for (const question of questions) {
    if (!question.id) fail(question, "question ID is missing");
    else if (ids.has(question.id)) fail(question, "question ID is duplicated");
    ids.add(question.id);
    if (!/^([1-4AB])\([a-z]{1,2}\)$/.test(question.code ?? "")) fail(question, "9744 objective code is invalid");
    if (!question.prompt?.trim()) fail(question, "prompt is missing");
    if (!Number.isInteger(question.marks) || question.marks < 1) fail(question, "marks must be a positive integer");
    if (![1, 2, 3].includes(question.difficulty)) fail(question, "difficulty must be 1, 2 or 3");
    if (!formats.has(question.format ?? "mcq")) fail(question, "question format is invalid");
    if (!question.source || (!question.sourceImage && !question.sourceUrl)) fail(question, "source evidence is missing");
    if (question.markPoints?.length) {
      if (question.markPoints.length !== question.marks) fail(question, "mark-point count does not equal marks");
      if (!question.modelAnswer?.trim()) fail(question, "model answer is missing");
    } else if (!Number.isInteger(question.answer) || !question.options?.[question.answer]) {
      fail(question, "selected-response answer key is invalid");
    }
    if (question.calibration?.status === "Past-paper calibrated" && (!question.calibration.year || !question.calibration.question)) {
      fail(question, "past-paper calibration needs year and question reference");
    }

    const promptKey = question.prompt?.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (promptKey) {
      const first = prompts.get(promptKey);
      if (first) warnings.push(`${question.id}: prompt duplicates ${first}`);
      else prompts.set(promptKey, question.id);
    }
  }

  const calibrated = questions.filter((question) => question.calibration?.status === "Past-paper calibrated").length;
  const provisional = questions.filter((question) => question.calibration?.status === "Provisional").length;
  return {
    total: questions.length,
    ready: questions.length - failed.size,
    errors,
    warnings,
    objectives: new Set(questions.map((question) => question.code)).size,
    formats: new Set(questions.map((question) => question.format ?? "mcq")).size,
    written: questions.filter((question) => question.markPoints?.length).length,
    longAnswer: questions.filter((question) => question.marks >= 10).length,
    unseen: questions.filter((question) => question.passage).length,
    apparatus: questions.filter((question) => question.apparatus).length,
    transfer: questions.filter(isTransferQuestion).length,
    calibration: {
      calibrated,
      provisional,
      syllabusAligned: questions.length - calibrated - provisional,
    },
  };
}

export const structuredScoringCases = [
  {
    name: "ATP transport partial response",
    points: ["ATP hydrolysis transfers phosphate to the transport protein", "Phosphorylation changes the protein conformation", "The solute is moved against its concentration gradient", "The solute is released on the opposite side"],
    answer: "ATP is hydrolysed and phosphate binds the pump. This changes the pump shape so ions move against the concentration gradient.",
    expected: [0, 1, 2],
  },
  {
    name: "Reject vague cellulose response",
    points: ["Hydrogen bonds form between parallel cellulose chains", "The chains assemble into strong microfibrils"],
    answer: "The structure is strong and useful.",
    expected: [],
  },
  {
    name: "Enzyme temperature explanation",
    points: ["Increasing temperature raises kinetic energy and collision frequency", "Above the optimum bonds are disrupted and active-site conformation changes"],
    answer: "Higher temperature increases kinetic energy and collision frequency. Above the optimum, heat disrupts bonds so the active site changes shape.",
    expected: [0, 1],
  },
  {
    name: "Inheritance selective credit",
    points: ["Alleles segregate during meiosis", "Random fertilisation combines alleles", "Environmental conditions can influence phenotype"],
    answer: "Alleles segregate during meiosis and environmental conditions affect phenotype.",
    expected: [0, 2],
  },
  {
    name: "Central dogma linked response",
    points: ["DNA base sequence determines RNA sequence by transcription", "RNA sequence determines amino-acid sequence by translation", "A substitution can be silent because the genetic code is degenerate"],
    answer: "Transcription copies the DNA base sequence into RNA. Translation then uses the RNA sequence to determine amino acid sequence.",
    expected: [0, 1],
  },
  {
    name: "Osmosis complete definition",
    points: ["Water moves from higher to lower water potential", "Movement occurs across a selectively permeable membrane"],
    answer: "Water moves from a region of higher water potential to lower water potential through a selectively permeable membrane.",
    expected: [0, 1],
  },
];

export function runStructuredScoringBenchmark() {
  const results = structuredScoringCases.map((sample) => {
    const actual = gradeStructuredAnswer(sample.points, sample.answer).awardedPointIndexes;
    return { ...sample, actual, pass: JSON.stringify(actual) === JSON.stringify(sample.expected) };
  });
  const passed = results.filter((result) => result.pass).length;
  return { passed, total: results.length, agreement: Math.round((passed / results.length) * 100), results };
}

export const masteryPolicy = [
  "At least four independent correct responses",
  "At least three formats, including a written response",
  "Evidence on two dates separated by at least seven days",
  "At least one unfamiliar transfer or data question",
  "No hints and no low-confidence evidence counted",
  "At least 75% accuracy in the recent evidence window",
];

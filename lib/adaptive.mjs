export function evidenceDelta({ correct, confidence = "Medium", usedHint = false, difficulty = 2 }) {
  let delta = correct ? 1 + difficulty : -Math.max(1, difficulty - 1);
  if (correct && confidence === "High") delta += 1;
  if (correct && confidence === "Low") delta -= 1;
  if (!correct && confidence === "High") delta -= 1;
  if (correct && usedHint) delta -= 1;
  return Math.max(-4, Math.min(4, delta));
}

export function evidenceDeltaFromMarks({ awardedMarks, totalMarks, confidence = "Medium", usedHint = false, difficulty = 2 }) {
  const ratio = totalMarks > 0 ? awardedMarks / totalMarks : 0;
  if (ratio >= 0.75) return evidenceDelta({ correct: true, confidence, usedHint, difficulty });
  if (ratio >= 0.5) return confidence === "High" ? -1 : 0;
  return evidenceDelta({ correct: false, confidence, usedHint, difficulty });
}

export function evidenceConfidence(evidence) {
  if (evidence >= 9) return "High";
  if (evidence >= 4) return "Medium";
  return "Low";
}

/**
 * @param {{ questions: any[], seenIds: string[], mastery: any[], lastResult?: { correct: boolean, code: string, format?: string } | null, preferredFormats?: string[] }} input
 */
export function pickNextQuestion({ questions, seenIds, mastery, lastResult = null, preferredFormats = [] }) {
  const remaining = questions.filter((question) => !seenIds.includes(question.id));
  if (!remaining.length) return null;
  const seenFormats = new Set(questions.filter((question) => seenIds.includes(question.id)).map((question) => question.format ?? "mcq"));

  return remaining
    .map((question) => {
      const objective = mastery.find((item) => item.code === question.code);
      const uncertainty = objective?.confidence === "Low" ? 24 : objective?.confidence === "Medium" ? 10 : 0;
      const weakness = 100 - (objective?.score ?? 50);
      const followUp = lastResult?.correct === false && lastResult.code === question.code ? 40 : 0;
      const format = question.format ?? "mcq";
      const formatSwitch = followUp && format !== (lastResult?.format ?? "mcq") ? 18 : 0;
      const preference = preferredFormats.includes(format) ? 14 : 0;
      const sessionVariety = seenIds.length && !seenFormats.has(format) ? 8 : 0;
      const varyAfterSuccess = lastResult?.correct === true && lastResult.code === question.code ? -18 : 0;
      return { question, priority: weakness + uncertainty + followUp + formatSwitch + preference + sessionVariety + varyAfterSuccess + question.difficulty * 2 };
    })
    .sort((a, b) => b.priority - a.priority)[0].question;
}

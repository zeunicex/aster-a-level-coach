export function evidenceDelta({ correct, confidence = "Medium", usedHint = false, difficulty = 2 }) {
  let delta = correct ? 1 + difficulty : -Math.max(1, difficulty - 1);
  if (correct && confidence === "High") delta += 1;
  if (correct && confidence === "Low") delta -= 1;
  if (!correct && confidence === "High") delta -= 1;
  if (correct && usedHint) delta -= 1;
  return Math.max(-4, Math.min(4, delta));
}

export function evidenceConfidence(evidence) {
  if (evidence >= 9) return "High";
  if (evidence >= 4) return "Medium";
  return "Low";
}

export function pickNextQuestion({ questions, seenIds, mastery, lastResult = null }) {
  const remaining = questions.filter((question) => !seenIds.includes(question.id));
  if (!remaining.length) return null;

  return remaining
    .map((question) => {
      const objective = mastery.find((item) => item.code === question.code);
      const uncertainty = objective?.confidence === "Low" ? 24 : objective?.confidence === "Medium" ? 10 : 0;
      const weakness = 100 - (objective?.score ?? 50);
      const followUp = lastResult?.correct === false && lastResult.code === question.code ? 40 : 0;
      const varyAfterSuccess = lastResult?.correct === true && lastResult.code === question.code ? -18 : 0;
      return { question, priority: weakness + uncertainty + followUp + varyAfterSuccess + question.difficulty * 2 };
    })
    .sort((a, b) => b.priority - a.priority)[0].question;
}

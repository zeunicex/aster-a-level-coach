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

export function dateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-SG", { timeZone: "Asia/Singapore", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function addReviewDays(day, days) {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return dateKey(date);
}

export function normalizeReviewDate(due, today = dateKey()) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(due ?? "")) return due;
  if (!due || due === "Today") return today;
  if (due === "Tomorrow") return addReviewDays(today, 1);
  const days = Number.parseInt(due, 10);
  return Number.isFinite(days) ? addReviewDays(today, days) : today;
}

export function nextReviewDate({ correct, confidence = "Medium", usedHint = false, evidence = 0, today = dateKey() }) {
  if (!correct || usedHint || confidence === "Low") return addReviewDays(today, 1);
  if (confidence === "Medium") return addReviewDays(today, evidence >= 4 ? 7 : 3);
  return addReviewDays(today, evidence >= 9 ? 30 : evidence >= 4 ? 14 : 7);
}

export function isReviewDue(due, today = dateKey()) {
  return normalizeReviewDate(due, today) <= today;
}

export function objectiveNeedsPractice(objective, today = dateKey()) {
  if (objective.mastered || objective.secureForNow) return isReviewDue(objective.due, today);
  if (typeof objective.mastered === "boolean") return true;
  return objective.score < 80 || objective.evidence < 9 || objective.confidence !== "High" || isReviewDue(objective.due, today);
}

export function secureForNow(objective, attempts, today = dateKey()) {
  if (objective.score < 65 || objective.evidence < 4 || isReviewDue(objective.due, today)) return false;
  const recent = attempts.slice(0, 6);
  if (recent.length < 3 || !recent[0]?.correct) return false;
  const independent = recent.filter((attempt, index) => attempt.correct && !attempt.usedHint && attempt.confidence !== "Low"
    && recent.findIndex((candidate, candidateIndex) => (candidate.questionId ?? candidateIndex) === (attempt.questionId ?? index)) === index);
  const formats = new Set(independent.map((attempt) => attempt.format ?? "mcq"));
  return independent.length >= 3 && formats.size >= 2 && [...formats].some((format) => format !== "mcq") && recent.filter((attempt) => attempt.correct).length / recent.length >= 0.75;
}

export function reliableMastery(objective, attempts, today = dateKey()) {
  if (objective.score < 80 || objective.evidence < 9 || objective.confidence !== "High" || isReviewDue(objective.due, today)) return false;
  const recent = attempts.slice(0, 20);
  if (recent.length < 4 || !recent[0]?.correct) return false;
  const independent = recent.filter((attempt, index) => attempt.correct && !attempt.usedHint && attempt.confidence !== "Low"
    && recent.findIndex((candidate, candidateIndex) => (candidate.questionId ?? candidateIndex) === (attempt.questionId ?? index)) === index);
  const formats = new Set(independent.map((attempt) => attempt.format ?? "mcq"));
  const evidenceDates = [...new Set(independent.map((attempt) => attempt.createdAt && dateKey(new Date(attempt.createdAt))).filter(Boolean))].sort();
  const spanDays = evidenceDates.length > 1
    ? Math.round((new Date(`${evidenceDates.at(-1)}T12:00:00Z`).getTime() - new Date(`${evidenceDates[0]}T12:00:00Z`).getTime()) / 86400000)
    : 0;
  const accuracyWindow = recent.slice(0, 8);
  const accuracy = accuracyWindow.filter((attempt) => attempt.correct).length / accuracyWindow.length;
  return independent.length >= 4
    && formats.size >= 3
    && [...formats].some((format) => format !== "mcq")
    && evidenceDates.length >= 2
    && spanDays >= 7
    && independent.some((attempt) => attempt.transfer)
    && accuracy >= 0.75;
}

export function reviewLabel(due, today = dateKey()) {
  const normalized = normalizeReviewDate(due, today);
  if (normalized <= today) return "Due today";
  const tomorrow = addReviewDays(today, 1);
  if (normalized === tomorrow) return "Tomorrow";
  const days = Math.round((new Date(`${normalized}T12:00:00Z`).getTime() - new Date(`${today}T12:00:00Z`).getTime()) / 86400000);
  return `In ${days} days`;
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
      const due = objective && isReviewDue(objective.due) ? 22 : 0;
      const followUp = lastResult?.correct === false && lastResult.code === question.code ? 40 : 0;
      const format = question.format ?? "mcq";
      const formatSwitch = followUp && format !== (lastResult?.format ?? "mcq") ? 18 : 0;
      const preference = preferredFormats.includes(format) ? 14 : 0;
      const sessionVariety = seenIds.length && !seenFormats.has(format) ? 8 : 0;
      const varyAfterSuccess = lastResult?.correct === true && lastResult.code === question.code ? -18 : 0;
      return { question, priority: weakness + uncertainty + due + followUp + formatSwitch + preference + sessionVariety + varyAfterSuccess + question.difficulty * 2 };
    })
    .sort((a, b) => b.priority - a.priority)[0].question;
}

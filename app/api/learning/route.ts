import { visitorIdentity, visitorJson } from "@/app/visitor";
import { getStore } from "@/db/runtime";
import { seedContentPacks } from "@/db/packs";
import { packOrderForSource, verifiedBiologyAnswerKey, verifiedBiologyQuestions } from "@/lib/biology-content";
import { dateKey, evidenceConfidence, evidenceDelta, evidenceDeltaFromMarks, nextReviewDate, normalizeReviewDate, reliableMastery, secureForNow } from "@/lib/adaptive.mjs";
import { gradeStructuredAnswer } from "@/lib/marking.mjs";
import { isTransferQuestion } from "@/lib/quality.mjs";

type SeedRow = [string, string, number, number, string, number, number, number, string, string];
const objectiveRank = (code: string) => {
  const [, area = "", token = ""] = code.match(/^(\d|A|B)\(([a-z]+)\)$/) ?? [];
  const areaRank = ["1", "2", "3", "4", "A", "B"].indexOf(area);
  const tokenRank = token.length === 1 ? "abcdefghijklmnopqrstuvwxyz".indexOf(token) : 26 + ["aa", "bb", "cc", "dd"].indexOf(token);
  return areaRank * 100 + tokenRank;
};
const biologySeedMastery: SeedRow[] = [...new Map(verifiedBiologyQuestions.map((question) => [question.code, [
  question.code, question.objective.replace(/^\S+\s+/, ""), 50, 0, "Low", 50, 50, 50, "Ready for diagnostic", "Today",
] as SeedRow])).values()].sort((a, b) => objectiveRank(a[0]) - objectiveRank(b[0]));

const seedMastery: Record<"Biology" | "Chemistry", SeedRow[]> = {
  Biology: biologySeedMastery,
  Chemistry: [
    ["2.1", "Atomic structure", 82, 12, "High", 91, 79, 76, "Secure", "6 days"],
    ["3.3", "Chemical bonding", 70, 7, "Medium", 79, 67, 64, "Shape explanations", "2 days"],
    ["7.1", "Equilibria", 48, 3, "Low", 65, 39, 40, "Application is weak", "Today"],
    ["14.2", "Organic mechanisms", 39, 2, "Low", 57, 31, 29, "Electron movement", "Today"],
  ],
};

export async function GET(request: Request) {
  const identity = await visitorIdentity(request);
  const userId = identity.userId;
  const subject = new URL(request.url).searchParams.get("subject") === "Chemistry" ? "Chemistry" : "Biology";
  const db = await getStore();
  const now = new Date().toISOString();
  const today = dateKey(new Date(now));

  await db.batch(seedMastery[subject].map((item) => db.prepare(`
    INSERT INTO mastery
      (user_id, subject, code, topic, score, evidence, confidence, knowledge, application, exam, note, due, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, subject, code) DO UPDATE SET topic = excluded.topic
  `).bind(userId, subject, ...item, now)));

  const mastery = await db.prepare(`
    SELECT code, topic, score, evidence, confidence, knowledge, application, exam, note, due
    FROM mastery WHERE user_id = ? AND subject = ? ORDER BY code
  `).bind(userId, subject).all();
  const codeOrder = new Map(seedMastery[subject].map((item, index) => [String(item[0]), index]));
  const activeCodes = new Set<string>(codeOrder.keys());
  const storedMastery = (mastery.results as { code: string; due: string }[])
    .filter((item) => activeCodes.has(item.code))
    .sort((a, b) => (codeOrder.get(a.code) ?? 0) - (codeOrder.get(b.code) ?? 0));
  const normalizedMastery = storedMastery.map((item) => ({ ...item, due: normalizeReviewDate(item.due, today) }));
  const attemptRows = await db.prepare(`SELECT question_id, objective_code, correct, confidence, used_hint, created_at
    FROM attempts WHERE user_id = ? AND subject = ? ORDER BY created_at DESC LIMIT 2000`)
    .bind(userId, subject).all<{ question_id: string; objective_code: string; correct: number; confidence: string; used_hint: number; created_at: string }>();
  const attemptsByCode = new Map<string, { questionId: string; correct: boolean; confidence: string; usedHint: boolean; format: string; createdAt: string; transfer: boolean }[]>();
  for (const attempt of attemptRows.results) {
    const question = verifiedBiologyAnswerKey[attempt.question_id];
    if (question?.masteryCredit === false) continue;
    const items = attemptsByCode.get(attempt.objective_code) ?? [];
    if (items.length < 20) items.push({
      questionId: attempt.question_id,
      correct: Boolean(attempt.correct),
      confidence: attempt.confidence,
      usedHint: Boolean(attempt.used_hint),
      format: question?.format ?? "mcq",
      createdAt: attempt.created_at,
      transfer: isTransferQuestion(question),
    });
    attemptsByCode.set(attempt.objective_code, items);
  }
  const activeMastery = normalizedMastery.map((item) => {
    const attempts = attemptsByCode.get(item.code) ?? [];
    const mastered = reliableMastery(item, attempts, today);
    return { ...item, mastered, secureForNow: !mastered && secureForNow(item, attempts, today) };
  });
  const legacyDates = normalizedMastery.filter((item, index) => item.due !== storedMastery[index].due);
  if (legacyDates.length) await db.batch(legacyDates.map((item) => db.prepare("UPDATE mastery SET due = ? WHERE user_id = ? AND subject = ? AND code = ?").bind(item.due, userId, subject, item.code)));
  const totals = await db.prepare("SELECT COUNT(*) AS count FROM attempts WHERE user_id = ? AND subject = ?")
    .bind(userId, subject).first<{ count: number }>();
  const todayStats = await db.prepare("SELECT COUNT(*) AS answered, COALESCE(SUM(correct), 0) AS secure FROM attempts WHERE user_id = ? AND subject = ? AND created_at >= ?")
    .bind(userId, subject, new Date(`${today}T00:00:00+08:00`).toISOString()).first<{ answered: number; secure: number }>();
  const gapRows = await db.prepare("SELECT objective_code, missed_points FROM attempts WHERE user_id = ? AND subject = ? AND missed_points IS NOT NULL ORDER BY created_at DESC LIMIT 50")
    .bind(userId, subject).all<{ objective_code: string; missed_points: string }>();
  const gaps = new Map<string, { point: string; code: string; count: number }>();
  for (const row of gapRows.results) {
    let points: string[] = [];
    try { points = JSON.parse(row.missed_points); } catch { points = []; }
    for (const point of points) {
      const key = `${row.objective_code}:${point}`;
      const current = gaps.get(key);
      gaps.set(key, { point, code: row.objective_code, count: (current?.count ?? 0) + 1 });
    }
  }

  return visitorJson({ mastery: activeMastery, attempts: totals?.count ?? 0, todayStats: todayStats ?? { answered: 0, secure: 0 }, missedPoints: [...gaps.values()].sort((a, b) => b.count - a.count).slice(0, 6), saved: true }, identity);
}

export async function POST(request: Request) {
  const payload = await request.json() as {
    questionId?: string;
    selected?: number;
    writtenAnswer?: string;
    confidence?: "Low" | "Medium" | "High";
    usedHint?: boolean;
  };
  const question = payload.questionId ? verifiedBiologyAnswerKey[payload.questionId] : null;
  const written = Boolean(question?.markPoints?.length);
  const pointIndexes = written ? gradeStructuredAnswer(question!.markPoints!, payload.writtenAnswer ?? "").awardedPointIndexes : [];
  const validAnswer = written
    ? Boolean(payload.writtenAnswer?.trim())
    : Number.isInteger(payload.selected);
  if (!question || !validAnswer || !["Low", "Medium", "High"].includes(payload.confidence ?? "")) {
    return Response.json({ error: "Invalid verified question attempt" }, { status: 400 });
  }

  const identity = await visitorIdentity(request);
  const userId = identity.userId;
  const db = await getStore();
  await seedContentPacks(db);
  const packOrder = packOrderForSource(question.source);
  const pack = packOrder === null ? null : await db.prepare("SELECT status FROM content_packs WHERE pack_order = ?").bind(packOrder).first<{ status: string }>();
  if (pack?.status !== "Live") return Response.json({ error: "This content pack is not published" }, { status: 409 });
  const existing = await db.prepare(`
    SELECT * FROM mastery WHERE user_id = ? AND subject = 'Biology' AND code = ?
  `).bind(userId, question.code).first<Record<string, number | string>>();
  if (!existing) return Response.json({ error: "Mastery objective is not initialized" }, { status: 409 });

  const awardedMarks = written ? pointIndexes.length : null;
  const missedPoints = written ? question.markPoints!.filter((_, index) => !pointIndexes.includes(index)) : [];
  const correct = written ? Number(awardedMarks) / question.marks >= 0.75 : payload.selected === question.answer;
  const delta = question.masteryCredit === false ? 0 : written
    ? evidenceDeltaFromMarks({ awardedMarks: Number(awardedMarks), totalMarks: question.marks, confidence: payload.confidence, usedHint: Boolean(payload.usedHint), difficulty: question.difficulty })
    : evidenceDelta({ correct, confidence: payload.confidence, usedHint: Boolean(payload.usedHint), difficulty: question.difficulty });
  const clamp = (value: number) => Math.max(0, Math.min(100, value + delta));
  const evidence = Number(existing.evidence) + Number(question.masteryCredit !== false);
  const skillColumn = question.skill === "Knowledge" ? "knowledge" : question.skill === "Exam technique" ? "exam" : "application";
  const updated = {
    score: clamp(Number(existing.score)),
    evidence,
    confidence: evidenceConfidence(evidence),
    knowledge: skillColumn === "knowledge" ? clamp(Number(existing.knowledge)) : Number(existing.knowledge),
    application: skillColumn === "application" ? clamp(Number(existing.application)) : Number(existing.application),
    exam: skillColumn === "exam" ? clamp(Number(existing.exam)) : Number(existing.exam),
    note: correct ? `${question.skill} evidence strengthened` : missedPoints[0] ?? question.misconception,
    due: nextReviewDate({ correct, confidence: payload.confidence, usedHint: Boolean(payload.usedHint), evidence }),
  };
  const now = new Date().toISOString();

  await db.batch([
    db.prepare(`INSERT INTO attempts
      (id, user_id, question_id, subject, objective_code, correct, confidence, used_hint, difficulty, delta, awarded_marks, total_marks, missed_points, created_at)
      VALUES (?, ?, ?, 'Biology', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(crypto.randomUUID(), userId, question.id, question.code, correct ? 1 : 0, payload.confidence, payload.usedHint ? 1 : 0, question.difficulty, delta, awardedMarks, question.marks, written ? JSON.stringify(missedPoints) : null, now),
    db.prepare(`UPDATE mastery SET
      score = ?, evidence = ?, confidence = ?, knowledge = ?, application = ?, exam = ?, note = ?, due = ?, updated_at = ?
      WHERE user_id = ? AND subject = 'Biology' AND code = ?`)
      .bind(updated.score, updated.evidence, updated.confidence, updated.knowledge, updated.application, updated.exam, updated.note, updated.due, now, userId, question.code),
  ]);

  const recentRows = await db.prepare(`SELECT question_id, correct, confidence, used_hint, created_at FROM attempts
    WHERE user_id = ? AND subject = 'Biology' AND objective_code = ? ORDER BY created_at DESC LIMIT 20`)
    .bind(userId, question.code).all<{ question_id: string; correct: number; confidence: string; used_hint: number; created_at: string }>();
  const creditedRecent = recentRows.results.filter((attempt) => verifiedBiologyAnswerKey[attempt.question_id]?.masteryCredit !== false);
  const mastered = reliableMastery(updated, creditedRecent.map((attempt) => ({
    questionId: attempt.question_id,
    correct: Boolean(attempt.correct),
    confidence: attempt.confidence,
    usedHint: Boolean(attempt.used_hint),
    format: verifiedBiologyAnswerKey[attempt.question_id]?.format ?? "mcq",
    createdAt: attempt.created_at,
    transfer: isTransferQuestion(verifiedBiologyAnswerKey[attempt.question_id]),
  })), dateKey(new Date(now)));
  const secure = !mastered && secureForNow(updated, creditedRecent.map((attempt) => ({
    questionId: attempt.question_id,
    correct: Boolean(attempt.correct),
    confidence: attempt.confidence,
    usedHint: Boolean(attempt.used_hint),
    format: verifiedBiologyAnswerKey[attempt.question_id]?.format ?? "mcq",
    createdAt: attempt.created_at,
    transfer: isTransferQuestion(verifiedBiologyAnswerKey[attempt.question_id]),
  })), dateKey(new Date(now)));

  return visitorJson({ correct, delta, missedPoints, awardedPointIndexes: pointIndexes, mastery: { code: question.code, ...updated, mastered, secureForNow: secure, note: mastered ? "Durably mastered · resting until review" : secure ? "Secure for now · spaced review scheduled" : updated.note } }, identity);
}

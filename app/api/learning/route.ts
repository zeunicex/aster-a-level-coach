import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getStore } from "@/db/runtime";
import { seedContentPacks } from "@/db/packs";
import { packOrderForSource, verifiedBiologyAnswerKey } from "@/lib/biology-content";
import { dateKey, evidenceConfidence, evidenceDelta, evidenceDeltaFromMarks, nextReviewDate, normalizeReviewDate } from "@/lib/adaptive.mjs";

const seedMastery = {
  Biology: [
    ["1(g)", "Biomolecule monomers", 50, 0, "Low", 50, 50, 50, "Ready for diagnostic", "Today"],
    ["1(h)", "Biological bonds", 50, 0, "Low", 50, 50, 50, "Ready for diagnostic", "Today"],
    ["1(i)", "Structure and function", 50, 0, "Low", 50, 50, 50, "Ready for diagnostic", "Today"],
    ["1(j)", "Fluid mosaic membrane", 50, 0, "Low", 50, 50, 50, "Ready for diagnostic", "Today"],
    ["1(k)", "Membrane functions", 50, 0, "Low", 50, 50, 50, "Ready for diagnostic", "Today"],
    ["1(l)", "Membrane transport", 50, 0, "Low", 50, 50, 50, "Ready for diagnostic", "Today"],
    ["1(p)", "Enzyme action", 50, 0, "Low", 50, 50, 50, "Ready for diagnostic", "Today"],
    ["1(q)", "Enzyme investigations", 50, 0, "Low", 50, 50, 50, "Ready for diagnostic", "Today"],
    ["1(r)", "Inhibitor binding", 50, 0, "Low", 50, 50, 50, "Ready for diagnostic", "Today"],
    ["1(s)", "Inhibitor effects", 50, 0, "Low", 50, 50, 50, "Ready for diagnostic", "Today"],
    ["3(a)", "Energy organelles", 50, 0, "Low", 50, 50, 50, "Ready for diagnostic", "Today"],
    ["3(b)", "Photosynthetic spectra", 50, 0, "Low", 50, 50, 50, "Ready for diagnostic", "Today"],
    ["3(c)", "Light-dependent reactions", 50, 0, "Low", 50, 50, 50, "Ready for diagnostic", "Today"],
    ["3(d)", "Calvin cycle", 50, 0, "Low", 50, 50, 50, "Ready for diagnostic", "Today"],
    ["3(e)", "Photosynthesis investigations", 50, 0, "Low", 50, 50, 50, "Ready for diagnostic", "Today"],
    ["3(f)", "Glycolysis", 50, 0, "Low", 50, 50, 50, "Ready for diagnostic", "Today"],
    ["3(g)", "Link reaction and Krebs cycle", 50, 0, "Low", 50, 50, 50, "Ready for diagnostic", "Today"],
    ["3(h)", "Oxidative phosphorylation", 50, 0, "Low", 50, 50, 50, "Ready for diagnostic", "Today"],
    ["3(i)", "Anaerobic respiration", 50, 0, "Low", 50, 50, 50, "Ready for diagnostic", "Today"],
    ["3(j)", "NAD regeneration", 50, 0, "Low", 50, 50, 50, "Ready for diagnostic", "Today"],
    ["3(l)", "Chemiosmosis", 50, 0, "Low", 50, 50, 50, "Ready for diagnostic", "Today"],
  ],
  Chemistry: [
    ["2.1", "Atomic structure", 82, 12, "High", 91, 79, 76, "Secure", "6 days"],
    ["3.3", "Chemical bonding", 70, 7, "Medium", 79, 67, 64, "Shape explanations", "2 days"],
    ["7.1", "Equilibria", 48, 3, "Low", 65, 39, 40, "Application is weak", "Today"],
    ["14.2", "Organic mechanisms", 39, 2, "Low", 57, 31, 29, "Electron movement", "Today"],
  ],
} as const;

async function currentUserId() {
  return (await getChatGPTUser())?.userId ?? "local-preview";
}

export async function GET(request: Request) {
  const userId = await currentUserId();
  const subject = new URL(request.url).searchParams.get("subject") === "Chemistry" ? "Chemistry" : "Biology";
  const db = await getStore();
  const now = new Date().toISOString();
  const today = dateKey(new Date(now));

  await db.batch(seedMastery[subject].map((item) => db.prepare(`
    INSERT OR IGNORE INTO mastery
      (user_id, subject, code, topic, score, evidence, confidence, knowledge, application, exam, note, due, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(userId, subject, ...item, now)));

  const mastery = await db.prepare(`
    SELECT code, topic, score, evidence, confidence, knowledge, application, exam, note, due
    FROM mastery WHERE user_id = ? AND subject = ? ORDER BY code
  `).bind(userId, subject).all();
  const activeCodes = new Set<string>(seedMastery[subject].map((item) => String(item[0])));
  const storedMastery = (mastery.results as { code: string; due: string }[]).filter((item) => activeCodes.has(item.code));
  const activeMastery = storedMastery.map((item) => ({ ...item, due: normalizeReviewDate(item.due, today) }));
  const legacyDates = activeMastery.filter((item, index) => item.due !== storedMastery[index].due);
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

  return Response.json({ mastery: activeMastery, attempts: totals?.count ?? 0, todayStats: todayStats ?? { answered: 0, secure: 0 }, missedPoints: [...gaps.values()].sort((a, b) => b.count - a.count).slice(0, 6), saved: true });
}

export async function POST(request: Request) {
  const payload = await request.json() as {
    questionId?: string;
    selected?: number;
    awardedPointIndexes?: number[];
    confidence?: "Low" | "Medium" | "High";
    usedHint?: boolean;
  };
  const question = payload.questionId ? verifiedBiologyAnswerKey[payload.questionId] : null;
  const written = Boolean(question?.markPoints?.length);
  const pointIndexes = payload.awardedPointIndexes ?? [];
  const validAnswer = written
    ? Array.isArray(pointIndexes) && new Set(pointIndexes).size === pointIndexes.length && pointIndexes.every((index) => Number.isInteger(index) && index >= 0 && index < Number(question?.markPoints?.length))
    : Number.isInteger(payload.selected);
  if (!question || !validAnswer || !["Low", "Medium", "High"].includes(payload.confidence ?? "")) {
    return Response.json({ error: "Invalid verified question attempt" }, { status: 400 });
  }

  const userId = await currentUserId();
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
  const delta = written
    ? evidenceDeltaFromMarks({ awardedMarks: Number(awardedMarks), totalMarks: question.marks, confidence: payload.confidence, usedHint: Boolean(payload.usedHint), difficulty: question.difficulty })
    : evidenceDelta({ correct, confidence: payload.confidence, usedHint: Boolean(payload.usedHint), difficulty: question.difficulty });
  const clamp = (value: number) => Math.max(0, Math.min(100, value + delta));
  const evidence = Number(existing.evidence) + 1;
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

  return Response.json({ correct, delta, missedPoints, mastery: { code: question.code, ...updated } });
}

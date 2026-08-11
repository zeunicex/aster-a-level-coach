import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getStore } from "@/db/runtime";
import { verifiedBiologyAnswerKey } from "@/lib/biology-content";
import { evidenceConfidence, evidenceDelta, evidenceDeltaFromMarks } from "@/lib/adaptive.mjs";

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
  const activeMastery = (mastery.results as { code: string }[]).filter((item) => activeCodes.has(item.code));
  const totals = await db.prepare("SELECT COUNT(*) AS count FROM attempts WHERE user_id = ? AND subject = ?")
    .bind(userId, subject).first<{ count: number }>();

  return Response.json({ mastery: activeMastery, attempts: totals?.count ?? 0, saved: true });
}

export async function POST(request: Request) {
  const payload = await request.json() as {
    questionId?: string;
    selected?: number;
    awardedMarks?: number;
    confidence?: "Low" | "Medium" | "High";
    usedHint?: boolean;
  };
  const question = payload.questionId ? verifiedBiologyAnswerKey[payload.questionId] : null;
  const written = Boolean(question?.markPoints?.length);
  const validAnswer = written
    ? Number.isInteger(payload.awardedMarks) && Number(payload.awardedMarks) >= 0 && Number(payload.awardedMarks) <= Number(question?.marks)
    : Number.isInteger(payload.selected);
  if (!question || !validAnswer || !["Low", "Medium", "High"].includes(payload.confidence ?? "")) {
    return Response.json({ error: "Invalid verified question attempt" }, { status: 400 });
  }

  const userId = await currentUserId();
  const db = await getStore();
  const existing = await db.prepare(`
    SELECT * FROM mastery WHERE user_id = ? AND subject = 'Biology' AND code = ?
  `).bind(userId, question.code).first<Record<string, number | string>>();
  if (!existing) return Response.json({ error: "Mastery objective is not initialized" }, { status: 409 });

  const correct = written ? Number(payload.awardedMarks) / question.marks >= 0.75 : payload.selected === question.answer;
  const delta = written
    ? evidenceDeltaFromMarks({ awardedMarks: Number(payload.awardedMarks), totalMarks: question.marks, confidence: payload.confidence, usedHint: Boolean(payload.usedHint), difficulty: question.difficulty })
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
    note: correct ? `${question.skill} evidence strengthened` : question.misconception,
    due: correct && payload.confidence === "High" && !payload.usedHint ? "3 days" : "Tomorrow",
  };
  const now = new Date().toISOString();

  await db.batch([
    db.prepare(`INSERT INTO attempts
      (id, user_id, question_id, subject, objective_code, correct, confidence, used_hint, difficulty, delta, created_at)
      VALUES (?, ?, ?, 'Biology', ?, ?, ?, ?, ?, ?, ?)`)
      .bind(crypto.randomUUID(), userId, question.id, question.code, correct ? 1 : 0, payload.confidence, payload.usedHint ? 1 : 0, question.difficulty, delta, now),
    db.prepare(`UPDATE mastery SET
      score = ?, evidence = ?, confidence = ?, knowledge = ?, application = ?, exam = ?, note = ?, due = ?, updated_at = ?
      WHERE user_id = ? AND subject = 'Biology' AND code = ?`)
      .bind(updated.score, updated.evidence, updated.confidence, updated.knowledge, updated.application, updated.exam, updated.note, updated.due, now, userId, question.code),
  ]);

  return Response.json({ correct, delta, mastery: { code: question.code, ...updated } });
}

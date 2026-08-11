import { getChatGPTUser } from "@/app/chatgpt-auth";
import { visitorIdentity, visitorJson } from "@/app/visitor";
import { isAdmin } from "@/db/packs";
import { getStore } from "@/db/runtime";
import { dateKey, reliableMastery } from "@/lib/adaptive.mjs";
import { verifiedBiologyAnswerKey } from "@/lib/biology-content";

const classCode = "ASTER9477";

export async function GET(request: Request) {
  const db = await getStore();
  if (new URL(request.url).searchParams.get("student") === "1") {
    const identity = await visitorIdentity(request);
    const profile = await db.prepare("SELECT display_name AS displayName, class_code AS classCode FROM student_profiles WHERE user_id = ?")
      .bind(identity.userId).first<{ displayName: string; classCode: string }>();
    return visitorJson({ profile: profile ?? null }, identity);
  }

  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Owner sign-in required" }, { status: 401 });
  if (!await isAdmin(db, user.userId)) return Response.json({ error: "Owner access required" }, { status: 403 });

  const profiles = await db.prepare(`SELECT user_id AS userId, display_name AS displayName,
    class_code AS classCode, created_at AS joinedAt, updated_at AS updatedAt
    FROM student_profiles ORDER BY display_name`).all<{ userId: string; displayName: string; classCode: string; joinedAt: string; updatedAt: string }>();
  const mastery = await db.prepare(`SELECT m.user_id AS userId, m.code, m.topic, m.score, m.evidence,
    m.confidence, m.due FROM mastery m INNER JOIN student_profiles p ON p.user_id = m.user_id
    WHERE m.subject = 'Biology'`).all<{ userId: string; code: string; topic: string; score: number; evidence: number; confidence: string; due: string }>();
  const attempts = await db.prepare(`SELECT a.user_id AS userId, a.question_id AS questionId,
    a.objective_code AS objectiveCode, a.correct, a.confidence, a.used_hint AS usedHint, a.created_at AS createdAt
    FROM attempts a INNER JOIN student_profiles p ON p.user_id = a.user_id
    WHERE a.subject = 'Biology' ORDER BY a.created_at DESC LIMIT 5000`)
    .all<{ userId: string; questionId: string; objectiveCode: string; correct: number; confidence: string; usedHint: number; createdAt: string }>();
  const today = dateKey();
  const sevenDaysAgo = Date.now() - 7 * 86400000;

  const students = profiles.results.map((profile) => {
    const studentAttempts = attempts.results.filter((attempt) => attempt.userId === profile.userId);
    const studentMastery = mastery.results.filter((item) => item.userId === profile.userId);
    const recentByCode = new Map<string, typeof studentAttempts>();
    for (const attempt of studentAttempts) {
      const recent = recentByCode.get(attempt.objectiveCode) ?? [];
      if (recent.length < 6) recent.push(attempt);
      recentByCode.set(attempt.objectiveCode, recent);
    }
    const mastered = studentMastery.filter((item) => reliableMastery(item, (recentByCode.get(item.code) ?? []).map((attempt) => ({
      correct: Boolean(attempt.correct), confidence: attempt.confidence, usedHint: Boolean(attempt.usedHint),
      format: verifiedBiologyAnswerKey[attempt.questionId]?.format ?? "mcq",
    })), today)).length;
    const weak = studentMastery.filter((item) => item.evidence > 0).sort((a, b) => a.score - b.score).slice(0, 2).map((item) => item.code);
    const correct = studentAttempts.filter((attempt) => attempt.correct).length;
    const lastActive = studentAttempts[0]?.createdAt ?? profile.updatedAt;
    return {
      displayName: profile.displayName,
      classCode: profile.classCode,
      attempts: studentAttempts.length,
      accuracy: studentAttempts.length ? Math.round(correct / studentAttempts.length * 100) : 0,
      mastered,
      weak,
      lastActive,
      activeRecently: new Date(lastActive).getTime() >= sevenDaysAgo,
    };
  });

  return Response.json({
    classCode,
    students,
    summary: {
      students: students.length,
      attempts: students.reduce((sum, student) => sum + student.attempts, 0),
      activeRecently: students.filter((student) => student.activeRecently).length,
      averageAccuracy: students.length ? Math.round(students.reduce((sum, student) => sum + student.accuracy, 0) / students.length) : 0,
    },
  });
}

export async function POST(request: Request) {
  const identity = await visitorIdentity(request);
  let payload: { displayName?: string; classCode?: string };
  try { payload = await request.json(); } catch { return visitorJson({ error: "Invalid request" }, identity, { status: 400 }); }
  const displayName = payload.displayName?.trim().replace(/\s+/g, " ") ?? "";
  const suppliedCode = payload.classCode?.trim().toUpperCase() ?? "";
  if (displayName.length < 2 || displayName.length > 40) return visitorJson({ error: "Enter a name between 2 and 40 characters" }, identity, { status: 400 });
  if (suppliedCode !== classCode) return visitorJson({ error: "Class code not recognised" }, identity, { status: 400 });

  const db = await getStore();
  const now = new Date().toISOString();
  await db.prepare(`INSERT INTO student_profiles (user_id, display_name, class_code, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET display_name = excluded.display_name,
    class_code = excluded.class_code, updated_at = excluded.updated_at`)
    .bind(identity.userId, displayName, classCode, now, now).run();
  return visitorJson({ profile: { displayName, classCode } }, identity);
}

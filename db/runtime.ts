import { env } from "cloudflare:workers";

export async function getStore() {
  const db = env.DB;
  if (!db) throw new Error("Learning database is unavailable");

  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS mastery (
      user_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      code TEXT NOT NULL,
      topic TEXT NOT NULL,
      score INTEGER NOT NULL DEFAULT 50,
      evidence INTEGER NOT NULL DEFAULT 0,
      confidence TEXT NOT NULL DEFAULT 'Low',
      knowledge INTEGER NOT NULL DEFAULT 50,
      application INTEGER NOT NULL DEFAULT 50,
      exam INTEGER NOT NULL DEFAULT 50,
      note TEXT NOT NULL DEFAULT 'Not assessed yet',
      due TEXT NOT NULL DEFAULT 'Today',
      updated_at TEXT NOT NULL,
      PRIMARY KEY (user_id, subject, code)
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      objective_code TEXT NOT NULL,
      correct INTEGER NOT NULL,
      confidence TEXT NOT NULL,
      used_hint INTEGER NOT NULL,
      difficulty INTEGER NOT NULL,
      delta INTEGER NOT NULL,
      created_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      content_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      object_key TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Stored',
      pages INTEGER,
      created_at TEXT NOT NULL
    )`),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_attempts_user_created ON attempts(user_id, created_at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_materials_user_created ON materials(user_id, created_at)"),
  ]);

  const attemptColumns = await db.prepare("PRAGMA table_info(attempts)").all<{ name: string }>();
  const names = new Set(attemptColumns.results.map((column) => column.name));
  if (!names.has("awarded_marks")) await db.prepare("ALTER TABLE attempts ADD COLUMN awarded_marks INTEGER").run();
  if (!names.has("total_marks")) await db.prepare("ALTER TABLE attempts ADD COLUMN total_marks INTEGER").run();
  if (!names.has("missed_points")) await db.prepare("ALTER TABLE attempts ADD COLUMN missed_points TEXT").run();

  return db;
}

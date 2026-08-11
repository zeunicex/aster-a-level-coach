import type { ChatGPTUser } from "@/app/chatgpt-auth";
import { getStore } from "@/db/runtime";
import { pdfPipeline } from "@/lib/biology-content";

type Store = Awaited<ReturnType<typeof getStore>>;

export type StoredPack = {
  packOrder: number;
  name: string;
  status: "Draft" | "Verified" | "Live";
  version: number;
  releaseNote: string;
  updatedAt: string;
};

export async function seedContentPacks(db: Store) {
  const now = new Date().toISOString();
  await db.batch(pdfPipeline.flatMap((pack) => {
    const live = pack.status === "Verified";
    const version = live ? (pack.questions >= 30 ? 2 : 1) : 0;
    const statements = [db.prepare(`INSERT OR IGNORE INTO content_packs
      (pack_order, name, status, version, release_note, updated_at)
      VALUES (?, ?, ?, ?, '', ?)`)
      .bind(pack.order, pack.name, live ? "Live" : "Draft", version, now)];
    if (live) statements.push(db.prepare(`UPDATE content_packs SET status = 'Live', version = ?, updated_at = ?
      WHERE pack_order = ? AND updated_by IS NULL AND version < ?`).bind(version, now, pack.order, version));
    return statements;
  }));
}

export async function claimInitialAdmin(db: Store, user: ChatGPTUser) {
  await db.prepare(`INSERT INTO admins (user_id, email, created_at)
    SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM admins)`)
    .bind(user.userId, user.email, new Date().toISOString()).run();
}

export async function isAdmin(db: Store, userId: string) {
  return Boolean(await db.prepare("SELECT 1 AS allowed FROM admins WHERE user_id = ?").bind(userId).first());
}

export async function listContentPacks(db: Store): Promise<StoredPack[]> {
  const rows = await db.prepare(`SELECT pack_order AS packOrder, name, status, version,
    release_note AS releaseNote, updated_at AS updatedAt
    FROM content_packs ORDER BY pack_order`).all<StoredPack>();
  return rows.results;
}

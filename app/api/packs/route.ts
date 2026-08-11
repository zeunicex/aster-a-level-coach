import { getChatGPTUser } from "@/app/chatgpt-auth";
import { claimInitialAdmin, isAdmin, listContentPacks, seedContentPacks, type StoredPack } from "@/db/packs";
import { getStore } from "@/db/runtime";
import { canTransitionPack, pdfPipeline, type PackStatus } from "@/lib/biology-content";

const statuses: PackStatus[] = ["Draft", "Verified", "Live"];

export async function GET() {
  const db = await getStore();
  await seedContentPacks(db);
  const user = await getChatGPTUser();
  if (user) await claimInitialAdmin(db, user);

  return Response.json({
    packs: await listContentPacks(db),
    isAdmin: user ? await isAdmin(db, user.userId) : false,
  });
}

export async function PATCH(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in to manage content packs" }, { status: 401 });

  const db = await getStore();
  await seedContentPacks(db);
  if (!await isAdmin(db, user.userId)) return Response.json({ error: "Owner access required" }, { status: 403 });

  let payload: { packOrder?: number; status?: PackStatus; releaseNote?: string };
  try { payload = await request.json(); } catch { return Response.json({ error: "Invalid request" }, { status: 400 }); }
  const releaseNote = payload.releaseNote?.trim() ?? "";
  if (!Number.isInteger(payload.packOrder) || !statuses.includes(payload.status as PackStatus) || releaseNote.length > 300) {
    return Response.json({ error: "Invalid pack update" }, { status: 400 });
  }

  const current = await db.prepare(`SELECT pack_order AS packOrder, name, status, version,
    release_note AS releaseNote, updated_at AS updatedAt FROM content_packs WHERE pack_order = ?`)
    .bind(payload.packOrder).first<StoredPack>();
  const definition = pdfPipeline.find((pack) => pack.order === payload.packOrder);
  if (!current || !definition) return Response.json({ error: "Content pack not found" }, { status: 404 });
  if (!canTransitionPack(current.status, payload.status!, definition.questions)) {
    return Response.json({ error: current.status === "Draft" && payload.status === "Live" ? "Verify this pack before publishing" : "This release transition is not allowed" }, { status: 409 });
  }

  const version = current.status === "Verified" && payload.status === "Live" ? current.version + 1 : current.version;
  const now = new Date().toISOString();
  await db.batch([
    db.prepare(`UPDATE content_packs SET status = ?, version = ?, release_note = ?, updated_by = ?, updated_at = ? WHERE pack_order = ?`)
      .bind(payload.status, version, releaseNote, user.userId, now, payload.packOrder),
    db.prepare(`INSERT INTO pack_releases (id, pack_order, version, status, release_note, changed_by, changed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .bind(crypto.randomUUID(), payload.packOrder, version, payload.status, releaseNote, user.userId, now),
  ]);

  return Response.json({ pack: { ...current, status: payload.status, version, releaseNote, updatedAt: now } });
}

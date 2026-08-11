import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getStore } from "@/db/runtime";

async function currentUserId() {
  return (await getChatGPTUser())?.userId ?? "local-preview";
}

export async function GET() {
  const userId = await currentUserId();
  const db = await getStore();
  const rows = await db.prepare(`
    SELECT id, name, content_type AS contentType, size, status, pages, created_at AS createdAt
    FROM materials WHERE user_id = ? ORDER BY created_at DESC
  `).bind(userId).all();
  return Response.json({ materials: rows.results });
}

export async function POST(request: Request) {
  const userId = await currentUserId();
  const data = await request.formData();
  const file = data.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Choose a file first" }, { status: 400 });
  if (file.size > 50 * 1024 * 1024) return Response.json({ error: "Files must be 50 MB or smaller" }, { status: 413 });
  if (!file.type.includes("pdf") && !file.type.startsWith("image/")) {
    return Response.json({ error: "Only PDF and image files are supported" }, { status: 415 });
  }

  const bucket = env.MATERIALS;
  if (!bucket) return Response.json({ error: "Material storage is unavailable" }, { status: 503 });
  const db = await getStore();
  const id = crypto.randomUUID();
  const objectKey = `${userId}/${id}`;
  await bucket.put(objectKey, file.stream(), { httpMetadata: { contentType: file.type } });
  const createdAt = new Date().toISOString();
  const status = "Stored securely · processing queued";
  await db.prepare(`INSERT INTO materials
    (id, user_id, name, content_type, size, object_key, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, userId, file.name, file.type || "application/octet-stream", file.size, objectKey, status, createdAt).run();

  return Response.json({ material: { id, name: file.name, contentType: file.type, size: file.size, status, createdAt } }, { status: 201 });
}

export async function DELETE(request: Request) {
  const userId = await currentUserId();
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Material id is required" }, { status: 400 });
  const db = await getStore();
  const material = await db.prepare("SELECT object_key FROM materials WHERE id = ? AND user_id = ?")
    .bind(id, userId).first<{ object_key: string }>();
  if (!material) return Response.json({ error: "Material not found" }, { status: 404 });
  await env.MATERIALS.delete(material.object_key);
  await db.prepare("DELETE FROM materials WHERE id = ? AND user_id = ?").bind(id, userId).run();
  return new Response(null, { status: 204 });
}

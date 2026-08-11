import { getChatGPTUser } from "@/app/chatgpt-auth";

const cookieName = "aster_student_id";

export async function visitorIdentity(request: Request) {
  const user = await getChatGPTUser();
  if (user) return { userId: user.userId, cookie: null };

  const existing = request.headers.get("cookie")
    ?.split(";")
    .map((part) => part.trim().split("="))
    .find(([name]) => name === cookieName)?.[1];
  if (existing && /^[a-f0-9-]{36}$/i.test(existing)) return { userId: `anon-${existing}`, cookie: null };

  const id = crypto.randomUUID();
  return {
    userId: `anon-${id}`,
    cookie: `${cookieName}=${id}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`,
  };
}

export function visitorJson(data: unknown, identity: Awaited<ReturnType<typeof visitorIdentity>>, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  if (identity.cookie) headers.set("Set-Cookie", identity.cookie);
  return Response.json(data, { ...init, headers });
}

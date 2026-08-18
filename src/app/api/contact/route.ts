import { Ratelimit } from "@upstash/ratelimit";
import { Resend } from "resend";
import { z } from "zod";
import { site } from "@/data/site";
import { requireEnv } from "@/lib/env";
import { redis } from "@/lib/redis";

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.email(),
  message: z.string().min(10).max(4000),
  /** Honeypot — real users never see this field, so any value means a bot. */
  company: z.string().max(0).optional(),
});

let limiter: Ratelimit | undefined;

function rateLimiter() {
  limiter ??= new Ratelimit({
    redis: redis(),
    limiter: Ratelimit.slidingWindow(3, "10 m"),
    prefix: "ratelimit:contact",
  });
  return limiter;
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return Response.json({ error: "Invalid submission." }, { status: 400 });
  }

  // Honeypot filled — accept silently so the bot does not learn it was caught.
  if (parsed.data.company) return Response.json({ ok: true });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = await rateLimiter().limit(ip);
  if (!success) {
    return Response.json({ error: "Too many messages. Try again shortly." }, { status: 429 });
  }

  const { name, email, message } = parsed.data;
  const env = requireEnv("RESEND_API_KEY", "CONTACT_TO_EMAIL");

  try {
    await new Resend(env.RESEND_API_KEY).emails.send({
      from: `${site.shortName} site <hello@sh1v.com>`,
      to: env.CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `sh1v.com — ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });
  } catch (error) {
    console.error("[contact]", error);
    return Response.json({ error: "Could not send. Email me directly." }, { status: 502 });
  }

  return Response.json({ ok: true });
}

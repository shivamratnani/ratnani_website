/**
 * Mints a Spotify refresh token and writes it into .env.local.
 *
 * Setup, once:
 *   1. https://developer.spotify.com/dashboard → Create app
 *   2. Redirect URI: http://127.0.0.1:8888/callback
 *      (Spotify rejects `localhost`; a loopback IP literal is required.)
 *   3. Put SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local
 *   4. pnpm spotify:auth
 *
 * Reads credentials from .env.local rather than argv so they never land in
 * shell history, and writes the refresh token straight back to the same file
 * so it is never copied by hand either.
 */
import { createServer } from "node:http";
import { join } from "node:path";
import { readEnvFile, upsertEnvFile } from "../src/lib/dotenv.ts";

const PORT = 8888;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const SCOPES = ["user-read-recently-played", "user-read-currently-playing", "user-top-read"];
const ENV_PATH = join(process.cwd(), ".env.local");

const env = await readEnvFile(ENV_PATH);
const clientId = process.env.SPOTIFY_CLIENT_ID ?? env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET ?? env.SPOTIFY_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error(
    `\nMissing credentials. Add these to ${ENV_PATH} and re-run:\n` +
      "\n  SPOTIFY_CLIENT_ID=...\n  SPOTIFY_CLIENT_SECRET=...\n",
  );
  process.exit(1);
}

const state = crypto.randomUUID();
const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
  response_type: "code",
  client_id: clientId,
  scope: SCOPES.join(" "),
  redirect_uri: REDIRECT_URI,
  state,
})}`;

/** Ends the process with a message, closing the server first. */
function finish(server: ReturnType<typeof createServer>, code: number, message: string): never {
  server.close();
  console.log(message);
  process.exit(code);
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", REDIRECT_URI);
  if (url.pathname !== "/callback") {
    response.writeHead(404).end();
    return;
  }

  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    response.writeHead(400).end("Authorization denied. Back to the terminal.");
    finish(server, 1, `\nSpotify returned: ${error}\n`);
  }

  if (!code || url.searchParams.get("state") !== state) {
    response.writeHead(400).end("State mismatch or no code. Back to the terminal.");
    finish(server, 1, "\nState mismatch — possible CSRF. Nothing was written.\n");
  }

  const token = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const payload = (await token.json()) as { refresh_token?: string; error_description?: string };

  if (!token.ok || !payload.refresh_token) {
    response.writeHead(500).end("Token exchange failed. Back to the terminal.");
    finish(server, 1, `\nToken exchange failed: ${payload.error_description ?? token.status}\n`);
  }

  await upsertEnvFile(ENV_PATH, "SPOTIFY_REFRESH_TOKEN", payload.refresh_token as string);

  response.writeHead(200, { "Content-Type": "text/plain" }).end("Done. Back to the terminal.");
  finish(
    server,
    0,
    "\n✓ SPOTIFY_REFRESH_TOKEN written to .env.local (gitignored).\n\n" +
      "Next:  pnpm env:push   — sync .env.local to Vercel\n",
  );
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("\nOpen this URL, approve, and come back:\n");
  console.log(`${authUrl}\n`);
});

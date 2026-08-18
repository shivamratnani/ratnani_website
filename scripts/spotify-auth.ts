/**
 * One-time helper to mint a Spotify refresh token.
 *
 *   1. Create an app at https://developer.spotify.com/dashboard
 *   2. Add http://127.0.0.1:8888/callback as a Redirect URI
 *   3. SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... pnpm spotify:auth
 *
 * Prints the refresh token and exits. Stores nothing, writes nothing.
 */
import { createServer } from "node:http";

const PORT = 8888;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const SCOPES = ["user-read-recently-played", "user-read-currently-playing", "user-top-read"];

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET before running.");
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

console.log("\nOpen this URL, approve, and come back:\n");
console.log(authUrl, "\n");

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", REDIRECT_URI);
  if (url.pathname !== "/callback") {
    res.writeHead(404).end();
    return;
  }

  const code = url.searchParams.get("code");
  if (!code || url.searchParams.get("state") !== state) {
    res.writeHead(400).end("Bad request — state mismatch or no code.");
    server.close();
    process.exit(1);
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
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

  const payload = (await response.json()) as { refresh_token?: string; error?: string };

  if (!response.ok || !payload.refresh_token) {
    res.writeHead(500).end("Token exchange failed. See terminal.");
    console.error("\nFailed:", payload);
    server.close();
    process.exit(1);
  }

  res.writeHead(200, { "Content-Type": "text/plain" }).end("Done. Back to the terminal.");
  console.log("\nSPOTIFY_REFRESH_TOKEN=%s\n", payload.refresh_token);
  console.log("Add it with:  vercel env add SPOTIFY_REFRESH_TOKEN production\n");
  server.close();
  process.exit(0);
});

server.listen(PORT);

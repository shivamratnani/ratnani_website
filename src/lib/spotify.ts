import type { Redis } from "@upstash/redis";
import { cacheLife } from "next/cache";
import { z } from "zod";
import { requireEnv } from "./env";
import { redis } from "./redis";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API = "https://api.spotify.com/v1";

/** Days retained. One more than the 7 we report, so the window never underfills. */
/** Per-day keys live this long. Must exceed the widest reporting window below,
 * with a day of slack so the oldest day is never expiring mid-read. */
const RETENTION_DAYS = 30;
const WINDOW_DAYS = 7;
/** The long view: four weeks. Only fills in as the sync runs — Spotify's
 * recently-played endpoint returns the last 50 plays and nothing older, so
 * there is no way to backfill a window that predates the first sync. */
const SEASON_DAYS = 28;
const TTL_SECONDS = RETENTION_DAYS * 24 * 60 * 60;

const KEY = {
  trackPlays: (day: string) => `plays:track:${day}`,
  artistPlays: (day: string) => `plays:artist:${day}`,
  trackMeta: "meta:track",
  artistMeta: "meta:artist",
  cursor: "sync:cursor",
  syncedAt: "sync:at",
} as const;

export type Track = { id: string; name: string; artist: string; url: string; art: string | null };
export type Artist = { id: string; name: string; url: string; art: string | null };
export type Ranked<T> = T & { plays: number };

export type SpotifyWeek = {
  tracks: Ranked<Track>[];
  artists: Ranked<Artist>[];
  /** Epoch ms of the last successful sync, or null if it has never run. */
  syncedAt: number | null;
};

// --- auth -------------------------------------------------------------------

/**
 * Exchanges the long-lived refresh token for an access token. Not cached —
 * the sync runs every 30 min and tokens live an hour, so caching would add a
 * staleness bug for no measurable gain.
 */
async function accessToken(): Promise<string> {
  const env = requireEnv("SPOTIFY_CLIENT_ID", "SPOTIFY_CLIENT_SECRET", "SPOTIFY_REFRESH_TOKEN");
  const basic = Buffer.from(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`).toString(
    "base64",
  );

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: env.SPOTIFY_REFRESH_TOKEN,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };

    // Spotify caps this app's refresh tokens at a 180-day lifetime, after which
    // it answers invalid_grant. Name the fix in the message — this surfaces as a
    // failed Actions run, and "400" alone would not say what to do about it.
    if (body.error === "invalid_grant") {
      throw new Error(
        "Spotify refresh token is expired or revoked. Re-run `pnpm spotify:auth`, " +
          "then `pnpm env:push`. Refresh tokens for this app expire after 180 days.",
      );
    }

    throw new Error(
      `Spotify token refresh failed (${response.status}): ${body.error ?? "unknown"}`,
    );
  }

  return z.object({ access_token: z.string() }).parse(await response.json()).access_token;
}

async function api(path: string, token: string): Promise<unknown> {
  const response = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (response.status === 204) return null;
  if (!response.ok) throw new Error(`Spotify ${path} failed (${response.status})`);
  return response.json();
}

// --- ingest -----------------------------------------------------------------

const imageSchema = z.array(z.object({ url: z.string() }));

const recentSchema = z.object({
  items: z.array(
    z.object({
      played_at: z.string(),
      track: z.object({
        id: z.string().nullable(),
        name: z.string(),
        external_urls: z.object({ spotify: z.string() }),
        album: z.object({ name: z.string(), images: imageSchema }),
        artists: z
          .array(
            z.object({
              id: z.string().nullable(),
              name: z.string(),
              external_urls: z.object({ spotify: z.string() }),
            }),
          )
          .min(1),
      }),
    }),
  ),
});

/** UTC day key, e.g. "2026-08-18". */
export function dayKey(epochMs: number): string {
  return new Date(epochMs).toISOString().slice(0, 10);
}

/** The RETENTION-bounded set of day keys covering the reporting window. */
export function windowDays(now: number, days = WINDOW_DAYS): string[] {
  return Array.from({ length: days }, (_, i) => dayKey(now - i * 86_400_000));
}

const artistsSchema = z.object({
  artists: z.array(
    z.object({ id: z.string(), images: z.array(z.object({ url: z.string() })) }).nullable(),
  ),
});

/**
 * recently-played carries simplified artist objects, which have no images, so
 * artist rows rendered without art. One extra call hydrates them; 50 ids is the
 * endpoint's maximum and also this sync's page size, so one request covers it.
 */
async function artistImages(ids: string[], token: string): Promise<Map<string, string>> {
  const images = new Map<string, string>();
  if (ids.length === 0) return images;

  try {
    const payload = await api(`/artists?ids=${ids.slice(0, 50).join(",")}`, token);
    for (const artist of artistsSchema.parse(payload).artists) {
      // Smallest image on offer — these render at 36px.
      const url = artist?.images.at(-1)?.url;
      if (artist && url) images.set(artist.id, url);
    }
  } catch (error) {
    // Portraits are a nicety and this endpoint currently answers 403 for this
    // token. Never let it fail the ingest — callers fall back to album art.
    console.warn("[spotify] artist portraits unavailable:", error);
  }
  return images;
}

/**
 * Fills in art for artists stored without it. Runs on every sync, independent
 * of whether anything new was played: art only ever arrived alongside a play,
 * so a quiet day would otherwise leave those rows blank indefinitely. Bounded
 * to one request by the endpoint's 50-id ceiling.
 */
async function backfillArtistArt(db: Redis, token: string): Promise<number> {
  const stored = (await db.hgetall<Record<string, Artist>>(KEY.artistMeta)) ?? {};
  const stale = Object.values(stored)
    .filter((artist) => artist && !artist.art)
    .slice(0, 50);
  if (stale.length === 0) return 0;

  const portraits = await artistImages(
    stale.map((artist) => artist.id),
    token,
  );

  // Portraits are currently a 403 for this token, so fall back to covers we
  // already hold. A track's `artist` field is its artist names joined in order,
  // so the first is the primary artist — the one stored under this id.
  const tracks = (await db.hgetall<Record<string, Track>>(KEY.trackMeta)) ?? {};
  const covers = new Map<string, string>();
  for (const track of Object.values(tracks)) {
    const primary = track?.artist?.split(", ")[0];
    if (primary && track.art && !covers.has(primary)) covers.set(primary, track.art);
  }

  const pipeline = db.pipeline();
  let filled = 0;
  for (const artist of stale) {
    const art = portraits.get(artist.id) ?? covers.get(artist.name);
    if (!art) continue;
    pipeline.hset(KEY.artistMeta, { [artist.id]: { ...artist, art } });
    filled += 1;
  }
  if (filled > 0) await pipeline.exec();
  return filled;
}

export type PlayEvent = {
  playedAt: number;
  track: Track;
  artist: Artist | null;
};

/**
 * Pure fold: selects plays strictly newer than the cursor and buckets them by
 * UTC day. Extracted from the sync so the idempotency guarantee — the property
 * that makes re-running the cron safe — is directly testable without Redis.
 */
export function foldPlays(
  items: readonly PlayEvent[],
  cursor: number,
): { newest: number; days: Map<string, PlayEvent[]> } {
  const days = new Map<string, PlayEvent[]>();
  let newest = cursor;

  for (const play of items) {
    if (play.playedAt <= cursor) continue;
    newest = Math.max(newest, play.playedAt);
    const day = dayKey(play.playedAt);
    const bucket = days.get(day);
    if (bucket) bucket.push(play);
    else days.set(day, [play]);
  }

  return { newest, days };
}

/**
 * Pure merge: sums Upstash zrange withScores payloads (flat [member, score, ...])
 * into one id -> total map.
 */
export function mergeScores(results: readonly (string | number)[][]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const flat of results) {
    for (let i = 0; i < flat.length; i += 2) {
      const id = String(flat[i]);
      totals.set(id, (totals.get(id) ?? 0) + Number(flat[i + 1] ?? 0));
    }
  }
  return totals;
}

/** Pure rank: highest total first, capped at `limit`. */
export function topN(totals: Map<string, number>, limit: number): [string, number][] {
  return [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

/**
 * Pulls plays since the stored cursor and folds them into per-day sorted sets.
 *
 * Idempotent: the `after` cursor advances to the newest `played_at` seen, so a
 * re-run inside the same window ingests nothing and cannot double-count. Day
 * keys carry an 8-day TTL, so the window prunes itself with no cleanup job.
 */
export async function syncRecentlyPlayed(now = Date.now()): Promise<{ ingested: number }> {
  const db = redis();
  const token = await accessToken();
  const cursor = await db.get<number>(KEY.cursor);

  const query = new URLSearchParams({ limit: "50" });
  if (cursor) query.set("after", String(cursor));

  const payload = await api(`/me/player/recently-played?${query}`, token);
  const { items } = recentSchema.parse(payload);

  await backfillArtistArt(db, token);

  if (items.length === 0) {
    await db.set(KEY.syncedAt, now);
    return { ingested: 0 };
  }

  const events: PlayEvent[] = items.flatMap((item) => {
    const { track } = item;
    const artist = track.artists[0];
    if (!track.id) return [];
    return [
      {
        playedAt: Date.parse(item.played_at),
        track: {
          id: track.id,
          name: track.name,
          artist: track.artists.map((a) => a.name).join(", "),
          url: track.external_urls.spotify,
          art: track.album.images.at(-1)?.url ?? null,
        },
        artist:
          artist?.id != null
            ? {
                id: artist.id,
                name: artist.name,
                url: artist.external_urls.spotify,
                // Cover of a track they appear on, replaced by a real portrait
                // below when Spotify serves one. Better than a blank square.
                art: track.album.images.at(-1)?.url ?? null,
              }
            : null,
      },
    ];
  });

  // Hydrate art before the pipeline is built, so the meta written below is
  // complete rather than needing a second pass.
  const wanted = new Set(events.flatMap((event) => (event.artist ? [event.artist.id] : [])));
  const images = await artistImages([...wanted], token);
  for (const event of events) {
    // Keep the album-art fallback when no portrait came back.
    if (event.artist) event.artist.art = images.get(event.artist.id) ?? event.artist.art;
  }

  const { newest, days } = foldPlays(events, cursor ?? 0);
  const pipeline = db.pipeline();
  let ingested = 0;

  for (const [day, plays] of days) {
    for (const play of plays) {
      ingested += 1;
      pipeline.zincrby(KEY.trackPlays(day), 1, play.track.id);
      pipeline.hset(KEY.trackMeta, { [play.track.id]: play.track });

      if (play.artist) {
        pipeline.zincrby(KEY.artistPlays(day), 1, play.artist.id);
        pipeline.hset(KEY.artistMeta, { [play.artist.id]: play.artist });
      }
    }
    pipeline.expire(KEY.trackPlays(day), TTL_SECONDS);
    pipeline.expire(KEY.artistPlays(day), TTL_SECONDS);
  }

  pipeline.set(KEY.cursor, newest);
  pipeline.set(KEY.syncedAt, now);
  await pipeline.exec();

  return { ingested };
}

// --- read -------------------------------------------------------------------

/** Sums play counts for one entity type across the window's day keys. */
async function rank(
  db: Redis,
  keyFor: (day: string) => string,
  days: string[],
): Promise<Map<string, number>> {
  const pipeline = db.pipeline();
  for (const day of days) pipeline.zrange(keyFor(day), 0, -1, { withScores: true });
  return mergeScores((await pipeline.exec()) as (string | number)[][]);
}

/** Attaches stored metadata to ranked ids, dropping any that lost their entry. */
async function hydrate<T extends { id: string }>(
  db: Redis,
  metaKey: string,
  totals: Map<string, number>,
  limit: number,
): Promise<Ranked<T>[]> {
  const top = topN(totals, limit);
  if (top.length === 0) return [];

  const meta = await db.hmget<Record<string, T>>(metaKey, ...top.map(([id]) => id));

  return top
    .map(([id, plays]) => {
      const entity = meta?.[id];
      return entity ? { ...entity, plays } : null;
    })
    .filter((entry): entry is Ranked<T> => entry !== null);
}

const EMPTY_WEEK: SpotifyWeek = { tracks: [], artists: [], syncedAt: null };

/**
 * The rolling 7-day window, or an empty week if Redis is unreachable.
 *
 * Degrading to empty rather than throwing keeps a storage blip — or a build
 * with no credentials — from breaking the page.
 */
export async function getSpotifyWeek(limit = 8): Promise<SpotifyWeek> {
  return read(WINDOW_DAYS, limit);
}

/** The same aggregation over seven weeks rather than seven days. */
export async function getSpotifySeason(limit = 8): Promise<SpotifyWeek> {
  return read(SEASON_DAYS, limit);
}

async function read(days: number, limit: number): Promise<SpotifyWeek> {
  try {
    return await readWindow(days, limit);
  } catch (error) {
    console.error("[spotify]", error);
    return EMPTY_WEEK;
  }
}

async function readWindow(days: number, limit: number): Promise<SpotifyWeek> {
  "use cache";
  cacheLife("minutes");

  // Resolved once, before any promise exists: redis() throws when the Upstash
  // config is missing, and throwing between Promise.all's arguments would leave
  // the promises already built by the earlier arguments unhandled.
  const db = redis();
  const window = windowDays(Date.now(), days);
  const [trackTotals, artistTotals, syncedAt] = await Promise.all([
    rank(db, KEY.trackPlays, window),
    rank(db, KEY.artistPlays, window),
    db.get<number>(KEY.syncedAt),
  ]);

  const [tracks, artists] = await Promise.all([
    hydrate<Track>(db, KEY.trackMeta, trackTotals, limit),
    hydrate<Artist>(db, KEY.artistMeta, artistTotals, limit),
  ]);

  return { tracks, artists, syncedAt: syncedAt ?? null };
}

// --- now playing ------------------------------------------------------------

const nowPlayingSchema = z.object({
  is_playing: z.boolean(),
  progress_ms: z.number().nullable().optional(),
  item: z
    .object({
      name: z.string(),
      duration_ms: z.number().optional(),
      external_urls: z.object({ spotify: z.string() }),
      album: z.object({ name: z.string(), images: imageSchema }),
      artists: z.array(z.object({ name: z.string() })).min(1),
    })
    .nullable(),
});

const meSchema = z.object({ id: z.string() });

const playlistsSchema = z.object({
  items: z.array(
    z
      .object({
        id: z.string(),
        name: z.string(),
        external_urls: z.object({ spotify: z.string() }),
        // Every field past the id is optional in practice: Spotify omits images
        // on empty playlists and `public` on some collaborative ones, and a
        // strict schema would throw the whole list away over one odd entry.
        images: imageSchema.nullish(),
        // Spotify renamed the track-count field on playlist objects: it now
        // arrives as `items`, and `tracks` is absent entirely. Read both, so a
        // rollback either way still yields a count rather than a silent zero.
        items: z.object({ total: z.number() }).nullish(),
        tracks: z.object({ total: z.number() }).nullish(),
        owner: z.object({ id: z.string() }).nullish(),
        public: z.boolean().nullish(),
      })
      .nullable(),
  ),
});

export type Playlist = {
  id: string;
  name: string;
  url: string;
  art: string | null;
  tracks: number;
};

/**
 * Public playlists, newest first. Returns an empty list rather than throwing:
 * this needs `playlist-read-private`, which the stored refresh token may predate,
 * and a missing scope should hide the section rather than break the page.
 */
export async function getPlaylists(limit = 8): Promise<Playlist[]> {
  try {
    const token = await accessToken();
    // /me/playlists returns followed playlists alongside your own, so the owner
    // is needed to keep this to playlists you actually made.
    const [me, payload] = await Promise.all([
      api("/me", token),
      api("/me/playlists?limit=50", token),
    ]);
    const mine = meSchema.safeParse(me);

    return playlistsSchema
      .parse(payload)
      .items.flatMap((item) => {
        if (!item || item.public === false) return [];
        if (mine.success && item.owner && item.owner.id !== mine.data.id) return [];
        return [
          {
            id: item.id,
            name: item.name,
            url: item.external_urls.spotify,
            art: item.images?.at(0)?.url ?? null,
            tracks: item.items?.total ?? item.tracks?.total ?? 0,
          },
        ];
      })
      .slice(0, limit);
  } catch (error) {
    console.warn("[spotify] playlists unavailable:", error);
    return [];
  }
}

export type NowPlaying = {
  name: string;
  artist: string;
  album: string;
  url: string;
  art: string | null;
  /** False when this is the last thing played rather than the current track. */
  playing: boolean;
  /** Both in ms, for the progress bar. Null unless something is playing. */
  progressMs: number | null;
  durationMs: number | null;
} | null;

/** Currently playing track, or null when nothing is. Never cached. */
export async function getNowPlaying(): Promise<NowPlaying> {
  const token = await accessToken();
  const payload = await api("/me/player/currently-playing", token);
  const parsed = payload ? nowPlayingSchema.safeParse(payload) : null;

  if (parsed?.success && parsed.data.is_playing && parsed.data.item) {
    const { item } = parsed.data;
    return {
      name: item.name,
      artist: item.artists.map((a) => a.name).join(", "),
      album: item.album.name,
      url: item.external_urls.spotify,
      // First image, not last: this one is rendered large enough to want it.
      art: item.album.images.at(0)?.url ?? null,
      playing: true,
      progressMs: parsed.data.progress_ms ?? null,
      durationMs: item.duration_ms ?? null,
    };
  }

  // Nothing playing: show the last thing that was, rather than an empty line.
  return lastPlayed(token);
}

/** The most recent play, or null if the history is empty or unreadable. */
async function lastPlayed(token: string): Promise<NowPlaying> {
  try {
    const payload = await api("/me/player/recently-played?limit=1", token);
    const item = recentSchema.parse(payload).items[0];
    if (!item) return null;

    const { track } = item;
    return {
      name: track.name,
      artist: track.artists.map((a) => a.name).join(", "),
      album: track.album.name,
      url: track.external_urls.spotify,
      art: track.album.images.at(0)?.url ?? null,
      playing: false,
      progressMs: null,
      durationMs: null,
    };
  } catch (error) {
    console.warn("[spotify] recent history unavailable:", error);
    return null;
  }
}

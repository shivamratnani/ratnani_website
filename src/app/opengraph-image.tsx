import { ImageResponse } from "next/og";
import { DOT_RADIUS, MARK_DOTS, MARK_HEIGHT, MARK_WIDTH } from "@/data/mark";
import { site } from "@/data/site";

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori treats each interpolation as a separate child and requires an explicit
// display on any element holding more than one, so text is flattened up front.
const SUBTITLE = `${site.role} at ${site.company}. Payments, voice, and AI infrastructure.`;

/** The nav mark at OG scale. Same data, same shape, no second source of truth. */
const MARK_SCALE = 2.4;
const DOT = DOT_RADIUS * 2 * MARK_SCALE;

function Mark() {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: MARK_WIDTH * MARK_SCALE,
        height: MARK_HEIGHT * MARK_SCALE,
      }}
    >
      {MARK_DOTS.map((dot) => (
        <div
          key={`${dot.x}-${dot.y}`}
          style={{
            position: "absolute",
            left: dot.x * MARK_SCALE - DOT / 2,
            top: dot.y * MARK_SCALE - DOT / 2,
            width: DOT,
            height: DOT,
            borderRadius: 999,
            background: dot.phase > 0.93 ? "#ff2d20" : "#6e6e76",
          }}
        />
      ))}
    </div>
  );
}

/** Mirrors the site palette: near-black ground, one red mark. */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#050505",
        padding: 80,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Mark />
        <div style={{ display: "flex", fontSize: 22, color: "#6e6e76", letterSpacing: 2 }}>
          SH1V.COM
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", fontSize: 68, color: "#ededef", letterSpacing: -2 }}>
          {site.name}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#a1a1aa",
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          {SUBTITLE}
        </div>
      </div>
    </div>,
    size,
  );
}

import { ImageResponse } from "next/og";
import { DOT_RADIUS, MARK_DOTS, MARK_HEIGHT, MARK_WIDTH } from "@/data/mark";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Padding around the mark, as a fraction of the icon. */
const INSET = 0.16;
const SCALE = (size.width * (1 - INSET * 2)) / MARK_WIDTH;

/**
 * The nav logo, rasterised. Satori has no SVG-element support, so each dot is
 * an absolutely-positioned round div — the geometry still comes from data/mark.
 */
export default function Icon() {
  const offsetY = (size.height - MARK_HEIGHT * SCALE) / 2;
  const diameter = DOT_RADIUS * 2 * SCALE;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: "#050505",
      }}
    >
      {MARK_DOTS.map((dot) => (
        <div
          key={`${dot.x}-${dot.y}`}
          style={{
            position: "absolute",
            left: size.width * INSET + dot.x * SCALE - diameter / 2,
            top: offsetY + dot.y * SCALE - diameter / 2,
            width: diameter,
            height: diameter,
            borderRadius: 999,
            // One red dot, matching the site's single-accent rule.
            background: dot.phase > 0.93 ? "#ff2d20" : "#ededef",
          }}
        />
      ))}
    </div>,
    size,
  );
}

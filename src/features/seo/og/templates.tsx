import type { ReactElement } from "react";

import type { OgTemplate } from "@/lib/seo/og-url";
import {
  OG_HEIGHT,
  OG_WIDTH,
  ogLogo,
  ogTokens,
} from "@/features/seo/og/tokens";

export type OgImageProps = {
  /** Host shown in the footer, without the protocol. */
  domain: string;
  description?: string | undefined;
  /** Small label above the title; also the initials on the creator card. */
  eyebrow?: string | undefined;
  template: OgTemplate;
  title: string;
};

/** Display face for every line of type on a share image. */
const DISPLAY = "Outfit";
/** Body face. */
const BODY = "Geist";

/**
 * Satori supports a subset of CSS and no grid, so every surface below is a
 * flex column with explicit dimensions.
 */
const cardStyle: React.CSSProperties = {
  backgroundColor: ogTokens.canvas,
  display: "flex",
  flexDirection: "column",
  height: OG_HEIGHT,
  justifyContent: "space-between",
  overflow: "hidden",
  padding: 60,
  position: "relative",
  width: OG_WIDTH,
};

/** Subtle organic contour lines, echoing the marketing page texture. */
function Contours({ inverted }: { inverted: boolean }): ReactElement {
  return (
    <svg
      height={OG_HEIGHT}
      style={{ left: 0, opacity: 0.55, position: "absolute", top: 0 }}
      viewBox={`0 0 ${OG_WIDTH} ${OG_HEIGHT}`}
      width={OG_WIDTH}
    >
      <circle
        cx={1030}
        cy={96}
        fill={inverted ? ogTokens.brandStrong : ogTokens.brandTint}
        opacity={0.5}
        r={190}
      />
      <path
        d="M-40 486 C 220 396, 430 552, 700 442 S 1090 312, 1260 392"
        fill="none"
        stroke={inverted ? ogTokens.brandStrong : ogTokens.brandSoft}
        strokeWidth={2}
      />
      <path
        d="M-40 556 C 260 486, 470 616, 760 516 S 1130 396, 1260 466"
        fill="none"
        stroke={inverted ? ogTokens.brandStrong : ogTokens.border}
        strokeWidth={2}
      />
    </svg>
  );
}

/** The rounded-square leaf mark, matching `brand-mark.tsx` and `icon.svg`. */
export function OgLogoMark({
  size = 46,
  inverted = false,
}: {
  inverted?: boolean;
  size?: number;
}): ReactElement {
  return (
    <svg height={size} viewBox={ogLogo.viewBox} width={size}>
      <rect
        fill={inverted ? ogTokens.surface : ogTokens.brand}
        height="32"
        rx={ogLogo.radius}
        width="32"
      />
      <path d={ogLogo.leafPath} fill={inverted ? ogTokens.brand : "#ffffff"} />
    </svg>
  );
}

function Wordmark({ inverted }: { inverted: boolean }): ReactElement {
  return (
    <div style={{ alignItems: "center", display: "flex", gap: 14 }}>
      <OgLogoMark inverted={inverted} />
      <span
        style={{
          color: inverted ? "#ffffff" : ogTokens.ink,
          fontFamily: DISPLAY,
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: -1.2,
        }}
      >
        Inverge
      </span>
    </div>
  );
}

function Footer({
  domain,
  inverted,
  note,
}: {
  domain: string;
  inverted: boolean;
  note?: string | undefined;
}): ReactElement {
  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <span
        style={{
          color: inverted ? ogTokens.brandSoft : ogTokens.muted,
          fontFamily: BODY,
          fontSize: 24,
        }}
      >
        {domain}
      </span>
      {note ? (
        <span
          style={{
            color: inverted ? ogTokens.brandSoft : ogTokens.muted,
            fontFamily: BODY,
            fontSize: 24,
          }}
        >
          {note}
        </span>
      ) : null}
    </div>
  );
}

/** Small uppercase label above a title. */
function Eyebrow({
  children,
  inverted,
}: {
  children: string;
  inverted: boolean;
}): ReactElement {
  return (
    <span
      style={{
        color: inverted ? ogTokens.brand : ogTokens.brandStrong,
        fontFamily: BODY,
        fontSize: 24,
        fontWeight: 700,
        letterSpacing: 3,
        marginBottom: 22,
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

/**
 * Clamps to two lines. Satori has no `line-clamp` shorthand, so the longhand
 * box properties are used directly.
 */
const twoLines: React.CSSProperties = {
  display: "webkit-box",
  overflow: "hidden",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 2,
};

const threeLines: React.CSSProperties = {
  display: "webkit-box",
  overflow: "hidden",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 3,
};

/**
 * Renders one share image.
 *
 * Every card shares the same palette, mark, and type scale so a card stays
 * recognisable at feed size; only the reading order and emphasis change.
 */
export function OgImage({
  description,
  domain,
  eyebrow,
  template,
  title,
}: OgImageProps): ReactElement {
  const inverted =
    template === "idea" || template === "ideathon" || template === "creator";

  const titleStyle: React.CSSProperties = {
    color: inverted ? "#ffffff" : ogTokens.ink,
    fontFamily: DISPLAY,
    fontSize: template === "creator" ? 64 : 68,
    fontWeight: 700,
    letterSpacing: -2,
    lineHeight: 1.05,
    maxWidth: 960,
    ...twoLines,
  };

  const descriptionStyle: React.CSSProperties = {
    color: inverted ? ogTokens.brandSoft : ogTokens.inkSoft,
    fontFamily: BODY,
    fontSize: 30,
    lineHeight: 1.4,
    marginTop: 28,
    maxWidth: 900,
    ...threeLines,
  };

  const body = (
    <div
      style={{ display: "flex", flexDirection: "column", position: "relative" }}
    >
      {template === "creator" ? (
        <div
          style={{
            alignItems: "center",
            backgroundColor: inverted ? ogTokens.brandStrong : ogTokens.brand,
            borderRadius: 70,
            display: "flex",
            height: 140,
            justifyContent: "center",
            marginBottom: 34,
            width: 140,
          }}
        >
          <span
            style={{
              color: "#ffffff",
              fontFamily: DISPLAY,
              fontSize: 56,
              fontWeight: 700,
              letterSpacing: -1,
            }}
          >
            {eyebrow ?? "—"}
          </span>
        </div>
      ) : eyebrow ? (
        <Eyebrow inverted={inverted}>{eyebrow}</Eyebrow>
      ) : null}

      <div style={titleStyle}>{title}</div>
      {description ? <div style={descriptionStyle}>{description}</div> : null}
    </div>
  );

  return (
    <div style={cardStyle}>
      {!inverted ? <Contours inverted={false} /> : null}
      <div style={{ display: "flex", position: "relative" }}>
        <Wordmark inverted={inverted} />
      </div>
      {body}
      <Footer
        domain={domain}
        inverted={inverted}
        note={
          template === "ideathon"
            ? "Ideathon"
            : template === "guide"
              ? "Guide"
              : undefined
        }
      />
    </div>
  );
}

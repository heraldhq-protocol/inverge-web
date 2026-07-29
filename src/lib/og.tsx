import { ImageResponse } from 'next/og';
import { SITE } from './site';

// Metadata-image conventions (shared by every opengraph-image / twitter-image route).
export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = 'image/png';
export const OG_ALT = `${SITE.name} — ${SITE.tagline}`;

// Brand palette as sRGB hex — Satori does not understand the oklch() tokens in globals.css.
const FOREST = '#10231A';
const ACCENT = '#1FA85C';
const ACCENT_SOFT = '#8FD9AE';
const WHITE = '#FFFFFF';
const MUTED = 'rgba(255,255,255,0.6)';

/** Title scales down as it gets longer so long post/guide titles never overflow the frame. */
function titleSize(title: string): number {
  if (title.length > 68) return 54;
  if (title.length > 46) return 64;
  return 76;
}

/**
 * Renders a branded 1200×630 OpenGraph/Twitter card in code (no static asset).
 * `eyebrow` labels the context (a post category, a guide audience); omit it for the root card,
 * where the tagline is the whole message.
 */
export function ogImageResponse({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          padding: '72px 80px',
          backgroundColor: FOREST,
          color: WHITE,
          fontFamily: 'sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Accent glow, top-right */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: -180,
            right: -120,
            width: 540,
            height: 540,
            borderRadius: 9999,
            backgroundColor: ACCENT,
            opacity: 0.16,
          }}
        />

        {/* Brand lockup */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              display: 'flex',
              width: 60,
              height: 60,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 4C9.37 4 4 9.37 4 16s5.37 12 12 12 12-5.37 12-12S22.63 4 16 4Z"
                fill={ACCENT}
                fillOpacity="0.25"
              />
              <path d="M8 22C11 12 18 8 24 9C23 15 19 22 8 22Z" fill={ACCENT} />
            </svg>
          </div>
          <div style={{ display: 'flex', fontSize: 36, fontWeight: 700, letterSpacing: -0.5 }}>
            inverge
          </div>
        </div>

        {/* Message */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 1000 }}>
          {eyebrow ? (
            <div
              style={{
                display: 'flex',
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: 3,
                textTransform: 'uppercase',
                color: ACCENT_SOFT,
              }}
            >
              {eyebrow}
            </div>
          ) : null}
          <div
            style={{
              display: 'flex',
              fontSize: titleSize(title),
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              color: WHITE,
            }}
          >
            {title}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: 24, color: MUTED }}>{SITE.domain}</div>
          <div style={{ display: 'flex', fontSize: 22, color: MUTED }}>
            Milestone-escrow crowdfunding
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}

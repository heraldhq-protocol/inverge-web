import { ogImageResponse, OG_SIZE, OG_CONTENT_TYPE, OG_ALT } from '@/lib/og';
import { SITE } from '@/lib/site';

export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Root card: the tagline is the whole message, no eyebrow.
export default function Image() {
  return ogImageResponse({ title: SITE.tagline });
}

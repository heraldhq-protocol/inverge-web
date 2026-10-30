/**
 * Campaign images use the shared renderer.
 *
 * Campaign media is a mix of uploaded assets (served by our session-aware read
 * route) and links a creator hosts themselves. `@/components/ui/media-image`
 * decides how each is loaded; this module stays as the campaigns' import path so
 * a campaign component does not need to know about the distinction.
 */
export { MediaImage } from "@/components/ui/media-image";

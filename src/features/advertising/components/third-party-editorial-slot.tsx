import { ThirdPartyAdSlot } from "@/features/advertising/components/third-party-ad-slot";
import { resolveAdFlags } from "@/features/advertising/lib/flags";

/**
 * Server boundary for the isolated third-party editorial slot.
 *
 * The provider is selected by environment, never by a client prop, and only
 * when the third-party flag is on. In development an unconfigured slot explains
 * itself; in production it renders nothing rather than reserving an empty ad
 * rectangle. Consent is still checked inside the client adapter.
 */
export function ThirdPartyEditorialSlot() {
  const flags = resolveAdFlags();
  const clientId = process.env.NEXT_PUBLIC_INVERGE_ADSENSE_CLIENT_ID?.trim();
  const slotId = process.env.NEXT_PUBLIC_INVERGE_ADSENSE_SLOT_ID?.trim();

  if (flags.thirdPartyEnabled && clientId && slotId) {
    return <ThirdPartyAdSlot clientId={clientId} slotId={slotId} />;
  }

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <aside
      aria-label="Third-party advertising status"
      className="rounded-xl border border-dashed border-border px-3 py-2.5"
    >
      <p className="text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-muted">
        Third-party advertising
      </p>
      <p className="mt-1 text-[0.6875rem] leading-4 text-muted">
        Not configured in this build. No provider script, identifier, or
        personalised ad is loaded.
      </p>
    </aside>
  );
}

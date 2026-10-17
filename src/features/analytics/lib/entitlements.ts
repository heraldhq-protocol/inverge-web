export type AnalyticsPlan = "free" | "pro" | "studio";

export type AiInsightsEntitlement = {
  allowed: boolean;
  requiredPlan: "Pro";
  status: "not_configured";
  reason: string;
};

/**
 * Server-owned entitlement boundary for AI analytics.
 *
 * There is no plan or entitlement service in the current backend. Keeping this
 * function server-only means the client cannot flip a badge or local boolean to
 * unlock AI output. When billing and the insights service exist, this function
 * becomes the one place that reads the caller's plan and the service's
 * availability; the panel below does not need to change.
 */
export function getAiInsightsEntitlement(): AiInsightsEntitlement {
  return {
    allowed: false,
    requiredPlan: "Pro",
    status: "not_configured",
    reason:
      "AI insights are not connected yet. Basic analytics remain available on every plan.",
  };
}

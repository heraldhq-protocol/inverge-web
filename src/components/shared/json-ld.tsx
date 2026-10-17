import type { ReactElement } from "react";

import type { JsonLdNode } from "@/lib/seo/json-ld";

/**
 * Emits structured data as a JSON-LD script tag.
 *
 * The payload is escaped so a `</script>` in any string value cannot terminate
 * the tag and inject markup. Rendered inside a server component's `<head>`.
 */
export function JsonLd({
  data,
}: {
  data: JsonLdNode | JsonLdNode[];
}): ReactElement {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      dangerouslySetInnerHTML={{ __html: json }}
      type="application/ld+json"
    />
  );
}

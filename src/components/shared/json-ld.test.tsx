import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { JsonLd } from "@/components/shared/json-ld";

describe("JsonLd", () => {
  it("emits a JSON-LD script tag", () => {
    const html = renderToStaticMarkup(
      <JsonLd data={{ "@type": "Organization", name: "Inverge" }} />,
    );

    expect(html).toContain('type="application/ld+json"');
    expect(html).toContain('"name":"Inverge"');
  });

  it("serialises an array as a single document", () => {
    const html = renderToStaticMarkup(
      <JsonLd data={[{ "@type": "Organization" }, { "@type": "WebSite" }]} />,
    );

    expect(html).toContain('[{"@type":"Organization"},{"@type":"WebSite"}]');
  });

  it("neutralises a closing tag so a crafted value cannot end the element", () => {
    const html = renderToStaticMarkup(
      <JsonLd
        data={{
          "@type": "Organization",
          name: "</script><img src=x onerror=alert(1)>",
        }}
      />,
    );

    expect(html).not.toContain("</script><img");
    expect(html).toContain("\\u003c/script>");
  });
});

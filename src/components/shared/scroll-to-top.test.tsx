import { render } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ScrollToTop } from "@/components/shared/scroll-to-top";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

describe("ScrollToTop", () => {
  const originalScrollTo = window.scrollTo;
  let scrollToMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scrollToMock = vi.fn();
    window.scrollTo = scrollToMock;
    window.location.hash = "";
  });

  afterEach(() => {
    window.scrollTo = originalScrollTo;
    vi.clearAllMocks();
  });

  it("scrolls to top on pathname change", () => {
    vi.mocked(usePathname).mockReturnValue("/page-one");
    const { rerender } = render(<ScrollToTop />);

    expect(scrollToMock).not.toHaveBeenCalled();

    vi.mocked(usePathname).mockReturnValue("/page-two");
    rerender(<ScrollToTop />);

    expect(scrollToMock).toHaveBeenCalledWith({
      behavior: "auto",
      left: 0,
      top: 0,
    });
  });

  it("does not scroll if pathname has not changed", () => {
    vi.mocked(usePathname).mockReturnValue("/page-one");
    const { rerender } = render(<ScrollToTop />);

    rerender(<ScrollToTop />);
    expect(scrollToMock).not.toHaveBeenCalled();
  });

  it("does not scroll when an in-page hash is present", () => {
    vi.mocked(usePathname).mockReturnValue("/page-one");
    const { rerender } = render(<ScrollToTop />);

    window.location.hash = "#section";
    vi.mocked(usePathname).mockReturnValue("/page-two");
    rerender(<ScrollToTop />);

    expect(scrollToMock).not.toHaveBeenCalled();
  });

  it("does not scroll when navigating via browser back/forward (popstate)", () => {
    vi.mocked(usePathname).mockReturnValue("/page-one");
    const { rerender } = render(<ScrollToTop />);

    window.dispatchEvent(new PopStateEvent("popstate"));

    vi.mocked(usePathname).mockReturnValue("/page-two");
    rerender(<ScrollToTop />);

    expect(scrollToMock).not.toHaveBeenCalled();
  });
});

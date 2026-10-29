import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { WaitlistLaneProvider } from "@/features/marketing/components/waitlist/waitlist-lane-context";
import { WaitlistLanePanel } from "@/features/marketing/components/waitlist/waitlist-lane-panel";
import { WaitlistForm } from "@/features/marketing/components/waitlist/waitlist-form";
import type { WaitlistLaneId } from "@/features/marketing/content/waitlist";

afterEach(cleanup);

function Harness({
  initialLane = "backer",
  showPanel = false,
}: {
  initialLane?: WaitlistLaneId;
  showPanel?: boolean;
}) {
  return (
    <WaitlistLaneProvider initialLane={initialLane}>
      <WaitlistForm />
      {showPanel ? <WaitlistLanePanel /> : null}
    </WaitlistLaneProvider>
  );
}

describe("WaitlistForm", () => {
  it("asks for an email before submitting", async () => {
    // #given an empty form
    render(<Harness />);

    // #when the visitor submits
    fireEvent.click(
      screen.getByRole("button", { name: "Join the backer list" }),
    );

    // #then the field explains what is missing and keeps focus
    expect(
      await screen.findByText("Enter your email address."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toHaveFocus();
  });

  it("rejects an address that is not an email", () => {
    render(<Harness />);
    const email = screen.getByLabelText("Email address");

    fireEvent.change(email, { target: { value: "not-an-email" } });
    fireEvent.blur(email);

    expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
  });

  it("switches lanes and confirms the chosen list", async () => {
    // #given the builder lane selected
    render(<Harness initialLane="builder" />);
    expect(screen.getByRole("radio", { name: "Start a build" })).toBeChecked();

    // #when a valid address is submitted
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "builder@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Join the builder list" }),
    );

    // #then the success state names the lane and the address
    expect(
      await screen.findByRole("heading", { name: /builder list/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("builder@example.com")).toBeInTheDocument();
    expect(screen.getByText(/not stored yet/i)).toBeInTheDocument();
  });

  it("keeps the lane summary in step with the form switch", () => {
    render(<Harness showPanel />);

    expect(
      screen.getByRole("heading", { name: "Back a build" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Start a build" }));

    expect(
      screen.getByRole("heading", { name: "Start a build" }),
    ).toBeInTheDocument();
    const form = screen.getByLabelText("Email address").closest("form");
    if (!(form instanceof HTMLFormElement)) {
      throw new Error("Expected the email field to be inside a form.");
    }
    expect(
      within(form).getByRole("button", { name: "Join the builder list" }),
    ).toBeInTheDocument();
  });

  it("lets the visitor move to the other lane after joining", async () => {
    render(<Harness />);

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "backer@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Join the backer list" }),
    );
    await screen.findByRole("heading", { name: /backer list/i });

    fireEvent.click(
      screen.getByRole("button", { name: /join the builder list instead/i }),
    );

    expect(screen.getByRole("radio", { name: "Start a build" })).toBeChecked();
    expect(
      screen.getByRole("button", { name: "Join the builder list" }),
    ).toBeInTheDocument();
  });
});

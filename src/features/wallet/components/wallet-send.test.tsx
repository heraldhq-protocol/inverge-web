import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

afterEach(cleanup);

import { createPreviewWalletView } from "@/features/wallet/content/preview-wallet";
import { WalletSend } from "@/features/wallet/components/wallet-send";

/**
 * Sending from a preview wallet.
 *
 * The form must do the local work it claims (destination bytes, integer amounts,
 * label-aware balance) and must never turn a valid-looking form into a transfer.
 * Every accepted path ends at the labelled handoff.
 */
const VALID_SOLANA = "11111111111111111111111111111111";
const EVM_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678";

function renderSend() {
  const view = createPreviewWalletView();

  return render(
    <WalletSend
      account={view.account}
      balances={view.balances}
      capabilities={view.capabilities}
    />,
  );
}

function destination() {
  return screen.getByLabelText("Destination address");
}

function amount() {
  return screen.getByLabelText("Amount in USDC");
}

function review() {
  fireEvent.click(screen.getByRole("button", { name: "Review transfer" }));
}

describe("WalletSend destination validation", () => {
  it("says the preview wallet has no address and no signing", () => {
    renderSend();

    expect(screen.getAllByText("None yet").length).toBeGreaterThan(0);
    expect(screen.getByText("Not connected")).toBeInTheDocument();
  });

  it("asks for a destination instead of accepting an empty one", () => {
    renderSend();
    review();

    expect(
      screen.getByText("This transfer cannot be reviewed yet"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Enter the Solana address you want to send to."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Transfer not submitted")).toBeNull();
  });

  it("refuses an EVM address as the wrong network, before any signature", () => {
    renderSend();
    fireEvent.change(destination(), { target: { value: EVM_ADDRESS } });

    expect(
      screen.getByText(/Wrong network: that is an EVM address/),
    ).toBeInTheDocument();

    review();
    expect(screen.getByText(/wrong network/i)).toBeInTheDocument();
    expect(screen.queryByText("Transfer not submitted")).toBeNull();
  });

  it("refuses a non-base58 address and names the character rule", () => {
    renderSend();
    fireEvent.change(destination(), { target: { value: "0OIl0000" } });
    review();

    expect(screen.getByText(/base58 characters only/i)).toBeInTheDocument();
  });

  it("accepts a 32-byte Solana address and still does not send", () => {
    renderSend();
    fireEvent.change(destination(), { target: { value: VALID_SOLANA } });
    fireEvent.change(amount(), { target: { value: "10" } });
    review();

    expect(screen.getByText("Transfer not submitted")).toBeInTheDocument();
    expect(screen.getByText(/signing is not connected/i)).toBeInTheDocument();
    expect(
      screen.getByText(/no signature, no network fee/i),
    ).toBeInTheDocument();
  });
});

describe("WalletSend amount validation", () => {
  it("refuses more fractional digits than the asset has", () => {
    renderSend();
    fireEvent.change(destination(), { target: { value: VALID_SOLANA } });
    fireEvent.change(amount(), { target: { value: "1.1234567" } });
    review();

    expect(
      screen.getByText(
        "Enter a positive amount with at most 6 decimal places.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Transfer not submitted")).toBeNull();
  });

  it("refuses a zero or unreadable amount", () => {
    renderSend();
    fireEvent.change(destination(), { target: { value: VALID_SOLANA } });
    fireEvent.change(amount(), { target: { value: "0" } });
    review();

    expect(screen.getByText(/at most 6 decimal places/)).toBeInTheDocument();
  });

  it("blocks an amount the labelled sample balance cannot cover", () => {
    renderSend();
    fireEvent.change(destination(), { target: { value: VALID_SOLANA } });
    fireEvent.change(amount(), { target: { value: "5000" } });
    review();

    expect(screen.getByText(/short by 3,749.5 USDC/)).toBeInTheDocument();
    expect(screen.getByText("Transfer not submitted")).toBeInTheDocument();
    expect(
      screen.getByText(/sample balance cannot cover this amount/i),
    ).toBeInTheDocument();
  });

  it("fills the maximum and still only reaches the handoff", () => {
    renderSend();
    fireEvent.click(screen.getByRole("button", { name: "Max" }));

    expect(amount()).toHaveValue("1250.5");

    fireEvent.change(destination(), { target: { value: VALID_SOLANA } });
    review();

    expect(screen.getByText("Transfer not submitted")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /explorer/i })).toBeNull();
  });

  it("keeps the sample-balance warning visible while the balance is a sample", () => {
    renderSend();

    expect(
      screen.getByText(/The balance on this screen is a labelled sample/),
    ).toBeInTheDocument();
  });
});

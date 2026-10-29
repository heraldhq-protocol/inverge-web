"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import type { WaitlistLaneId } from "@/features/marketing/content/waitlist";

type WaitlistLaneContextValue = {
  lane: WaitlistLaneId;
  setLane: (lane: WaitlistLaneId) => void;
};

const WaitlistLaneContext = createContext<WaitlistLaneContextValue | null>(
  null,
);

/**
 * Keeps the form's lane switch and the lane summary beside it in one state, so
 * choosing "Start a build" changes both at once. The server page supplies the
 * initial lane from `?lane=`, and remounts this provider when that query
 * changes.
 */
export function WaitlistLaneProvider({
  children,
  initialLane,
}: {
  children: ReactNode;
  initialLane: WaitlistLaneId;
}) {
  const [lane, setLane] = useState<WaitlistLaneId>(initialLane);

  return (
    <WaitlistLaneContext.Provider value={{ lane, setLane }}>
      {children}
    </WaitlistLaneContext.Provider>
  );
}

export function useWaitlistLane() {
  const value = useContext(WaitlistLaneContext);

  if (!value) {
    throw new Error("useWaitlistLane must be used inside WaitlistLaneProvider");
  }

  return value;
}

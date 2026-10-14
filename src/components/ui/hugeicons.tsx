import React from "react";
import {
  HugeiconsIcon,
  type HugeiconsProps as BaseHugeiconsProps,
} from "@hugeicons/react";
import {
  Alert02Icon as RawAlert02Icon,
  ArrowDown01Icon as RawArrowDown01Icon,
  ArrowLeft02Icon as RawArrowLeft02Icon,
  ArrowReloadHorizontalIcon as RawArrowReloadHorizontalIcon,
  ArrowRight02Icon as RawArrowRight02Icon,
  ArrowUp01Icon as RawArrowUp01Icon,
  ArrowUpRight01Icon as RawArrowUpRight01Icon,
  Cancel01Icon as RawCancel01Icon,
  CheckmarkBadge01Icon as RawCheckmarkBadge01Icon,
  CheckmarkCircle02Icon as RawCheckmarkCircle02Icon,
  Clock01Icon as RawClock01Icon,
  Coins01Icon as RawCoins01Icon,
  Compass01Icon as RawCompass01Icon,
  Database01Icon as RawDatabase01Icon,
  FileValidationIcon as RawFileValidationIcon,
  GiftIcon as RawGiftIcon,
  Idea01Icon as RawIdea01Icon,
  InformationCircleIcon as RawInformationCircleIcon,
  Layers01Icon as RawLayers01Icon,
  Menu01Icon as RawMenu01Icon,
  PieChart01Icon as RawPieChart01Icon,
  ReceiptIcon as RawReceiptIcon,
  ReceiptTextIcon as RawReceiptTextIcon,
  RefreshIcon as RawRefreshIcon,
  RotateLeft01Icon as RawRotateLeft01Icon,
  SecurityCheckIcon as RawSecurityCheckIcon,
  Shield01Icon as RawShield01Icon,
  SparklesIcon as RawSparklesIcon,
  Target02Icon as RawTarget02Icon,
  ToolsIcon as RawToolsIcon,
  UserMultiple02Icon as RawUserMultiple02Icon,
} from "@hugeicons/core-free-icons";

// Re-export the core HugeiconsIcon component and all raw icon definitions
export { HugeiconsIcon };
export type HugeiconsProps = BaseHugeiconsProps;
export * from "@hugeicons/core-free-icons";

export interface HugeiconProps extends Omit<BaseHugeiconsProps, "icon"> {
  className?: string;
  size?: number | string;
  color?: string;
  strokeWidth?: number;
}

/**
 * Helper to wrap any Hugeicons SVG descriptor into a standard React component
 */
function createHugeiconComponent(iconData: unknown, displayName: string) {
  const Component = React.forwardRef<SVGSVGElement, HugeiconProps>(
    (
      {
        size = 24,
        color = "currentColor",
        strokeWidth = 1.5,
        className,
        ...props
      },
      ref,
    ) => (
      <HugeiconsIcon
        ref={ref}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        icon={iconData as any}
        size={size}
        color={color}
        strokeWidth={strokeWidth}
        className={className}
        {...props}
      />
    ),
  );
  Component.displayName = displayName;
  return Component;
}

// Pre-configured React icon components for clean, ergonomic JSX usage
export const Menu01Icon = createHugeiconComponent(RawMenu01Icon, "Menu01Icon");
export const Cancel01Icon = createHugeiconComponent(
  RawCancel01Icon,
  "Cancel01Icon",
);
export const Gift01Icon = createHugeiconComponent(RawGiftIcon, "Gift01Icon");
export const GiftIcon = createHugeiconComponent(RawGiftIcon, "GiftIcon");
export const ShieldSecurityIcon = createHugeiconComponent(
  RawShield01Icon,
  "ShieldSecurityIcon",
);
export const Shield01Icon = createHugeiconComponent(
  RawShield01Icon,
  "Shield01Icon",
);
export const SecurityCheckIcon = createHugeiconComponent(
  RawSecurityCheckIcon,
  "SecurityCheckIcon",
);
export const CheckmarkBadge01Icon = createHugeiconComponent(
  RawCheckmarkBadge01Icon,
  "CheckmarkBadge01Icon",
);
export const ReceiptCheckIcon = createHugeiconComponent(
  RawReceiptTextIcon,
  "ReceiptCheckIcon",
);
export const ReceiptIcon = createHugeiconComponent(
  RawReceiptIcon,
  "ReceiptIcon",
);
export const Idea01Icon = createHugeiconComponent(RawIdea01Icon, "Idea01Icon");
export const Layers01Icon = createHugeiconComponent(
  RawLayers01Icon,
  "Layers01Icon",
);
export const FileCheck02Icon = createHugeiconComponent(
  RawFileValidationIcon,
  "FileCheck02Icon",
);
export const FileValidationIcon = createHugeiconComponent(
  RawFileValidationIcon,
  "FileValidationIcon",
);
export const RotateLeft01Icon = createHugeiconComponent(
  RawRotateLeft01Icon,
  "RotateLeft01Icon",
);
export const ArrowReloadHorizontalIcon = createHugeiconComponent(
  RawArrowReloadHorizontalIcon,
  "ArrowReloadHorizontalIcon",
);
export const UserMultiple02Icon = createHugeiconComponent(
  RawUserMultiple02Icon,
  "UserMultiple02Icon",
);
export const Coins01Icon = createHugeiconComponent(
  RawCoins01Icon,
  "Coins01Icon",
);
export const SparklesIcon = createHugeiconComponent(
  RawSparklesIcon,
  "SparklesIcon",
);
export const Target02Icon = createHugeiconComponent(
  RawTarget02Icon,
  "Target02Icon",
);
export const PieChart01Icon = createHugeiconComponent(
  RawPieChart01Icon,
  "PieChart01Icon",
);
export const Clock01Icon = createHugeiconComponent(
  RawClock01Icon,
  "Clock01Icon",
);
export const AlertCircleIcon = createHugeiconComponent(
  RawAlert02Icon,
  "AlertCircleIcon",
);
export const AlertTriangleIcon = createHugeiconComponent(
  RawAlert02Icon,
  "AlertTriangleIcon",
);
export const Alert02Icon = createHugeiconComponent(
  RawAlert02Icon,
  "Alert02Icon",
);
export const InformationCircleIcon = createHugeiconComponent(
  RawInformationCircleIcon,
  "InformationCircleIcon",
);
export const CheckmarkCircle02Icon = createHugeiconComponent(
  RawCheckmarkCircle02Icon,
  "CheckmarkCircle02Icon",
);
export const ArrowRight02Icon = createHugeiconComponent(
  RawArrowRight02Icon,
  "ArrowRight02Icon",
);
export const ArrowLeft02Icon = createHugeiconComponent(
  RawArrowLeft02Icon,
  "ArrowLeft02Icon",
);
export const ArrowDown01Icon = createHugeiconComponent(
  RawArrowDown01Icon,
  "ArrowDown01Icon",
);
export const ArrowUp01Icon = createHugeiconComponent(
  RawArrowUp01Icon,
  "ArrowUp01Icon",
);
export const ArrowUpRight01Icon = createHugeiconComponent(
  RawArrowUpRight01Icon,
  "ArrowUpRight01Icon",
);
export const Compass01Icon = createHugeiconComponent(
  RawCompass01Icon,
  "Compass01Icon",
);
export const ToolsIcon = createHugeiconComponent(RawToolsIcon, "ToolsIcon");
export const Database01Icon = createHugeiconComponent(
  RawDatabase01Icon,
  "Database01Icon",
);
export const Refresh01Icon = createHugeiconComponent(
  RawRefreshIcon,
  "Refresh01Icon",
);
export const RefreshIcon = createHugeiconComponent(
  RawRefreshIcon,
  "RefreshIcon",
);

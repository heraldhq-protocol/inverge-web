import Image from "next/image";

const sizeClasses = {
  20: "size-5 text-[9px]",
  32: "size-8 text-xs",
  40: "size-10 text-sm",
  44: "size-11 text-sm",
  64: "size-16 text-xl",
} as const;

export type AvatarSize = keyof typeof sizeClasses;

/** "Ada Lovelace" -> "AL". Falls back to a neutral glyph rather than a blank. */
function initialsFor(name: string | null | undefined): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  const first = words.at(0)?.[0] ?? "";
  const last = words.length > 1 ? (words.at(-1)?.[0] ?? "") : "";

  return `${first}${last}`.toUpperCase() || "?";
}

/**
 * Identity mark. Falls back to initials on the brand tint — never a stock
 * placeholder face.
 *
 * `src` is optional: the API may supply an allowlisted provider avatar, and an
 * unset or rejected URL deliberately renders the initials instead.
 */
export function Avatar({
  name,
  src,
  size = 32,
  className = "",
}: {
  name: string | null | undefined;
  src?: string | null;
  size?: AvatarSize;
  className?: string;
}) {
  const shared = `relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${sizeClasses[size]} ${className}`;

  if (src) {
    return (
      <span className={shared}>
        <Image
          src={src}
          alt={name ? `${name}'s profile picture` : "Profile picture"}
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      </span>
    );
  }

  return (
    <span
      className={`${shared} bg-brand/10 font-semibold text-brand-strong`}
      // The name is rendered as text beside every avatar we draw, so the mark
      // itself is decorative and announcing the initials again would be noise.
      aria-hidden="true"
    >
      {initialsFor(name)}
    </span>
  );
}

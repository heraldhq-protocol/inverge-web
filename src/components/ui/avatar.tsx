import Image from 'next/image';
import { cn } from '@/lib/utils';
import { initials } from '@/lib/format';

const SIZES = {
  20: 'h-5 w-5 text-[9px]',
  32: 'h-8 w-8 text-xs',
  40: 'h-10 w-10 text-sm',
  44: 'h-11 w-11 text-sm',
} as const;

export type AvatarSize = keyof typeof SIZES;

/**
 * Identity mark. Falls back to initials on the accent tint — never a stock placeholder face
 * (conventions §1.5).
 *
 * `src` is optional because no creator avatar exists in the API yet (see the API gap backlog,
 * item 1). Every call site passes what it has; when the field lands, nothing here changes.
 */
export function Avatar({
  name,
  src,
  size = 32,
  className,
}: {
  name: string | null | undefined;
  src?: string | null;
  size?: AvatarSize;
  className?: string;
}) {
  const shared = cn(
    'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
    SIZES[size],
    className
  );

  if (src) {
    return (
      <span className={shared}>
        <Image
          src={src}
          alt={name ? `${name}'s profile picture` : 'Profile picture'}
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      </span>
    );
  }

  return (
    <span
      className={cn(shared, 'bg-accent-100 font-semibold text-accent-900')}
      // The name is already rendered as text beside every avatar we draw, so the mark itself is
      // decorative and announcing the initials again would be noise.
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

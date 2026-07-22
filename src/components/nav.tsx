import Link from 'next/link';
import { LoginButton } from '@/components/auth/login-button';

export function Nav() {
  return (
    <header className="border-b border-foreground/10">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        <Link href="/" className="font-semibold tracking-tight">
          Inverge
        </Link>
        <div className="flex items-center gap-5 text-sm">
          <Link href="/ideas" className="text-foreground/70 hover:text-foreground">
            Ideas
          </Link>
          <LoginButton />
        </div>
      </nav>
    </header>
  );
}

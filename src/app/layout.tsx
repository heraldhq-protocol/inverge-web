import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Providers } from '@/components/providers/providers';
import { Nav } from '@/components/nav';

export const metadata: Metadata = {
  title: 'Inverge — back African builders, get your money back if they don’t deliver',
  description:
    'Milestone-escrowed crowdfunding and idea validation on Solana. Backers cannot get rugged.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <Nav />
          <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}

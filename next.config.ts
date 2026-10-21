import type { NextConfig } from "next";

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/home", destination: "/d", permanent: true },
      // One page owns provider sign-in (D-034). The old routes stay as
      // permanent redirects so existing links and bookmarks keep working; Next
      // carries the request's query string, so `?next=` survives the hop.
      { source: "/sign-in", destination: "/auth", permanent: true },
      { source: "/sign-up", destination: "/auth", permanent: true },
      { source: "/verify-email", destination: "/auth", permanent: true },
      // Public idea surfaces live at `/ideas` (D-014) and the creator's own
      // under `/d/creator/ideas` (D-017), so `/ideas` must never be redirected
      // into the dashboard namespace - config redirects are matched before the
      // filesystem and would shadow the public pages.
      { source: "/discover", destination: "/ideas", permanent: true },
      // Creator Studio owns every creator route (D-017). The old `/d/ideas`
      // tree was live long enough to be bookmarked, so each path 308s to its
      // new home: creation moves under `/d/creator/ideas`, the analytics home
      // becomes `/d/creator/analytics`, and everything else follows the idea
      // tree. Exact sources are listed before the catch-all.
      {
        source: "/d/ideas/new",
        destination: "/d/creator/ideas/new",
        permanent: true,
      },
      {
        source: "/d/ideas/insights",
        destination: "/d/creator/analytics",
        permanent: true,
      },
      { source: "/d/ideas", destination: "/d/creator/ideas", permanent: true },
      {
        source: "/d/ideas/:path*",
        destination: "/d/creator/ideas/:path*",
        permanent: true,
      },
      {
        source: "/pre-pledges/:path*",
        destination: "/d/pre-pledges/:path*",
        permanent: true,
      },
      {
        source: "/notifications/:path*",
        destination: "/d/notifications/:path*",
        permanent: true,
      },
      {
        source: "/profile/:path*",
        destination: "/d/profile/:path*",
        permanent: true,
      },
      {
        source: "/settings/:path*",
        destination: "/d/settings/:path*",
        permanent: true,
      },
    ];
  },
};

export default config;

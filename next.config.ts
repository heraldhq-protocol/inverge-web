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
      // Public idea surfaces live at `/ideas` and the dashboard's own at
      // `/d/ideas` (D-014), so `/ideas` must never be redirected into the
      // dashboard namespace — config redirects are matched before the
      // filesystem and would shadow the public pages.
      { source: "/discover", destination: "/ideas", permanent: true },
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

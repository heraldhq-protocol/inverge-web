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
      {
        source: "/ideas/:path*",
        destination: "/d/ideas/:path*",
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

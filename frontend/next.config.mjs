// When set, /api is proxied through this site so the auth cookie stays first-party.
const backendUrl = process.env.BACKEND_URL?.replace(/\/+$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(backendUrl && {
    env: { NEXT_PUBLIC_API_URL: "" },
    async rewrites() {
      return [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }];
    },
  }),
  agentRules: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

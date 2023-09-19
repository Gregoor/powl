/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/.well-known/oembed.json",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
    ];
  },
  experimental: { typedRoutes: true },
};

module.exports = nextConfig;

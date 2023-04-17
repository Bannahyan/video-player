/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'fullscreen=(self)',
          },
        ],
        source: '/:path*',
      },
    ];
  },
};

module.exports = nextConfig;

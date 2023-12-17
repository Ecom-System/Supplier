/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/api/:path*', // Match any API route
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // Change this to the specific origins you want to allow
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

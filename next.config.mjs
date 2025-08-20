/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com;
              style-src 'self' 'unsafe-inline' https://accounts.google.com;
              img-src 'self' data: https: http:;
              font-src 'self' data: https:;
              connect-src 'self' https://accounts.google.com https://www.googleapis.com;
              frame-src 'self' https://accounts.google.com;
            `.replace(/\s{2,}/g, ' ').trim()
          }
        ]
      }
    ]
  }
}

export default nextConfig

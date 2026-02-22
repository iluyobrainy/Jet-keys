/** @type {import('next').NextConfig} */
const nextConfig = {
  // App router is available by default in Next.js 13+
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dtaspdqcyapnfgcsbtte.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

module.exports = nextConfig

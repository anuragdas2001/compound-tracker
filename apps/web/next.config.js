/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['http://localhost:3000'],
  transpilePackages: ['@repo/query', '@repo/ui', '@repo/store', '@repo/services', '@repo/types', '@repo/api'],
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://172.20.10.13:3000',
    'http://172.20.10.13:3002',
    'http://172.20.10.13'
  ],
};

export default nextConfig;

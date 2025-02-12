import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jvid673xtjribu4z.public.blob.vercel-storage.com",
        port: "",
        search: "",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        search: "",
      },
      {
        protocol: "http",
        hostname: "res.cloudinary.com",
        port: "",
        search: "",
      },
    ],
  },
};

export default nextConfig;

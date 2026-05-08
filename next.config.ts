import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    unoptimized: process.env.NODE_ENV === "development",
    qualities: [75, 90],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
}

export default nextConfig

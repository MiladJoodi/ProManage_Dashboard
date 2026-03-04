import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  // تنظیمات جدید برای host
  devServer: {
    host: '0.0.0.0', // به این ترتیب سرور برای دسترسی از شبکه محلی باز میشه
  },
};

export default nextConfig;
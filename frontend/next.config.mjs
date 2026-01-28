/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Проксируем бековые роуты как есть
      { source: "/auth/:path*", destination: "http://192.168.1.40:8000/auth/:path*" },
      { source: "/api/:path*", destination: "http://192.168.1.40:8000/api/:path*" },
    ];
  },

  // чтобы убрать dev-warning (не влияет на API, просто шум) [web:82]
  allowedDevOrigins: ["http://192.168.1.40:3000", "http://localhost:3000"],
};

export default nextConfig;

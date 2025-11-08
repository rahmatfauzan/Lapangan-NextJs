/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: true,
  
  images: {
    remotePatterns: [
      // Konfigurasi untuk backend Laravel (sudah benar)
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**", 
      },
      
      // --- TAMBAHKAN KONFIGURASI BARU INI ---
      {
        protocol: 'https',
        hostname: 'th.bing.com', // Cukup hostname utama
        // Tidak perlu port atau pathname jika bing.com melayani banyak path
      },
      // --------------------------------------
    ],
  },
};

export default nextConfig;
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

 const { login } = useAuth();
  // const router = useRouter(); // <-- Hapus

  // --- 👇 PERBAIKI FUNGSI INI ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e :React.FormEvent) => {
    e.preventDefault();
    handleSubmit(e);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            Go<span className="text-orange-500">Mabar</span>
          </h1>
          <p className="text-gray-600">Selamat datang kembali!</p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header Gradient */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
            <h2 className="text-2xl font-bold mb-1">Login GoMabar</h2>
            <p className="text-sm opacity-90">Masukkan kredensial Anda untuk melanjutkan</p>
          </div>

          {/* Form */}
          <div className="p-6 space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={20} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@gomabar.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFormSubmit(e)}
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <a href="#" className="text-sm text-orange-500 hover:text-orange-600 font-semibold">
                  Lupa password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFormSubmit(e)}
                  disabled={isLoading}
                  className="w-full pl-12 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800">Login Gagal</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Remember Me & Terms */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="remember" className="text-sm text-gray-600">
                Ingat saya
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              type="button"
              onClick={handleFormSubmit}
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 size={20} />
                  </motion.div>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight size={20} />
                </>
              )}
            </motion.button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">atau login dengan</span>
              </div>
            </div>

            {/* Google Login Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
            >
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path
                  fill="#4285F4"
                  d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"
                />
                <path
                  fill="#34A853"
                  d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"
                />
                <path
                  fill="#EA4335"
                  d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"
                />
              </svg>
              <span>Login dengan Google</span>
            </motion.button>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 text-center">
            <p className="text-sm text-gray-600">
              Belum punya akun?{' '}
              <a href="#" className="text-orange-500 hover:text-orange-600 font-semibold">
                Daftar sekarang
              </a>
            </p>
          </div>
        </motion.div>

        {/* Bottom Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-sm text-gray-500 mt-6"
        >
          © 2025 GoMabar. All rights reserved.
        </motion.p>
      </div>
    </div>
  );
};

export default LoginForm;
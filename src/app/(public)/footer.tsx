import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  ChevronRight,
  Heart
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const productLinks = [
    { name: 'Lapangan Basketball', href: '#basketball' },
    { name: 'Lapangan Futsal', href: '#futsal' },
    { name: 'Lapangan Badminton', href: '#badminton' },
    { name: 'Lapangan Volley', href: '#volley' }
  ];

  const companyLinks = [
    { name: 'Tentang Kami', href: '#about' },
    { name: 'Cara Booking', href: '#how-to' },
    { name: 'Syarat & Ketentuan', href: '#terms' },
    { name: 'Kebijakan Privasi', href: '#privacy' }
  ];

  const supportLinks = [
    { name: 'Pusat Bantuan', href: '#help' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Hubungi Kami', href: '#contact' },
    { name: 'Pembatalan Booking', href: '#cancellation' }
  ];

  const socialMedia = [
    { icon: Facebook, href: '#', color: 'hover:text-blue-500', bgColor: 'hover:bg-blue-50' },
    { icon: Instagram, href: '#', color: 'hover:text-pink-500', bgColor: 'hover:bg-pink-50' },
    { icon: Twitter, href: '#', color: 'hover:text-sky-500', bgColor: 'hover:bg-sky-50' },
    { icon: Youtube, href: '#', color: 'hover:text-red-500', bgColor: 'hover:bg-red-50' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {/* Company Info */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-white mb-2">
                Go<span className="text-orange-500">Mabar</span>
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Platform booking lapangan olahraga terpercaya di Indonesia. Mabar jadi lebih mudah dan menyenangkan!
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-orange-500 flex-shrink-0 mt-1" />
                <p className="text-sm">
                  Jl. Sudirman No. 123<br />
                  Payakumbuh, Sumatera Barat
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-orange-500 flex-shrink-0" />
                <a href="tel:+628123456789" className="text-sm hover:text-orange-500 transition-colors">
                  +62 812-3456-7890
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-orange-500 flex-shrink-0" />
                <a href="mailto:info@gomabar.com" className="text-sm hover:text-orange-500 transition-colors">
                  info@gomabar.com
                </a>
              </div>
            </div>
          </motion.div>

          {/* Product Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-white font-bold text-lg mb-4">Produk</h4>
            <ul className="space-y-3">
              {productLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-sm hover:text-orange-500 transition-colors flex items-center gap-2 group"
                  >
                    <ChevronRight size={16} className="text-gray-600 group-hover:text-orange-500 transition-colors" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-white font-bold text-lg mb-4">Perusahaan</h4>
            <ul className="space-y-3">
              {companyLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-sm hover:text-orange-500 transition-colors flex items-center gap-2 group"
                  >
                    <ChevronRight size={16} className="text-gray-600 group-hover:text-orange-500 transition-colors" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-white font-bold text-lg mb-4">Bantuan</h4>
            <ul className="space-y-3 mb-6">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-sm hover:text-orange-500 transition-colors flex items-center gap-2 group"
                  >
                    <ChevronRight size={16} className="text-gray-600 group-hover:text-orange-500 transition-colors" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>

            {/* Social Media */}
            <div>
              <h5 className="text-white font-semibold text-sm mb-3">Ikuti Kami</h5>
              <div className="flex gap-2">
                {socialMedia.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={index}
                      href={social.href}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center transition-all ${social.color} ${social.bgColor}`}
                    >
                      <Icon size={20} />
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Newsletter Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="border-t border-gray-800"
      >
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-white font-bold text-lg mb-1">
                Dapatkan Update Terbaru
              </h4>
              <p className="text-gray-400 text-sm">
                Berlangganan newsletter untuk promo dan info menarik
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Masukkan email Anda"
                className="flex-1 md:w-64 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-orange-500 focus:outline-none text-sm"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <p className="flex items-center gap-1">
              © {currentYear} GoMabar. Made with 
              <Heart size={16} className="text-red-500 fill-red-500 mx-1" />
              in Indonesia
            </p>
            <div className="flex items-center gap-6">
              <a href="#terms" className="hover:text-orange-500 transition-colors">
                Syarat & Ketentuan
              </a>
              <span className="text-gray-600">|</span>
              <a href="#privacy" className="hover:text-orange-500 transition-colors">
                Privacy Policy
              </a>
              <span className="text-gray-600">|</span>
              <a href="#sitemap" className="hover:text-orange-500 transition-colors">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Phone, Mail, Navigation } from 'lucide-react';

const LocationSection = () => {
  const location = {
    name: 'GoMabar Payakumbuh',
    address: 'Jl. Sudirman No. 123, Payakumbuh',
    city: 'Payakumbuh, Sumatera Barat',
    phone: '+62 812-3456-7890',
    email: 'payakumbuh@gomabar.com',
    openHours: '06:00 - 22:00',
    openDays: 'Senin - Minggu',
    coordinates: {
      lat: -0.2166,
      lng: 100.6333
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
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
    <section className="py-10 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Lokasi <span className="text-orange-500">Kami</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Temukan kami dan mulai bermain di lapangan terbaik
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8"
        >
          {/* Map Card */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
          >
            <div className="relative h-full min-h-[400px] bg-gray-100">
              {/* Placeholder for Google Maps */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={64} className="text-orange-500 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold">Google Maps</p>
                  <p className="text-gray-400 text-sm">Integrate dengan Google Maps API</p>
                </div>
              </div>
              
              {/* Location Badge */}
              <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-xl shadow-lg">
                <div className="flex items-center gap-2">
                  <MapPin size={20} className="text-orange-500" />
                  <div>
                    <p className="font-semibold text-sm">Payakumbuh</p>
                    <p className="text-xs text-gray-500">Sumatera Barat</p>
                  </div>
                </div>
              </div>

              {/* Direction Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute bottom-4 right-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl shadow-lg font-semibold flex items-center gap-2 transition-all"
              >
                <Navigation size={20} />
                Petunjuk Arah
              </motion.button>
            </div>
          </motion.div>

          {/* Info Card */}
          <motion.div 
            variants={itemVariants}
            className="space-y-6"
          >
            {/* Main Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">
                {location.name}
              </h3>

              {/* Address */}
              <div className="flex gap-4 mb-5 pb-5 border-b border-gray-100">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                    <MapPin className="text-orange-500" size={24} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Alamat</p>
                  <p className="font-semibold text-gray-800">{location.address}</p>
                  <p className="text-sm text-gray-600">{location.city}</p>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="flex gap-4 mb-5 pb-5 border-b border-gray-100">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Clock className="text-blue-500" size={24} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Jam Operasional</p>
                  <p className="font-semibold text-gray-800">{location.openHours}</p>
                  <p className="text-sm text-gray-600">{location.openDays}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4 mb-5 pb-5 border-b border-gray-100">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                    <Phone className="text-green-500" size={24} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Telepon</p>
                  <a 
                    href={`tel:${location.phone}`}
                    className="font-semibold text-gray-800 hover:text-orange-500 transition-colors"
                  >
                    {location.phone}
                  </a>
                  <p className="text-sm text-gray-600">Hubungi kami untuk info lebih lanjut</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                    <Mail className="text-purple-500" size={24} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <a 
                    href={`mailto:${location.email}`}
                    className="font-semibold text-gray-800 hover:text-orange-500 transition-colors"
                  >
                    {location.email}
                  </a>
                  <p className="text-sm text-gray-600">Kirim pesan ke kami</p>
                </div>
              </div>
            </div>

            {/* Quick Contact Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <motion.a
                href={`tel:${location.phone}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-xl font-semibold text-center transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Phone size={20} />
                Telepon
              </motion.a>
              <motion.a
                href={`mailto:${location.email}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 rounded-xl font-semibold text-center transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Mail size={20} />
                Email
              </motion.a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default LocationSection;
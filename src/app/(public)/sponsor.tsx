import React from "react";
import { motion } from "framer-motion";

const SponsorSection = () => {
  const sponsors = [
    {
      name: "Nike",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
      category: "Sports Brand",
    },
    {
      name: "Adidas",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
      category: "Sports Brand",
    },
    {
      name: "Puma",
      logo: "https://logosmarken.com/wp-content/uploads/2021/12/Logo-Yonex.png",
      category: "Sports Brand",
    },
    {
      name: "Under Armour",
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Under_armour_logo.svg",
      category: "Sports Brand",
    },
    {
      name: "New Balance",
      logo: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhkE45VaxN-IQw7Kb0-lyd3qPHVKUcuTuH8wMAFPmCBszxUGNyOlX-16_xd9WbTqB49cjqrH8MQkv3JPHxtS0BsZph5WTm0Qwf7Wt4hT1kF9zxF1aI6v9rld1UOoFmCEfq7J7VBWxwfyPZgIUlle24kHPPrgiVHfO4IG7qWMVS0Ppm8Rj3ht9hg1QyO/s320/GKL5_Puma%20-%20Koleksilogo.com.jpg",
      category: "Sports Brand",
    },
    {
      name: "Reebok",
      logo: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjj7Nr9On7u5JO9eS75zDgrvV1OCSqVgRUHONkXLSv_jm9ZZdR36RVDzY3CpDSPiQsh1K_fUWcFt16MYpPQuk0nwpwOPR-yGJzygtX9rhJnRbzA8sKYCe9OZbHoFVBqiLpIIcwU4op38hf8JS7XYLY4sOYE15aGR4h-lit5giOV6uDTsLI1xqPKKWWP/s320/GKL27_ortuseight%20-%20Koleksilogo.com.jpg",
      category: "Sports Brand",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="py-16 px-4 bg-white">
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
            Dipercaya oleh{" "}
            <span className="text-orange-500">Brand Terkemuka</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Partner resmi kami dalam menyediakan peralatan olahraga terbaik
          </p>
        </motion.div>

        {/* Sponsors Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8"
        >
          {sponsors.map((sponsor, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                y: -5,
                transition: { duration: 0.2 },
              }}
              className="bg-white rounded-xl p-6 flex items-center justify-center border-2 border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="relative w-full h-16 flex items-center justify-center">
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            {
              number: "500+",
              label: "Lapangan",
              color: "from-orange-500 to-red-500",
            },
            {
              number: "10K+",
              label: "Pengguna",
              color: "from-blue-500 to-cyan-500",
            },
            {
              number: "50K+",
              label: "Booking",
              color: "from-purple-500 to-pink-500",
            },
            {
              number: "1000+",
              label: "Review Positif",
              color: "from-green-500 to-emerald-500",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div
                className={`inline-block bg-gradient-to-r ${stat.color} text-white rounded-2xl px-6 py-4 mb-2`}
              >
                <motion.p
                  className="text-3xl md:text-4xl font-bold"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                >
                  {stat.number}
                </motion.p>
              </div>
              <p className="text-gray-600 font-semibold">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-32 translate-y-32"></div>
          </div>

          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ingin Menjadi Partner Kami?
            </h3>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Bergabunglah dengan brand-brand terkemuka lainnya dan tingkatkan
              visibilitas bisnis Anda
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-orange-500 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all"
            >
              Hubungi Kami Sekarang
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SponsorSection;

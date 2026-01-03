import React from "react";
import { motion } from "motion/react";
import { Star, BadgeCheck, ShoppingBag, TrendingUp } from "lucide-react";

interface Seller {
  name: string;
  avatar: string;
  specialty: string;
  rating: number;
  reviews: number;
  projectsSold: number;
  earnings: string;
  badge: "top" | "rising" | "verified";
  tags: string[];
}

const topSellers: Seller[] = [
  {
    name: "Aditya Verma",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    specialty: "Full Stack Developer",
    rating: 4.9,
    reviews: 234,
    projectsSold: 89,
    earnings: "₹4.2L",
    badge: "top",
    tags: ["React", "Node.js", "MongoDB"],
  },
  {
    name: "Priya Sharma",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    specialty: "UI/UX Designer",
    rating: 5.0,
    reviews: 189,
    projectsSold: 67,
    earnings: "₹3.1L",
    badge: "top",
    tags: ["Figma", "UI Kit", "Mobile"],
  },
  {
    name: "Rohit Kumar",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    specialty: "ML Engineer",
    rating: 4.8,
    reviews: 156,
    projectsSold: 54,
    earnings: "₹2.8L",
    badge: "verified",
    tags: ["Python", "TensorFlow", "AI"],
  },
  {
    name: "Sneha Patel",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    specialty: "Mobile Developer",
    rating: 4.9,
    reviews: 142,
    projectsSold: 48,
    earnings: "₹2.4L",
    badge: "rising",
    tags: ["Flutter", "React Native", "iOS"],
  },
  {
    name: "Arjun Reddy",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    specialty: "Backend Developer",
    rating: 4.7,
    reviews: 128,
    projectsSold: 42,
    earnings: "₹2.1L",
    badge: "verified",
    tags: ["Java", "Spring", "AWS"],
  },
  {
    name: "Kavya Nair",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    specialty: "Data Scientist",
    rating: 4.8,
    reviews: 98,
    projectsSold: 36,
    earnings: "₹1.8L",
    badge: "rising",
    tags: ["Python", "Pandas", "ML"],
  },
];

const BadgeIcon: React.FC<{ type: "top" | "rising" | "verified" }> = ({ type }) => {
  switch (type) {
    case "top":
      return (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
          <Star className="w-3 h-3 fill-current" />
          TOP
        </div>
      );
    case "rising":
      return (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
          <TrendingUp className="w-3 h-3" />
          RISING
        </div>
      );
    case "verified":
      return (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
          <BadgeCheck className="w-3 h-3" />
          PRO
        </div>
      );
  }
};

const SellerCard: React.FC<{ seller: Seller; index: number }> = ({ seller, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <div className="relative p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1025]/90 to-[#2d1f47]/60 backdrop-blur-sm hover:border-orange-500/30 transition-all duration-500 overflow-hidden">
        {/* Background glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Badge */}
        <div className="relative">
          <BadgeIcon type={seller.badge} />
          
          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <img
                src={seller.avatar}
                alt={seller.name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-white/10 group-hover:ring-orange-500/30 transition-all duration-300"
              />
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-3 border-[#1a1025] flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>
          </div>
          
          {/* Info */}
          <div className="text-center relative z-10">
            <h3 className="text-lg font-semibold text-white group-hover:text-orange-300 transition-colors">
              {seller.name}
            </h3>
            <p className="text-white/50 text-sm mb-3">{seller.specialty}</p>
            
            {/* Rating */}
            <div className="flex items-center justify-center gap-1 mb-4">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-white font-semibold">{seller.rating}</span>
              <span className="text-white/40 text-sm">({seller.reviews} reviews)</span>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {seller.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-white/5 text-white/70 text-xs rounded-full border border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            {/* Stats */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="text-center">
                <div className="flex items-center gap-1 text-white font-semibold">
                  <ShoppingBag className="w-3.5 h-3.5 text-orange-400" />
                  {seller.projectsSold}
                </div>
                <div className="text-white/40 text-xs">Sold</div>
              </div>
              <div className="text-center">
                <div className="text-white font-semibold text-green-400">
                  {seller.earnings}
                </div>
                <div className="text-white/40 text-xs">Earned</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* View Profile Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
        >
          View Profile
        </motion.button>
      </div>
    </motion.div>
  );
};

const TopSellers: React.FC = () => {
  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-[#1a1025] to-[#0f0a15]">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/3 top-0 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[200px]" />
        <div className="absolute right-0 bottom-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 text-orange-400 py-1.5 px-5 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4 fill-current" />
            Top Rated Sellers
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="text-white">Meet Our </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
              Star Creators
            </span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Learn from the best. These top-rated sellers have earned the trust of hundreds of buyers 
            with their exceptional projects and support.
          </p>
        </motion.div>

        {/* Sellers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {topSellers.map((seller, index) => (
            <SellerCard key={seller.name} seller={seller} index={index} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4">
            <button className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-full transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40">
              Become a Seller
            </button>
            <button className="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium rounded-full transition-all duration-300">
              View All Sellers
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TopSellers;

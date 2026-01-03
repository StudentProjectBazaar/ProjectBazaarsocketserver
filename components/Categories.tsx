import React from "react";
import { motion } from "motion/react";
import { 
  Code2, 
  Smartphone, 
  Palette, 
  Database, 
  Brain, 
  Gamepad2, 
  Cloud, 
  Shield,
  TrendingUp
} from "lucide-react";

interface Category {
  name: string;
  icon: React.ReactNode;
  projectCount: number;
  color: string;
  gradient: string;
}

const categories: Category[] = [
  {
    name: "Web Development",
    icon: <Code2 className="w-7 h-7" />,
    projectCount: 2840,
    color: "text-blue-400",
    gradient: "from-blue-500/20 to-blue-600/10",
  },
  {
    name: "Mobile Apps",
    icon: <Smartphone className="w-7 h-7" />,
    projectCount: 1650,
    color: "text-green-400",
    gradient: "from-green-500/20 to-green-600/10",
  },
  {
    name: "UI/UX Design",
    icon: <Palette className="w-7 h-7" />,
    projectCount: 1420,
    color: "text-pink-400",
    gradient: "from-pink-500/20 to-pink-600/10",
  },
  {
    name: "Data Science",
    icon: <Database className="w-7 h-7" />,
    projectCount: 980,
    color: "text-purple-400",
    gradient: "from-purple-500/20 to-purple-600/10",
  },
  {
    name: "Machine Learning",
    icon: <Brain className="w-7 h-7" />,
    projectCount: 1120,
    color: "text-orange-400",
    gradient: "from-orange-500/20 to-orange-600/10",
  },
  {
    name: "Game Development",
    icon: <Gamepad2 className="w-7 h-7" />,
    projectCount: 720,
    color: "text-red-400",
    gradient: "from-red-500/20 to-red-600/10",
  },
  {
    name: "Cloud & DevOps",
    icon: <Cloud className="w-7 h-7" />,
    projectCount: 540,
    color: "text-cyan-400",
    gradient: "from-cyan-500/20 to-cyan-600/10",
  },
  {
    name: "Cybersecurity",
    icon: <Shield className="w-7 h-7" />,
    projectCount: 380,
    color: "text-yellow-400",
    gradient: "from-yellow-500/20 to-yellow-600/10",
  },
];

const CategoryCard: React.FC<{ category: Category; index: number }> = ({ category, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="group cursor-pointer"
    >
      <div className={`relative p-6 rounded-2xl border border-white/10 bg-gradient-to-br ${category.gradient} backdrop-blur-sm hover:border-white/20 transition-all duration-300`}>
        {/* Glow effect on hover */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`} />
        
        <div className="relative z-10">
          {/* Icon */}
          <div className={`inline-flex p-3 rounded-xl bg-white/5 ${category.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
            {category.icon}
          </div>
          
          {/* Content */}
          <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-orange-300 transition-colors">
            {category.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-sm">{category.projectCount.toLocaleString()} projects</span>
            <TrendingUp className="w-3 h-3 text-green-400" />
          </div>
        </div>
        
        {/* Arrow indicator */}
        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

const Categories: React.FC = () => {
  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-[#0f0a15] to-[#1a1025]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-20 top-1/3 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px]" />
        <div className="absolute -left-20 bottom-0 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[120px]" />
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
          <div className="inline-flex items-center gap-2 border border-purple-500/30 bg-purple-500/10 text-purple-400 py-1.5 px-5 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            Browse Categories
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="text-white">Explore </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-400">
              10,000+ Projects
            </span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Find the perfect project for your needs across our diverse categories. 
            From web apps to AI models, we've got you covered.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {categories.map((category, index) => (
            <CategoryCard key={category.name} category={category} index={index} />
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/30 text-white font-medium rounded-full transition-all duration-300 group">
            View All Categories
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Categories;

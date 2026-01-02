import React from "react";
import { motion } from "motion/react";
import { 
  Globe, 
  Smartphone, 
  Brain, 
  Palette, 
  Server, 
  FileText,
  Sparkles,
  ArrowRight
} from "lucide-react";

interface ProjectType {
  icon: React.ReactNode;
  title: string;
  description: string;
  examples: string[];
  avgPrice: string;
  color: string;
  gradient: string;
}

const projectTypes: ProjectType[] = [
  {
    icon: <Globe className="w-7 h-7" />,
    title: "Web Apps & Templates",
    description: "Full-stack applications, landing pages, dashboards, and website templates.",
    examples: ["E-commerce stores", "Admin panels", "SaaS boilerplates"],
    avgPrice: "₹500 - ₹5,000",
    color: "text-blue-400",
    gradient: "from-blue-500/20 to-cyan-500/10",
  },
  {
    icon: <Smartphone className="w-7 h-7" />,
    title: "Mobile Apps",
    description: "iOS, Android, and cross-platform mobile applications with source code.",
    examples: ["Flutter apps", "React Native", "Native Swift/Kotlin"],
    avgPrice: "₹1,000 - ₹8,000",
    color: "text-green-400",
    gradient: "from-green-500/20 to-emerald-500/10",
  },
  {
    icon: <Brain className="w-7 h-7" />,
    title: "ML/AI Models",
    description: "Machine learning models, datasets, notebooks, and AI-powered tools.",
    examples: ["Prediction models", "NLP tools", "Computer vision"],
    avgPrice: "₹800 - ₹10,000",
    color: "text-purple-400",
    gradient: "from-purple-500/20 to-violet-500/10",
  },
  {
    icon: <Palette className="w-7 h-7" />,
    title: "UI Kits & Designs",
    description: "Figma files, design systems, icon packs, and UI component libraries.",
    examples: ["App UI kits", "Design systems", "Icon packs"],
    avgPrice: "₹300 - ₹3,000",
    color: "text-pink-400",
    gradient: "from-pink-500/20 to-rose-500/10",
  },
  {
    icon: <Server className="w-7 h-7" />,
    title: "APIs & Backends",
    description: "REST APIs, GraphQL backends, microservices, and server solutions.",
    examples: ["Payment integrations", "Auth systems", "Database schemas"],
    avgPrice: "₹600 - ₹6,000",
    color: "text-orange-400",
    gradient: "from-orange-500/20 to-amber-500/10",
  },
  {
    icon: <FileText className="w-7 h-7" />,
    title: "Documentation & Tutorials",
    description: "Technical documentation, course materials, and step-by-step guides.",
    examples: ["Project reports", "Video courses", "eBooks"],
    avgPrice: "₹200 - ₹2,000",
    color: "text-cyan-400",
    gradient: "from-cyan-500/20 to-teal-500/10",
  },
];

const ProjectTypeCard: React.FC<{ projectType: ProjectType; index: number }> = ({ projectType, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="group cursor-pointer"
    >
      <div className={`relative h-full p-6 rounded-2xl border border-white/10 bg-gradient-to-br ${projectType.gradient} backdrop-blur-sm hover:border-white/20 transition-all duration-300`}>
        {/* Price badge */}
        <div className="absolute top-4 right-4 px-3 py-1 bg-white/10 text-white/70 text-xs font-medium rounded-full">
          {projectType.avgPrice}
        </div>
        
        {/* Icon */}
        <div className={`inline-flex p-3 rounded-xl bg-white/5 ${projectType.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
          {projectType.icon}
        </div>
        
        {/* Content */}
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-orange-300 transition-colors">
          {projectType.title}
        </h3>
        <p className="text-white/50 text-sm leading-relaxed mb-4">
          {projectType.description}
        </p>
        
        {/* Examples */}
        <div className="flex flex-wrap gap-2">
          {projectType.examples.map((example) => (
            <span
              key={example}
              className="px-2.5 py-1 bg-white/5 text-white/60 text-xs rounded-full border border-white/10"
            >
              {example}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const WhatCanYouSell: React.FC = () => {
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-[#1a1025] to-[#0f0a15]">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-20 top-1/3 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[180px]" />
        <div className="absolute right-1/4 bottom-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[200px]" />
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
            <Sparkles className="w-4 h-4" />
            What You Can Sell
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="text-white">Turn </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Any Project
            </span>
            <span className="text-white"> Into Income</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            From college assignments to professional work - if you've built it, you can sell it. 
            Here's what's popular on our platform.
          </p>
        </motion.div>

        {/* Project Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto mb-14">
          {projectTypes.map((projectType, index) => (
            <ProjectTypeCard key={projectType.title} projectType={projectType} index={index} />
          ))}
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-white/10 max-w-2xl">
            <div className="text-left">
              <h4 className="text-white font-semibold mb-1">Not sure if your project qualifies?</h4>
              <p className="text-white/50 text-sm">We accept almost everything! Upload and our team will review it within 24 hours.</p>
            </div>
            <button className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-full transition-all duration-300 group">
              Learn More
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhatCanYouSell;


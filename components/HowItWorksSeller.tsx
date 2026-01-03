import React from "react";
import { motion } from "motion/react";
import { Upload, BadgeIndianRupee, Rocket, ArrowRight } from "lucide-react";

interface Step {
  icon: React.ReactNode;
  number: string;
  title: string;
  description: string;
  color: string;
}

const steps: Step[] = [
  {
    icon: <Upload className="w-8 h-8" />,
    number: "01",
    title: "Upload Your Project",
    description: "Share your code, designs, or templates. Add descriptions, screenshots, and set up your pricing in minutes.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: <BadgeIndianRupee className="w-8 h-8" />,
    number: "02",
    title: "Set Your Price",
    description: "You're in control. Set competitive prices, offer discounts, and create bundles to maximize your earnings.",
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: <Rocket className="w-8 h-8" />,
    number: "03",
    title: "Get Paid Instantly",
    description: "Receive payments directly to your bank or UPI. No waiting period - get paid as soon as someone buys.",
    color: "from-green-500 to-emerald-500",
  },
];

const StepCard: React.FC<{ step: Step; index: number }> = ({ step, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      className="relative group"
    >
      {/* Connector line */}
      {index < steps.length - 1 && (
        <div className="hidden lg:block absolute top-16 left-[60%] w-full h-0.5 bg-gradient-to-r from-white/20 to-transparent z-0" />
      )}
      
      <div className="relative z-10 text-center lg:text-left">
        {/* Step number */}
        <div className="inline-flex items-center gap-3 mb-6">
          <span className={`text-5xl font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent opacity-30`}>
            {step.number}
          </span>
        </div>
        
        {/* Icon */}
        <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${step.color} text-white mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {step.icon}
        </div>
        
        {/* Content */}
        <h3 className="text-xl font-semibold text-white mb-3">
          {step.title}
        </h3>
        <p className="text-white/60 leading-relaxed max-w-xs mx-auto lg:mx-0">
          {step.description}
        </p>
      </div>
    </motion.div>
  );
};

const HowItWorksSeller: React.FC = () => {
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-[#0f0a15] via-[#1a1025] to-[#0f0a15]">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-0 top-1/4 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[180px]" />
        <div className="absolute right-0 bottom-1/4 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 border border-green-500/30 bg-green-500/10 text-green-400 py-1.5 px-5 rounded-full text-sm font-medium mb-6">
            <Rocket className="w-4 h-4" />
            Start Selling in 3 Easy Steps
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="text-white">How to </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-green-400">
              Start Earning
            </span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Turn your projects into passive income. It takes less than 5 minutes to upload your first project and start earning.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 max-w-5xl mx-auto mb-14">
          {steps.map((step, index) => (
            <StepCard key={step.title} step={step} index={index} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-full transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 group">
            Start Selling Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSeller;


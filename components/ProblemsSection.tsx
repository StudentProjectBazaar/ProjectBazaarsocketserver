import React, { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Package, Search, Clock, FolderOpen, Users, Sparkles } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const, delay: i * 0.1 },
  }),
};

const problems = [
  {
    icon: <Search className="w-10 h-10 text-[#1a1a1a]" />,
    text: 'Spending hours searching for the right project or freelancer with no clear results?',
  },
  {
    icon: <FolderOpen className="w-10 h-10 text-[#1a1a1a]" />,
    text: 'Your best projects sit in a folder after graduation—never seen, never sold?',
  },
  {
    icon: <Clock className="w-10 h-10 text-[#1a1a1a]" />,
    text: 'Worrying that your skills are underused while others monetize theirs?',
  },
  {
    icon: <Package className="w-10 h-10 text-[#1a1a1a]" />,
    text: 'Do you have a growing fear of buying a project that doesn’t match the description?',
  },
  {
    icon: <Users className="w-10 h-10 text-[#1a1a1a]" />,
    text: 'Are you overwhelmed by too many platforms and no single place to build, buy, and sell?',
  },
  {
    icon: <Sparkles className="w-10 h-10 text-[#1a1a1a]" />,
    text: 'Do you waste time juggling portfolios, bids, and payments across different tools?',
  },
];

const ProblemCard: React.FC<{ icon: React.ReactNode; text: string; index: number }> = ({ icon, text, index }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      custom={index}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="flex flex-col items-center text-center p-6 bg-transparent"
    >
      <motion.div
        className="mb-4 flex items-center justify-center"
        whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.4 } }}
      >
        {icon}
      </motion.div>
      <p className="text-base leading-relaxed font-medium text-[#1a1a1a] max-w-[280px]">{text}</p>
    </motion.div>
  );
};

const ProblemsSection: React.FC = () => {
  const headRef = useRef(null);
  const headInView = useInView(headRef, { once: true, margin: '-80px' });

  return (
    <section id="why-choose-us" className="bg-[#f2f1ee] py-24 md:py-32 px-5 overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          ref={headRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-16 md:mb-20"
        >
          <p className="text-[#a1a1a1] uppercase tracking-[0.1em] text-sm font-bold mb-4">Is this you?</p>
          <h2 className="text-4xl md:text-5xl lg:text-[56px] leading-[1.1] font-bold text-[#1a1a1a] max-w-[800px] mx-auto tracking-tight">
            Does Your Experience with Project Marketplaces Feel More{' '}
            <span className="block text-[#1a1a1a]">Frustrating Than Futuristic?</span>
          </h2>
        </motion.div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {problems.map((problem, index) => (
              <ProblemCard key={index} icon={problem.icon} text={problem.text} index={index % 3} />
            ))}
          </div>
          <div className="absolute right-[5%] top-[-40px] md:right-[15%] lg:right-[20%] hidden sm:block">
            <p className="font-sans italic text-sm text-[#1a1a1a] font-medium absolute top-[-25px] right-[-20px] whitespace-nowrap uppercase tracking-wider opacity-70">
              sounds familiar?
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemsSection;

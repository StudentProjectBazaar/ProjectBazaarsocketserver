import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { FolderOpen, Users, Star, TrendingUp, Award, Briefcase } from 'lucide-react';

function useCountUp(target: number, inView: boolean, duration = 1800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const iv = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue(target);
        clearInterval(iv);
      } else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(iv);
  }, [inView, target, duration]);
  return value;
}

const resultsData = [
  { icon: FolderOpen, metric: '10K+', suffix: ' Projects', description: 'From capstone projects to production apps, all in one marketplace.', target: 10 },
  { icon: Users, metric: '5K+', suffix: ' Users', description: 'Buyers, sellers, and freelancers building and earning together.', target: 5 },
  { icon: Star, metric: '4.9', suffix: '/5 Rating', description: 'Rated highly for ease of use, support, and quality of projects.', target: 49, decimal: true },
  { icon: Award, metric: '99%', suffix: ' Satisfaction', description: 'Users report successful transactions and would recommend us.', target: 99 },
  { icon: TrendingUp, metric: '1K+', suffix: ' Sellers', description: 'Creators monetizing their work and growing their reputation.', target: 1 },
  { icon: Briefcase, metric: '50+', suffix: ' Categories', description: 'Web, mobile, AI, DevOps, design, and more to explore.', target: 50 },
];

const ResultsGridSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="bg-[#f2f1ee] py-24 md:py-32 px-5 flex flex-col items-center">
      <div ref={ref} className="max-w-[1200px] w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
          className="text-center mb-14 md:mb-16 relative"
        >
          <p className="text-sm font-medium text-[#1a1a1a] mb-4 uppercase tracking-wider">Why choose us?</p>
          <h2 className="text-4xl md:text-5xl font-bold leading-[1.2] text-[#1a1a1a] max-w-[600px] mx-auto">
            The <span className="text-[#ff7a00]">Results</span> Speak for Themselves
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 bg-white/40 rounded-[24px] overflow-hidden border border-[#e8e8e8]">
          {resultsData.map((item, index) => (
            <ResultCard key={index} item={item} index={index} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
};

function ResultCard({
  item,
  index,
  inView,
}: {
  item: (typeof resultsData)[0];
  index: number;
  inView: boolean;
}) {
  const count = useCountUp(item.target, inView, 1600 + index * 100);
  const display = item.decimal ? (count / 10).toFixed(1) : count;
  const symbol = item.metric.includes('+') ? '+' : item.metric.includes('%') ? '%' : '';
  const Icon = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ backgroundColor: 'rgba(255,122,0,0.03)', transition: { duration: 0.2 } }}
      className={`p-8 md:p-10 flex flex-col items-center text-center border-[#e8e8e8] ${
        index < 3 ? 'border-b' : ''
      } ${(index + 1) % 3 !== 0 ? 'border-r' : ''}`}
    >
      <motion.div
        className="w-11 h-11 mb-6 flex items-center justify-center text-[#ff7a00]"
        whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.4 } }}
      >
        <Icon className="w-11 h-11" />
      </motion.div>
      <h3 className="text-xl font-bold text-[#1a1a1a] mb-4 tabular-nums">
        {display}
        {symbol} {item.suffix}
      </h3>
      <p className="text-sm leading-relaxed text-[#a1a1a1] max-w-[280px]">{item.description}</p>
    </motion.div>
  );
}

export default ResultsGridSection;

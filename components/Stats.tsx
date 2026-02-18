import React from 'react';

const Stats: React.FC = () => {
  const stats = [
    { number: '10K+', label: 'Projects' },
    { number: '5K+', label: 'Users' },
    { number: '1K+', label: 'Sellers' },
    { number: '99%', label: 'Satisfaction' }
  ];

  return (
    <section className="py-16 md:py-20 bg-[#0a0a0a] border-y border-white/5">
      <div className="landing-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
              <div className="text-white/60 text-sm font-medium uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;

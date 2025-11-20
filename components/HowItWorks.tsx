import React from 'react';

const HowItWorks: React.FC = () => {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Browse Projects</h3>
            <p className="text-gray-600 dark:text-gray-400">Explore our collection of premium projects</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Purchase & Download</h3>
            <p className="text-gray-600 dark:text-gray-400">Buy the projects you need instantly</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Start Building</h3>
            <p className="text-gray-600 dark:text-gray-400">Use the projects to build amazing things</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

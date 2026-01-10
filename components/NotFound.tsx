import React, { useState, useEffect } from 'react';
import { useNavigation } from '../App';
import Lottie from 'lottie-react';

const NotFound: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [animationData, setAnimationData] = useState<any>(null);
  const [animationError, setAnimationError] = useState(false);

  useEffect(() => {
    // Dynamically import the animation to handle large JSON files
    import('../lottiefiles/Error 404.json')
      .then((data) => {
        setAnimationData(data.default || data);
      })
      .catch((error) => {
        console.error('Error loading 404 animation:', error);
        setAnimationError(true);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        {/* Lottie Animation */}
        {!animationError && (
          <div className="mb-8 flex justify-center">
            <div className="w-full max-w-md">
              {animationData ? (
                <Lottie 
                  animationData={animationData}
                  loop={true}
                  autoplay={true}
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Fallback 404 Illustration */}
        {animationError && (
          <div className="mb-8 flex justify-center">
            <div className="w-full max-w-md">
              <svg viewBox="0 0 400 300" className="w-full h-auto">
                <circle cx="200" cy="150" r="100" fill="#EF4444" opacity="0.1"/>
                <text x="200" y="160" textAnchor="middle" fontSize="120" fontWeight="bold" fill="#EF4444" fontFamily="Arial">
                  404
                </text>
                <circle cx="150" cy="120" r="8" fill="#EF4444"/>
                <circle cx="250" cy="120" r="8" fill="#EF4444"/>
                <path d="M 160 180 Q 200 200 240 180" stroke="#EF4444" strokeWidth="4" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        )}

        {/* Error Message */}
        <div className="space-y-4 mb-8">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-2">
            404
          </h1>
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigateTo('home')}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
          >
            Go to Homepage
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Or try these pages:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigateTo('dashboard')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigateTo('faq')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              FAQ
            </button>
            <button
              onClick={() => navigateTo('auth')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;


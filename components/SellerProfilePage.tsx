import React from 'react';
import type { BuyerProject } from './BuyerProjectCard';
import BuyerProjectCard from './BuyerProjectCard';

interface Seller {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  rating?: number;
  totalSales?: number;
  joinDate?: string;
}

interface SellerProfilePageProps {
  seller: Seller;
  sellerProjects: BuyerProject[];
  onBack: () => void;
}

const SellerProfilePage: React.FC<SellerProfilePageProps> = ({ seller, sellerProjects, onBack }) => {
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Project
      </button>

      {/* Seller Profile Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-3xl font-bold">
              {seller.avatar ? (
                <img src={seller.avatar} alt={seller.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                seller.name.charAt(0).toUpperCase()
              )}
            </div>
          </div>

          {/* Seller Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{seller.name}</h1>
                <p className="text-gray-600 mb-1">{seller.email}</p>
                {seller.joinDate && (
                  <p className="text-sm text-gray-500">Member since {new Date(seller.joinDate).getFullYear()}</p>
                )}
              </div>
              {seller.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(seller.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{seller.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {seller.bio && (
              <p className="text-gray-700 mb-4 leading-relaxed">{seller.bio}</p>
            )}

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              {seller.totalSales !== undefined && (
                <div>
                  <p className="text-sm text-gray-500">Total Sales</p>
                  <p className="text-xl font-bold text-gray-900">{seller.totalSales}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Projects</p>
                <p className="text-xl font-bold text-gray-900">{sellerProjects.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seller's Projects */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Projects by {seller.name}</h2>
        {sellerProjects.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-500">This seller hasn't published any projects yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellerProjects.map((project) => (
              <BuyerProjectCard
                key={project.id}
                project={project}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProfilePage;


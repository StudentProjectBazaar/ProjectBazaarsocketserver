import React from 'react';
import type { BuyerProject } from './BuyerProjectCard';
import BuyerProjectCard from './BuyerProjectCard';
import { useWishlist } from './DashboardPage';

interface WishlistPageProps {
  allProjects: BuyerProject[];
  onViewDetails: (project: BuyerProject) => void;
}

const WishlistPage: React.FC<WishlistPageProps> = ({ allProjects, onViewDetails }) => {
  const { wishlist } = useWishlist();
  const wishlistProjects = allProjects.filter(project => wishlist.includes(project.id));

  if (wishlistProjects.length === 0) {
    return (
      <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <p className="text-gray-500 text-lg font-medium">Your wishlist is empty</p>
        <p className="text-gray-400 text-sm mt-2">Start adding projects to your wishlist!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
        <span className="text-gray-600">{wishlistProjects.length} {wishlistProjects.length === 1 ? 'item' : 'items'}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistProjects.map((project) => (
          <BuyerProjectCard
            key={project.id}
            project={project}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;

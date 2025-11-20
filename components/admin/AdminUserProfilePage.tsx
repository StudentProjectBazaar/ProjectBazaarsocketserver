import React, { useState } from 'react';
import type { BuyerProject } from '../BuyerProjectCard';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  rating?: number;
  totalSales?: number;
  projectsCount?: number;
  joinDate?: string;
}

interface AdminProject extends BuyerProject {
  status: 'pending' | 'in-review' | 'active' | 'disabled' | 'rejected';
  uploadedDate: string;
  sellerId: string;
}

interface AdminUserProfilePageProps {
  user: User;
  userProjects: AdminProject[];
  onBack: () => void;
  onProjectStatusChange: (projectId: string, newStatus: AdminProject['status']) => void;
}

const AdminUserProfilePage: React.FC<AdminUserProfilePageProps> = ({ 
  user, 
  userProjects, 
  onBack,
  onProjectStatusChange 
}) => {
  const [projects, setProjects] = useState<AdminProject[]>(userProjects);

  const handleStatusChange = (projectId: string, newStatus: AdminProject['status']) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, status: newStatus } : p
    ));
    onProjectStatusChange(projectId, newStatus);
  };

  const getStatusBadge = (status: AdminProject['status']) => {
    const styles = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'in-review': 'bg-blue-100 text-blue-800 border-blue-300',
      'active': 'bg-green-100 text-green-800 border-green-300',
      'disabled': 'bg-gray-100 text-gray-800 border-gray-300',
      'rejected': 'bg-red-100 text-red-800 border-red-300',
    };
    return styles[status] || styles.pending;
  };

  const getStatusLabel = (status: AdminProject['status']) => {
    const labels = {
      'pending': 'Pending',
      'in-review': 'In Review',
      'active': 'Active',
      'disabled': 'Disabled',
      'rejected': 'Rejected',
    };
    return labels[status] || status;
  };

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
        Back to Project Management
      </button>

      {/* User Profile Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
                <p className="text-gray-600 mb-1">{user.email}</p>
                {user.joinDate && (
                  <p className="text-sm text-gray-500">Member since {new Date(user.joinDate).getFullYear()}</p>
                )}
              </div>
              {user.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(user.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{user.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {user.bio && (
              <p className="text-gray-700 mb-4 leading-relaxed">{user.bio}</p>
            )}

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              {user.totalSales !== undefined && (
                <div>
                  <p className="text-sm text-gray-500">Total Sales</p>
                  <p className="text-xl font-bold text-gray-900">{user.totalSales}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Projects</p>
                <p className="text-xl font-bold text-gray-900">{projects.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User's Projects */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Projects by {user.name}</h2>
        {projects.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-500">This user hasn't published any projects yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-2xl overflow-hidden group transition-all duration-300 shadow-sm hover:shadow-2xl hover:-translate-y-2 border border-gray-100 flex flex-col h-full relative"
              >
                {/* Status Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${getStatusBadge(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                </div>

                {/* Premium Badge */}
                {project.isPremium && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs text-white font-bold uppercase">Premium</span>
                    </div>
                  </div>
                )}

                {/* Image Section */}
                <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-grow">
                  {/* Category Badge */}
                  <div className="mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-orange-50 text-orange-600 text-xs font-semibold uppercase tracking-wide">
                      {project.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed flex-grow">
                    {project.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-50 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200"
                      >
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="text-xs text-gray-400 font-medium px-2 py-1.5">
                        +{project.tags.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {project.hasDocumentation && (
                      <span className="flex items-center gap-1.5 bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-orange-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Docs</span>
                      </span>
                    )}
                    {project.hasExecutionVideo && (
                      <span className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-green-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Video</span>
                      </span>
                    )}
                  </div>

                  {/* Price and Actions */}
                  <div className="pt-5 border-t border-gray-100 mt-auto">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-orange-600">
                          ${project.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">Uploaded: {project.uploadedDate}</p>
                      </div>
                    </div>

                    {/* Admin Actions */}
                    <div className="flex flex-col gap-2">
                      {project.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatusChange(project.id, 'active')}
                            className="flex-1 bg-green-500 text-white px-4 py-2.5 rounded-lg hover:bg-green-600 transition-colors font-semibold text-sm shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatusChange(project.id, 'rejected')}
                            className="flex-1 bg-red-500 text-white px-4 py-2.5 rounded-lg hover:bg-red-600 transition-colors font-semibold text-sm shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {project.status === 'in-review' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatusChange(project.id, 'active')}
                            className="flex-1 bg-green-500 text-white px-4 py-2.5 rounded-lg hover:bg-green-600 transition-colors font-semibold text-sm shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(project.id, 'rejected')}
                            className="flex-1 bg-red-500 text-white px-4 py-2.5 rounded-lg hover:bg-red-600 transition-colors font-semibold text-sm shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {project.status === 'active' && (
                        <button
                          onClick={() => handleStatusChange(project.id, 'disabled')}
                          className="w-full bg-orange-500 text-white px-4 py-2.5 rounded-lg hover:bg-orange-600 transition-colors font-semibold text-sm shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                          Disable Project
                        </button>
                      )}
                      {project.status === 'disabled' && (
                        <button
                          onClick={() => handleStatusChange(project.id, 'active')}
                          className="w-full bg-green-500 text-white px-4 py-2.5 rounded-lg hover:bg-green-600 transition-colors font-semibold text-sm shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                          Enable Project
                        </button>
                      )}
                      {project.status === 'rejected' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatusChange(project.id, 'active')}
                            className="flex-1 bg-green-500 text-white px-4 py-2.5 rounded-lg hover:bg-green-600 transition-colors font-semibold text-sm shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            Re-activate
                          </button>
                          <button
                            onClick={() => handleStatusChange(project.id, 'in-review')}
                            className="flex-1 bg-blue-500 text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 transition-colors font-semibold text-sm shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            Put in Review
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserProfilePage;


import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { GET_USER_DETAILS_ENDPOINT } from '../services/buyerApi';
import verifiedFreelanceSvg from '../lottiefiles/verified_freelance.svg';

interface FreelancerProfileData {
  userId: string;
  fullName?: string;
  name?: string;
  email?: string;
  profilePictureUrl?: string;
  profileImage?: string;
  isFreelancer?: boolean;
  skills?: string[];
  freelancerProjects?: Array<{
    id: string;
    title: string;
    url?: string;
    description?: string;
    images?: string[];
  }>;
}

// Encode/decode profile id so the raw UUID is not exposed in the URL
function encodeProfileId(id: string): string {
  try {
    return btoa(unescape(encodeURIComponent(id))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch {
    return '';
  }
}
function decodeProfileId(encoded: string): string | null {
  try {
    const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const pad = padded.length % 4;
    const base = pad ? padded + '='.repeat(4 - pad) : padded;
    return decodeURIComponent(escape(atob(base)));
  } catch {
    return null;
  }
}

const FreelancerProfilePage: React.FC = () => {
  const { userId: currentUserId } = useAuth();
  const [profile, setProfile] = useState<FreelancerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const freelancerId = typeof window !== 'undefined'
    ? (() => {
        const params = new URLSearchParams(window.location.search);
        const p = params.get('p');
        if (p) return decodeProfileId(p);
        return params.get('id'); // backward compatibility
      })()
    : null;

  useEffect(() => {
    if (!freelancerId) {
      setError('No freelancer specified');
      setLoading(false);
      return;
    }
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(GET_USER_DETAILS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: freelancerId }),
        });
        const data = await res.json();
        const user = data.data || data.user || data;
        if (!user || data.success === false) {
          setError('Profile not found');
          setProfile(null);
          return;
        }
        const picture =
          user.profilePictureUrl ?? user.profilePicture ?? user.profileImage ?? user.avatar ?? user.photoURL;
        setProfile({
          userId: user.userId || freelancerId,
          fullName: user.fullName || user.name,
          name: user.fullName || user.name,
          email: user.email,
          profilePictureUrl: picture,
          profileImage: picture,
          isFreelancer: user.isFreelancer === true,
          skills: Array.isArray(user.skills) ? user.skills : [],
          freelancerProjects: Array.isArray(user.freelancerProjects) ? user.freelancerProjects : [],
        });
        // Always show encoded param in URL so the raw id is never exposed
        if (typeof window !== 'undefined' && window.history.replaceState && freelancerId) {
          const enc = encodeProfileId(freelancerId);
          if (enc) {
            const newUrl = `${window.location.pathname}?p=${encodeURIComponent(enc)}`;
            window.history.replaceState({}, document.title, newUrl);
          }
        }
      } catch (err) {
        console.error('Error fetching freelancer profile:', err);
        setError('Failed to load profile');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [freelancerId]);

  const goBack = () => {
    window.history.back();
  };

  const goToBrowseAndInvite = () => {
    window.location.href = `/browse-freelancers${freelancerId ? `?invite=${encodeURIComponent(freelancerId)}` : ''}`;
  };

  const goToBrowseAndContact = () => {
    window.location.href = `/browse-freelancers${freelancerId ? `?contact=${encodeURIComponent(freelancerId)}` : ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'Profile not found'}</p>
          <button
            onClick={goBack}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const displayName = profile.fullName || profile.name || profile.email?.split('@')[0] || 'Freelancer';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 mb-6"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full border-2 border-orange-200 dark:border-orange-800 overflow-hidden bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  {profile.profilePictureUrl ? (
                    <img
                      src={profile.profilePictureUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const next = e.currentTarget.nextElementSibling as HTMLElement;
                        if (next) next.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span
                    className={`w-full h-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-2xl ${profile.profilePictureUrl ? 'hidden' : ''}`}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                {profile.isFreelancer && (
                  <div className="flex justify-center mt-2">
                    <img src={verifiedFreelanceSvg} alt="Verified freelancer" className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{displayName}</h1>
                {profile.email && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{profile.email}</p>
                )}
                {profile.isFreelancer && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mt-1">Freelancer</p>
                )}
              </div>
            </div>

            {profile.skills && profile.skills.length > 0 && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-sm font-medium rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.freelancerProjects && profile.freelancerProjects.length > 0 && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Projects</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.freelancerProjects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-4 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50"
                    >
                      {(proj.images?.length ?? 0) > 0 && (
                        <img
                          src={proj.images![0]}
                          alt=""
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                      )}
                      <p className="font-medium text-gray-900 dark:text-gray-100">{proj.title}</p>
                      {proj.url && (
                        <a
                          href={proj.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-orange-600 dark:text-orange-400 hover:underline truncate block"
                        >
                          {(() => {
                            try { return new URL(proj.url!).hostname; } catch { return proj.url; }
                          })()}
                        </a>
                      )}
                      {proj.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{proj.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentUserId && currentUserId !== profile.userId && (
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={goToBrowseAndInvite}
                  className="px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Invite to Bid
                </button>
                <button
                  onClick={goToBrowseAndContact}
                  className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Contact
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfilePage;

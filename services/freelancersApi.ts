/**
 * Service for fetching freelancers from API
 */

import type { Freelancer } from '../types/browse';

// API Endpoint for Freelancers Lambda
const FREELANCERS_API_ENDPOINT = 'https://i77xrgpj6i.execute-api.ap-south-2.amazonaws.com/default/freelancers_handler';

// Fallback to mock data when API is unavailable
import freelancersData from '../mock/freelancers.json';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

interface FreelancersData {
  freelancers: Freelancer[];
  count: number;
  totalCount: number;
  hasMore: boolean;
}

interface FreelancerProfile extends Freelancer {
  email?: string;
  bio?: string;
  projectsSold?: number;
  totalEarnings?: number;
  projectsCount?: number;
  joinedAt?: string;
  lastActiveAt?: string;
  projects?: Array<{
    id: string;
    title: string;
    description: string;
    price: number;
    thumbnailUrl?: string;
    category?: string;
    purchasesCount?: number;
    likesCount?: number;
  }>;
}

/**
 * Make API request to freelancers endpoint
 */
async function apiRequest<T>(action: string, body: Record<string, unknown> = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(FREELANCERS_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        ...body,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error in freelancers API (${action}):`, error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network error occurred',
      },
    };
  }
}

/**
 * Get all freelancers with optional pagination
 */
export const getAllFreelancers = async (
  limit: number = 50, 
  offset: number = 0
): Promise<{ freelancers: Freelancer[]; totalCount: number; hasMore: boolean }> => {
  try {
    const response = await apiRequest<FreelancersData>('GET_ALL_FREELANCERS', { limit, offset });
    
    if (response.success && response.data) {
      return {
        freelancers: response.data.freelancers,
        totalCount: response.data.totalCount,
        hasMore: response.data.hasMore,
      };
    }
    
    // Fallback to mock data
    console.warn('API failed, falling back to mock data');
    return {
      freelancers: freelancersData as Freelancer[],
      totalCount: freelancersData.length,
      hasMore: false,
    };
  } catch (error) {
    console.error('Error fetching freelancers:', error);
    return {
      freelancers: freelancersData as Freelancer[],
      totalCount: freelancersData.length,
      hasMore: false,
    };
  }
};

/**
 * Get a specific freelancer's profile
 */
export const getFreelancerById = async (freelancerId: string): Promise<FreelancerProfile | null> => {
  try {
    const response = await apiRequest<FreelancerProfile>('GET_FREELANCER_BY_ID', { freelancerId });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    // Fallback: try to find in mock data
    const mockFreelancer = (freelancersData as Freelancer[]).find(f => f.id === freelancerId);
    return mockFreelancer || null;
  } catch (error) {
    console.error('Error fetching freelancer:', error);
    return null;
  }
};

/**
 * Get top-rated freelancers for homepage
 */
export const getTopFreelancers = async (limit: number = 6): Promise<Freelancer[]> => {
  try {
    const response = await apiRequest<FreelancersData>('GET_TOP_FREELANCERS', { limit });
    
    if (response.success && response.data) {
      return response.data.freelancers;
    }
    
    // Fallback: return top from mock data sorted by rating
    const sorted = [...(freelancersData as Freelancer[])].sort((a, b) => b.rating - a.rating);
    return sorted.slice(0, limit);
  } catch (error) {
    console.error('Error fetching top freelancers:', error);
    const sorted = [...(freelancersData as Freelancer[])].sort((a, b) => b.rating - a.rating);
    return sorted.slice(0, limit);
  }
};

/**
 * Search freelancers by various criteria
 */
export const searchFreelancers = async (params: {
  query?: string;
  skills?: string[];
  country?: string;
  minHourlyRate?: number;
  maxHourlyRate?: number;
  limit?: number;
  offset?: number;
}): Promise<{ freelancers: Freelancer[]; totalCount: number; hasMore: boolean }> => {
  try {
    const response = await apiRequest<FreelancersData>('SEARCH_FREELANCERS', params);
    
    if (response.success && response.data) {
      return {
        freelancers: response.data.freelancers,
        totalCount: response.data.totalCount,
        hasMore: response.data.hasMore,
      };
    }
    
    // Fallback: filter mock data locally
    let filtered = [...(freelancersData as Freelancer[])];
    
    if (params.query) {
      const query = params.query.toLowerCase();
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(query) ||
        f.username.toLowerCase().includes(query) ||
        f.skills.some(s => s.toLowerCase().includes(query))
      );
    }
    
    if (params.skills && params.skills.length > 0) {
      filtered = filtered.filter(f => 
        params.skills!.some(skill => 
          f.skills.some(s => s.toLowerCase() === skill.toLowerCase())
        )
      );
    }
    
    if (params.country) {
      filtered = filtered.filter(f => 
        f.location.country.toLowerCase() === params.country!.toLowerCase()
      );
    }
    
    if (params.minHourlyRate !== undefined) {
      filtered = filtered.filter(f => f.hourlyRate >= params.minHourlyRate!);
    }
    
    if (params.maxHourlyRate !== undefined) {
      filtered = filtered.filter(f => f.hourlyRate <= params.maxHourlyRate!);
    }
    
    const offset = params.offset || 0;
    const limit = params.limit || 50;
    
    return {
      freelancers: filtered.slice(offset, offset + limit),
      totalCount: filtered.length,
      hasMore: offset + limit < filtered.length,
    };
  } catch (error) {
    console.error('Error searching freelancers:', error);
    return {
      freelancers: freelancersData as Freelancer[],
      totalCount: freelancersData.length,
      hasMore: false,
    };
  }
};

/**
 * Get unique skills from all freelancers
 */
export const getAvailableSkills = async (): Promise<string[]> => {
  try {
    const { freelancers } = await getAllFreelancers(1000, 0);
    const skillsSet = new Set<string>();
    freelancers.forEach(f => f.skills.forEach(skill => skillsSet.add(skill)));
    return Array.from(skillsSet).sort();
  } catch (error) {
    console.error('Error fetching skills:', error);
    const skillsSet = new Set<string>();
    (freelancersData as Freelancer[]).forEach(f => f.skills.forEach(skill => skillsSet.add(skill)));
    return Array.from(skillsSet).sort();
  }
};

/**
 * Get unique countries from all freelancers
 */
export const getAvailableCountries = async (): Promise<string[]> => {
  try {
    const { freelancers } = await getAllFreelancers(1000, 0);
    const countriesSet = new Set<string>();
    freelancers.forEach(f => countriesSet.add(f.location.country));
    return Array.from(countriesSet).sort();
  } catch (error) {
    console.error('Error fetching countries:', error);
    const countriesSet = new Set<string>();
    (freelancersData as Freelancer[]).forEach(f => countriesSet.add(f.location.country));
    return Array.from(countriesSet).sort();
  }
};

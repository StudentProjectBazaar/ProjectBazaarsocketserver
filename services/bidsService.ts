/**
 * Service for managing bids (localStorage-based)
 */

import type { Bid } from '../types/bids';

const BIDS_STORAGE_KEY = 'projectBazaar_bids';

/**
 * Get all bids from localStorage
 */
export const getAllBids = (): Bid[] => {
  try {
    const stored = localStorage.getItem(BIDS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error fetching bids:', error);
    return [];
  }
};

/**
 * Get bids for a specific project
 */
export const getBidsByProjectId = (projectId: string): Bid[] => {
  const allBids = getAllBids();
  return allBids.filter(bid => bid.projectId === projectId);
};

/**
 * Get bids submitted by a specific freelancer
 */
export const getBidsByFreelancerId = (freelancerId: string): Bid[] => {
  const allBids = getAllBids();
  return allBids.filter(bid => bid.freelancerId === freelancerId);
};

/**
 * Save a new bid
 */
export const saveBid = (bid: Bid): void => {
  const allBids = getAllBids();
  allBids.push(bid);
  localStorage.setItem(BIDS_STORAGE_KEY, JSON.stringify(allBids));
};

/**
 * Update a bid (e.g., change status)
 */
export const updateBid = (bidId: string, updates: Partial<Bid>): void => {
  const allBids = getAllBids();
  const index = allBids.findIndex(bid => bid.id === bidId);
  if (index !== -1) {
    allBids[index] = { ...allBids[index], ...updates };
    localStorage.setItem(BIDS_STORAGE_KEY, JSON.stringify(allBids));
  }
};

/**
 * Delete a bid
 */
export const deleteBid = (bidId: string): void => {
  const allBids = getAllBids();
  const filtered = allBids.filter(bid => bid.id !== bidId);
  localStorage.setItem(BIDS_STORAGE_KEY, JSON.stringify(filtered));
};

/**
 * Check if a freelancer has already bid on a project
 */
export const hasFreelancerBidOnProject = (freelancerId: string, projectId: string): boolean => {
  const allBids = getAllBids();
  return allBids.some(bid => bid.freelancerId === freelancerId && bid.projectId === projectId);
};

/**
 * Get the bid submitted by a freelancer on a specific project
 */
export const getFreelancerBidOnProject = (freelancerId: string, projectId: string): Bid | null => {
  const allBids = getAllBids();
  return allBids.find(bid => bid.freelancerId === freelancerId && bid.projectId === projectId) || null;
};


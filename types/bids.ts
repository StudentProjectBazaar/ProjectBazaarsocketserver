export interface Bid {
  id: string;
  projectId: string;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  bidAmount: number;
  currency: string;
  deliveryTime: number;
  deliveryTimeUnit: 'days' | 'weeks' | 'months';
  proposal: string;
  submittedAt: string; // ISO date string
  status?: 'pending' | 'accepted' | 'rejected';
}

export interface BidFormData {
  bidAmount: number;
  currency: string;
  deliveryTime: number;
  deliveryTimeUnit: 'days' | 'weeks' | 'months';
  proposal: string;
}


// Replace string with actual deployed API Endpoint once deployed
const FREELANCER_INTERACTIONS_API_ENDPOINT = 'https://eprkn8kyxf.execute-api.ap-south-2.amazonaws.com/default/freelancer_interactions_handler';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
    message?: string;
}

export interface Interaction {
    interactionId: string;
    type: 'message' | 'invitation' | 'review';
    senderId: string;
    senderName?: string;
    receiverId?: string;
    targetId?: string;
    content: string;
    status?: string;
    rating?: number;
    createdAt: string;
}

async function apiRequest<T>(action: string, body: Record<string, unknown> = {}): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(FREELANCER_INTERACTIONS_API_ENDPOINT, {
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
        console.error(`Error in interactions API (${action}):`, error);
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
 * Send a contact message to a freelancer
 */
export const sendFreelancerMessage = async (
    senderId: string,
    receiverId: string,
    message: string
): Promise<boolean> => {
    try {
        const response = await apiRequest<{ interactionId: string }>('SEND_MESSAGE', {
            senderId,
            receiverId,
            message
        });

        if (response.success) {
            return true;
        }

        throw new Error(response.error?.message || 'Failed to send message');
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

/**
 * Send an invitation to bid on a project
 */
export const sendFreelancerInvitation = async (
    senderId: string,
    receiverId: string,
    projectId: string,
    message: string
): Promise<boolean> => {
    try {
        const response = await apiRequest<{ interactionId: string }>('SEND_INVITATION', {
            senderId,
            receiverId,
            projectId,
            message
        });

        if (response.success) {
            return true;
        }

        throw new Error(response.error?.message || 'Failed to send invitation');
    } catch (error) {
        console.error('Error sending invitation:', error);
        throw error;
    }
};

/**
 * Add a review for a freelancer
 */
export const addFreelancerReview = async (
    reviewerId: string,
    reviewerName: string,
    freelancerId: string,
    rating: number,
    comment: string
): Promise<boolean> => {
    try {
        const response = await apiRequest<{ interactionId: string }>('ADD_REVIEW', {
            reviewerId,
            reviewerName,
            freelancerId,
            rating,
            comment
        });

        if (response.success) {
            return true;
        }

        throw new Error(response.error?.message || 'Failed to add review');
    } catch (error) {
        console.error('Error adding review:', error);
        throw error;
    }
};

/**
 * Get reviews for a freelancer
 */
export const getFreelancerReviews = async (freelancerId: string): Promise<{
    reviews: Interaction[],
    count: number,
    averageRating: number
}> => {
    try {
        const response = await apiRequest<{
            reviews: Interaction[],
            count: number,
            averageRating: number
        }>('GET_FREELANCER_REVIEWS', { freelancerId });

        if (response.success && response.data) {
            return response.data;
        }

        throw new Error(response.error?.message || 'Failed to fetch reviews');
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return { reviews: [], count: 0, averageRating: 0 };
    }
};

/**
 * API service for buyer actions (like, cart, purchase)
 */

const LAMBDA_ENDPOINT = 'https://tcladht447.execute-api.ap-south-2.amazonaws.com/default/Like_Addtocart_purcaseproject_for_Buyer';
const GET_USER_DETAILS_ENDPOINT = 'https://6omszxa58g.execute-api.ap-south-2.amazonaws.com/default/Get_user_Details_by_his_Id';

export interface CartItem {
  projectId: string;
  addedAt: string;
}

export interface Purchase {
  projectId: string;
  priceAtPurchase: number;
  purchasedAt: string;
  paymentId: string;
  orderStatus: string;
}

export interface UserData {
  userId: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  status?: string;
  isPremium?: boolean;
  credits?: number;
  projectsCount?: number;
  totalPurchases?: number;
  totalSpent?: number;
  wishlist?: string[];
  cart?: CartItem[];
  purchases?: Purchase[];
  lastLoginAt?: string;
  loginCount?: number;
  createdBy?: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Fetch user data including wishlist, cart, and purchases
 */
export const fetchUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const response = await fetch(GET_USER_DETAILS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.data) {
      return {
        userId: data.data.userId || userId,
        email: data.data.email,
        phoneNumber: data.data.phoneNumber,
        role: data.data.role,
        status: data.data.status,
        isPremium: data.data.isPremium,
        credits: data.data.credits,
        projectsCount: data.data.projectsCount,
        totalPurchases: data.data.totalPurchases,
        totalSpent: data.data.totalSpent,
        wishlist: data.data.wishlist || [],
        cart: data.data.cart || [],
        purchases: data.data.purchases || [],
        lastLoginAt: data.data.lastLoginAt,
        loginCount: data.data.loginCount,
        createdBy: data.data.createdBy,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

/**
 * Like a project
 */
export const likeProject = async (userId: string, projectId: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(LAMBDA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'LIKE_PROJECT',
        userId,
        projectId,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error liking project:', error);
    return {
      success: false,
      message: 'Failed to like project',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Unlike a project
 */
export const unlikeProject = async (userId: string, projectId: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(LAMBDA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'UNLIKE_PROJECT',
        userId,
        projectId,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error unliking project:', error);
    return {
      success: false,
      message: 'Failed to unlike project',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Add project to cart
 */
export const addToCart = async (userId: string, projectId: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(LAMBDA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'ADD_TO_CART',
        userId,
        projectId,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    return {
      success: false,
      message: 'Failed to add to cart',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Remove project from cart
 */
export const removeFromCart = async (userId: string, projectId: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(LAMBDA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'REMOVE_FROM_CART',
        userId,
        projectId,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    return {
      success: false,
      message: 'Failed to remove from cart',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Purchase a project
 */
export const purchaseProject = async (
  userId: string,
  projectId: string,
  priceAtPurchase: number,
  paymentId: string,
  orderStatus: string = 'SUCCESS'
): Promise<ApiResponse> => {
  try {
    const response = await fetch(LAMBDA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'PURCHASE_PROJECT',
        userId,
        projectId,
        priceAtPurchase,
        paymentId,
        orderStatus,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error purchasing project:', error);
    return {
      success: false,
      message: 'Failed to purchase project',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};


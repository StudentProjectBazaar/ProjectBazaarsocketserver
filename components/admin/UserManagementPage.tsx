import React, { useState, useEffect, useMemo } from 'react';
import type { BuyerProject } from '../BuyerProjectCard';

const GET_USER_DETAILS_ENDPOINT = 'https://6omszxa58g.execute-api.ap-south-2.amazonaws.com/default/Get_user_Details_by_his_Id';
// Note: If you have a "Get All Users" endpoint, replace the fetch logic below

interface User {
    id: string;
    userId: string;
    email: string;
    name: string;
    fullName?: string;
    role: 'buyer' | 'seller';
    joinDate: string;
    createdAt?: string;
    status: 'active' | 'inactive' | 'suspended';
    projectsCount: number;
    totalEarnings?: number;
    avatar?: string;
    profilePictureUrl?: string;
    lastActive?: string;
    lastLoginAt?: string;
    totalPurchases?: number;
    rating?: number;
    isPremium?: boolean;
    credits?: number;
    phoneNumber?: string;
}

interface ApiUser {
    userId: string;
    email: string;
    fullName?: string;
    role?: string;
    status?: string;
    isPremium?: boolean;
    credits?: number;
    projectsCount?: number;
    totalPurchases?: number;
    createdAt?: string;
    lastLoginAt?: string;
    phoneNumber?: string;
    profilePictureUrl?: string;
}

interface UserManagementPageProps {
    onViewUser?: (user: { id: string; name: string; email: string }) => void;
}

const UserManagementPage: React.FC<UserManagementPageProps> = ({ onViewUser }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'buyer' | 'seller'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    // Map API user to User interface
    const mapApiUserToComponent = (apiUser: ApiUser): User => {
        // Determine role
        const role: 'buyer' | 'seller' = (apiUser.role?.toLowerCase() === 'seller' ? 'seller' : 'buyer');
        
        // Map status
        let status: 'active' | 'inactive' | 'suspended' = 'active';
        if (apiUser.status) {
            const statusLower = apiUser.status.toLowerCase();
            if (statusLower === 'inactive' || statusLower === 'disabled') {
                status = 'inactive';
            } else if (statusLower === 'suspended' || statusLower === 'banned') {
                status = 'suspended';
            } else {
                status = 'active';
            }
        }

        // Format join date
        const joinDate = apiUser.createdAt
            ? new Date(apiUser.createdAt).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];

        // Format last active
        const lastActive = apiUser.lastLoginAt
            ? new Date(apiUser.lastLoginAt).toISOString().split('T')[0]
            : undefined;

        const name = apiUser.fullName || apiUser.email?.split('@')[0] || 'Unknown User';

        return {
            id: apiUser.userId,
            userId: apiUser.userId,
            email: apiUser.email || '',
            name: name,
            fullName: apiUser.fullName,
            role: role,
            joinDate: joinDate,
            createdAt: apiUser.createdAt,
            status: status,
            projectsCount: apiUser.projectsCount || 0,
            totalEarnings: undefined, // Will be calculated from projects if needed
            avatar: apiUser.profilePictureUrl,
            profilePictureUrl: apiUser.profilePictureUrl,
            lastActive: lastActive,
            lastLoginAt: apiUser.lastLoginAt,
            totalPurchases: apiUser.totalPurchases || 0,
            rating: undefined, // Not provided by basic user endpoint
            isPremium: apiUser.isPremium || false,
            credits: apiUser.credits || 0,
            phoneNumber: apiUser.phoneNumber,
        };
    };

    // Fetch all users
    // NOTE: This is a placeholder implementation. In production, you should have a dedicated "Get All Users" endpoint.
    // For now, this will attempt to fetch users. You may need to:
    // 1. Create a Lambda endpoint that returns all users
    // 2. Or maintain a list of user IDs and fetch them individually
    // 3. Or use a DynamoDB scan operation via Lambda
    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            // TODO: Replace this with your actual "Get All Users" endpoint
            // Example: const response = await fetch('https://your-api.com/get-all-users');
            
            // For now, we'll use mock data but structure it to easily replace with API call
            // In production, uncomment and use your actual endpoint:
            /*
            const response = await fetch('YOUR_GET_ALL_USERS_ENDPOINT');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch users: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.users) {
                const mappedUsers = data.users.map((apiUser: ApiUser) => 
                    mapApiUserToComponent(apiUser)
                );
                setUsers(mappedUsers);
            } else {
                throw new Error('Invalid response format from API');
            }
            */
            
            // Temporary: Using empty array - replace with API call above
            setUsers([]);
            console.warn('UserManagementPage: Using placeholder. Please implement "Get All Users" API endpoint.');
            
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err instanceof Error ? err.message : 'Failed to load users');
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch users on component mount
    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = 
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchQuery, roleFilter, statusFilter]);

    const handleToggleUserStatus = (userId: string) => {
        // TODO: Call API to toggle user status
        setUsers(users.map(u => {
            if (u.id === userId) {
                if (u.status === 'active') {
                    return { ...u, status: 'inactive' as const };
                } else if (u.status === 'inactive') {
                    return { ...u, status: 'active' as const };
                } else {
                    return { ...u, status: 'active' as const };
                }
            }
            return u;
        }));
        console.log('Toggle user status:', userId, '(API call needed)');
    };

    const handleSuspendUser = (userId: string) => {
        // TODO: Call API to suspend user
        setUsers(users.map(u => 
            u.id === userId ? { ...u, status: 'suspended' as const } : u
        ));
        console.log('Suspend user:', userId, '(API call needed)');
    };

    const handleViewUserDetails = (user: User) => {
        if (onViewUser) {
            onViewUser({ id: user.id, name: user.name, email: user.email });
        }
    };

    const activeUsers = users.filter(u => u.status === 'active');
    const inactiveUsers = users.filter(u => u.status === 'inactive');
    const suspendedUsers = users.filter(u => u.status === 'suspended');
    const sellers = users.filter(u => u.role === 'seller');
    const buyers = users.filter(u => u.role === 'buyer');

    const getStatusBadge = (status: User['status']) => {
        const styles = {
            'active': 'bg-green-100 text-green-800 border-green-300',
            'inactive': 'bg-gray-100 text-gray-800 border-gray-300',
            'suspended': 'bg-red-100 text-red-800 border-red-300',
        };
        return styles[status] || styles.inactive;
    };

    const getStatusLabel = (status: User['status']) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading users...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
                <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800 font-semibold mb-2">Error loading users</p>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <button
                    onClick={fetchUsers}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-green-200 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-green-50 to-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-green-700 font-medium">Active Users</p>
                            <p className="text-2xl font-bold text-green-900">{activeUsers.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-orange-200 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-orange-50 to-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-orange-700 font-medium">Sellers</p>
                            <p className="text-2xl font-bold text-orange-900">{sellers.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-blue-700 font-medium">Buyers</p>
                            <p className="text-2xl font-bold text-blue-900">{buyers.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-red-200 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-red-50 to-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-red-700 font-medium">Suspended</p>
                            <p className="text-2xl font-bold text-red-900">{suspendedUsers.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search */}
                    <div className="flex-1 w-full md:w-auto">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-3">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as any)}
                            className="px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                            <option value="all">All Roles</option>
                            <option value="seller">Sellers</option>
                            <option value="buyer">Buyers</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                viewMode === 'table' 
                                    ? 'bg-white text-orange-600 shadow-sm' 
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                viewMode === 'grid' 
                                    ? 'bg-white text-orange-600 shadow-sm' 
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Users List */}
            {viewMode === 'table' ? (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Stats</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Join Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <p className="text-gray-500">No users found. {users.length === 0 ? 'Please implement the "Get All Users" API endpoint.' : 'Try adjusting your filters.'}</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-orange-50/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                        {user.avatar || user.profilePictureUrl ? (
                                                            <img src={user.avatar || user.profilePictureUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                                        ) : (
                                                            user.name.charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                        {user.lastActive && (
                                                            <div className="text-xs text-gray-400 mt-0.5">Last active: {user.lastActive}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                                                    user.role === 'seller' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm">
                                                    {user.role === 'seller' ? (
                                                        <>
                                                            <div className="text-gray-900 font-semibold">{user.projectsCount} Projects</div>
                                                            {user.isPremium && (
                                                                <div className="text-xs text-amber-600 font-medium mt-1">Premium</div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="text-gray-900 font-semibold">{user.totalPurchases || 0} Purchases</div>
                                                            {user.isPremium && (
                                                                <div className="text-xs text-amber-600 font-medium mt-1">Premium</div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.joinDate}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${getStatusBadge(user.status)}`}>
                                                    {getStatusLabel(user.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleViewUserDetails(user)}
                                                        className="text-orange-600 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors font-semibold text-xs"
                                                    >
                                                        View Details
                                                    </button>
                                                    {user.status !== 'suspended' && (
                                                        <button
                                                            onClick={() => handleToggleUserStatus(user.id)}
                                                            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold text-xs ${
                                                                user.status === 'active'
                                                                    ? 'text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100'
                                                                    : 'text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100'
                                                            }`}
                                                        >
                                                            {user.status === 'active' ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                    )}
                                                    {user.status !== 'suspended' && (
                                                        <button
                                                            onClick={() => handleSuspendUser(user.id)}
                                                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors font-semibold text-xs"
                                                        >
                                                            Suspend
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.length === 0 ? (
                        <div className="col-span-full p-12 text-center bg-white rounded-xl border border-gray-200">
                            <p className="text-gray-500">No users found. {users.length === 0 ? 'Please implement the "Get All Users" API endpoint.' : 'Try adjusting your filters.'}</p>
                        </div>
                    ) : (
                        filteredUsers.map((user) => (
                            <div key={user.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 shadow-sm hover:-translate-y-1">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                        {user.avatar || user.profilePictureUrl ? (
                                            <img src={user.avatar || user.profilePictureUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            user.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 mb-4">
                                    <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${getStatusBadge(user.status)}`}>
                                        {getStatusLabel(user.status)}
                                    </span>
                                    <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                                        user.role === 'seller' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                        {user.role}
                                    </span>
                                    {user.isPremium && (
                                        <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                                            Premium
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-2 mb-4">
                                    {user.role === 'seller' ? (
                                        <>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Projects:</span>
                                                <span className="font-semibold text-gray-900">{user.projectsCount}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Purchases:</span>
                                            <span className="font-semibold text-gray-900">{user.totalPurchases || 0}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Joined:</span>
                                        <span className="font-semibold text-gray-900">{user.joinDate}</span>
                                    </div>
                                    {user.lastActive && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Last Active:</span>
                                            <span className="font-semibold text-gray-900">{user.lastActive}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => handleViewUserDetails(user)}
                                        className="flex-1 text-orange-600 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-lg transition-colors font-semibold text-sm"
                                    >
                                        View Details
                                    </button>
                                    {user.status !== 'suspended' && (
                                        <button
                                            onClick={() => handleToggleUserStatus(user.id)}
                                            className={`flex-1 px-4 py-2 rounded-lg transition-colors font-semibold text-sm ${
                                                user.status === 'active'
                                                    ? 'text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100'
                                                    : 'text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100'
                                            }`}
                                        >
                                            {user.status === 'active' ? 'Deactivate' : 'Activate'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default UserManagementPage;

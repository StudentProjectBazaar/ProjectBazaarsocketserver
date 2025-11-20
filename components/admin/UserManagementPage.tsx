import React, { useState, useMemo } from 'react';
import type { BuyerProject } from '../BuyerProjectCard';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'buyer' | 'seller';
    joinDate: string;
    status: 'active' | 'inactive' | 'suspended';
    projectsCount: number;
    totalEarnings?: number;
    avatar?: string;
    lastActive?: string;
    totalPurchases?: number;
    rating?: number;
}

const UserManagementPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([
        { 
            id: 'user-1', 
            email: 'user1@example.com', 
            name: 'John Doe', 
            role: 'seller', 
            joinDate: '2024-01-15', 
            status: 'active', 
            projectsCount: 5, 
            totalEarnings: 1250.50,
            lastActive: '2024-11-20',
            rating: 4.8,
        },
        { 
            id: 'user-2', 
            email: 'user2@example.com', 
            name: 'Jane Smith', 
            role: 'buyer', 
            joinDate: '2024-02-20', 
            status: 'active', 
            projectsCount: 0,
            totalPurchases: 3,
            lastActive: '2024-11-19',
        },
        { 
            id: 'user-3', 
            email: 'user3@example.com', 
            name: 'Bob Johnson', 
            role: 'seller', 
            joinDate: '2024-03-10', 
            status: 'inactive', 
            projectsCount: 3, 
            totalEarnings: 890.25,
            lastActive: '2024-10-15',
            rating: 4.2,
        },
        { 
            id: 'user-4', 
            email: 'user4@example.com', 
            name: 'Alice Brown', 
            role: 'seller', 
            joinDate: '2024-04-05', 
            status: 'active', 
            projectsCount: 8, 
            totalEarnings: 2100.75,
            lastActive: '2024-11-21',
            rating: 4.9,
        },
        { 
            id: 'user-5', 
            email: 'user5@example.com', 
            name: 'Charlie Wilson', 
            role: 'buyer', 
            joinDate: '2024-05-12', 
            status: 'suspended', 
            projectsCount: 0,
            totalPurchases: 1,
            lastActive: '2024-11-10',
        },
    ]);

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'buyer' | 'seller'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    const [userProjects, setUserProjects] = useState<BuyerProject[]>([
        {
            id: 'proj-1',
            imageUrl: 'https://images.unsplash.com/photo-1534237693998-0c6218f200b3?q=80&w=2070&auto=format&fit=crop',
            category: 'Web Development',
            title: 'E-commerce Platform',
            description: 'A full-stack e-commerce solution built with MERN stack.',
            tags: ['React', 'Node.js', 'MongoDB'],
            price: 49.99,
            isPremium: true,
            hasDocumentation: true,
            hasExecutionVideo: false,
        },
        {
            id: 'proj-2',
            imageUrl: 'https://images.unsplash.com/photo-1611162617213-6d22e4f13374?q=80&w=1974&auto=format&fit=crop',
            category: 'Mobile App',
            title: 'Social Media App',
            description: 'Feature-rich social media app clone using React Native.',
            tags: ['React Native', 'Firebase'],
            price: 59.99,
            hasDocumentation: true,
            hasExecutionVideo: true,
        },
    ]);

    const [projectStatuses, setProjectStatuses] = useState<Record<string, boolean>>({
        'proj-1': true,
        'proj-2': true,
    });

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
    };

    const handleSuspendUser = (userId: string) => {
        setUsers(users.map(u => 
            u.id === userId ? { ...u, status: 'suspended' as const } : u
        ));
    };

    const handleToggleProjectStatus = (projectId: string) => {
        setProjectStatuses({
            ...projectStatuses,
            [projectId]: !projectStatuses[projectId],
        });
    };

    const handleViewUserProjects = (user: User) => {
        setSelectedUser(user);
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

    if (selectedUser) {
        return (
            <div className="space-y-6">
                {/* Back Button */}
                <button
                    onClick={() => setSelectedUser(null)}
                    className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Users
                </button>

                {/* User Header */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                            {selectedUser.avatar ? (
                                <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                selectedUser.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedUser.name}</h2>
                            <p className="text-gray-600 mb-1">{selectedUser.email}</p>
                            <div className="flex items-center gap-4 mt-3">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(selectedUser.status)}`}>
                                    {getStatusLabel(selectedUser.status)}
                                </span>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                    selectedUser.role === 'seller' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                    {selectedUser.role}
                                </span>
                                {selectedUser.rating && (
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span className="text-sm font-semibold text-gray-700">{selectedUser.rating.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Projects */}
                {selectedUser.role === 'seller' && selectedUser.projectsCount > 0 && (
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Projects ({userProjects.length})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {userProjects.map((project) => (
                                <div key={project.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 shadow-sm hover:-translate-y-1">
                                    <div className="relative">
                                        <img src={project.imageUrl} alt={project.title} className="w-full h-48 object-cover" />
                                        {project.isPremium && (
                                            <div className="absolute top-3 left-3">
                                                <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    PREMIUM
                                                </span>
                                            </div>
                                        )}
                                        <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full ${
                                            projectStatuses[project.id] ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {projectStatuses[project.id] ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                    <div className="p-5">
                                        <span className="inline-block px-3 py-1 rounded-lg bg-orange-50 text-orange-600 text-xs font-semibold uppercase mb-3">
                                            {project.category}
                                        </span>
                                        <h4 className="text-lg font-bold text-gray-900 mb-2">{project.title}</h4>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-2xl font-bold text-orange-600">${project.price.toFixed(2)}</span>
                                        </div>
                                        <button
                                            onClick={() => handleToggleProjectStatus(project.id)}
                                            className={`w-full px-4 py-2.5 rounded-lg transition-colors font-semibold ${
                                                projectStatuses[project.id]
                                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                                    : 'bg-green-500 text-white hover:bg-green-600'
                                            }`}
                                        >
                                            {projectStatuses[project.id] ? 'Disable Project' : 'Enable Project'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
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
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-orange-50/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                    {user.avatar ? (
                                                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
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
                                                        {user.totalEarnings && (
                                                            <div className="text-green-600 font-medium">${user.totalEarnings.toFixed(2)}</div>
                                                        )}
                                                        {user.rating && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                </svg>
                                                                <span className="text-xs text-gray-600">{user.rating.toFixed(1)}</span>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="text-gray-900 font-semibold">{user.totalPurchases || 0} Purchases</div>
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
                                                {user.role === 'seller' && user.projectsCount > 0 && (
                                                    <button
                                                        onClick={() => handleViewUserProjects(user)}
                                                        className="text-orange-600 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors font-semibold text-xs"
                                                    >
                                                        View Projects
                                                    </button>
                                                )}
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredUsers.length === 0 && (
                        <div className="p-12 text-center">
                            <p className="text-gray-500">No users found matching your criteria.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.map((user) => (
                        <div key={user.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 shadow-sm hover:-translate-y-1">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
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
                            </div>
                            <div className="space-y-2 mb-4">
                                {user.role === 'seller' ? (
                                    <>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Projects:</span>
                                            <span className="font-semibold text-gray-900">{user.projectsCount}</span>
                                        </div>
                                        {user.totalEarnings && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Earnings:</span>
                                                <span className="font-semibold text-green-600">${user.totalEarnings.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {user.rating && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">Rating:</span>
                                                <div className="flex items-center gap-1">
                                                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    <span className="font-semibold text-gray-900">{user.rating.toFixed(1)}</span>
                                                </div>
                                            </div>
                                        )}
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
                            </div>
                            <div className="flex gap-2 pt-4 border-t border-gray-200">
                                {user.role === 'seller' && user.projectsCount > 0 && (
                                    <button
                                        onClick={() => handleViewUserProjects(user)}
                                        className="flex-1 text-orange-600 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-lg transition-colors font-semibold text-sm"
                                    >
                                        View Projects
                                    </button>
                                )}
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
                    ))}
                    {filteredUsers.length === 0 && (
                        <div className="col-span-full p-12 text-center bg-white rounded-xl border border-gray-200">
                            <p className="text-gray-500">No users found matching your criteria.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserManagementPage;

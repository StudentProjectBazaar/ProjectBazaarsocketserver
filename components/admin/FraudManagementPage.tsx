import React, { useState, useMemo } from 'react';

interface FraudReport {
    id: string;
    projectId: string;
    projectTitle: string;
    projectImage: string;
    reportedBy: string;
    reporterEmail: string;
    reportedDate: string;
    message: string;
    status: 'pending' | 'resolved' | 'dismissed';
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'copyright' | 'scam' | 'misleading' | 'spam' | 'other';
    sellerName?: string;
    sellerEmail?: string;
}

const FraudManagementPage: React.FC = () => {
    const [reports, setReports] = useState<FraudReport[]>([
        {
            id: 'report-1',
            projectId: 'proj-1',
            projectTitle: 'E-commerce Platform',
            projectImage: 'https://images.unsplash.com/photo-1534237693998-0c6218f200b3?q=80&w=2070&auto=format&fit=crop',
            reportedBy: 'John Buyer',
            reporterEmail: 'buyer1@example.com',
            reportedDate: '2024-11-18',
            message: 'This project contains stolen code from another repository. The seller has copied code without permission and is violating copyright laws.',
            status: 'pending',
            severity: 'high',
            category: 'copyright',
            sellerName: 'John Doe',
            sellerEmail: 'seller1@example.com',
        },
        {
            id: 'report-2',
            projectId: 'proj-2',
            projectTitle: 'Social Media App',
            projectImage: 'https://images.unsplash.com/photo-1611162617213-6d22e4f13374?q=80&w=1974&auto=format&fit=crop',
            reportedBy: 'Jane Buyer',
            reporterEmail: 'buyer2@example.com',
            reportedDate: '2024-11-19',
            message: 'The project does not work as described. The code has errors and the documentation is incomplete. This is misleading to buyers.',
            status: 'pending',
            severity: 'medium',
            category: 'misleading',
            sellerName: 'Jane Smith',
            sellerEmail: 'seller2@example.com',
        },
        {
            id: 'report-3',
            projectId: 'proj-3',
            projectTitle: 'Sales Prediction AI',
            projectImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop',
            reportedBy: 'Bob Buyer',
            reporterEmail: 'buyer3@example.com',
            reportedDate: '2024-11-20',
            message: 'The seller is using fake credentials and the project is a scam. They are not responding to support requests.',
            status: 'resolved',
            severity: 'critical',
            category: 'scam',
            sellerName: 'Bob Johnson',
            sellerEmail: 'seller3@example.com',
        },
        {
            id: 'report-4',
            projectId: 'proj-4',
            projectTitle: 'Portfolio Template',
            projectImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop',
            reportedBy: 'Alice Buyer',
            reporterEmail: 'buyer4@example.com',
            reportedDate: '2024-11-21',
            message: 'This appears to be spam content with no real value. The project description is vague and the code quality is poor.',
            status: 'pending',
            severity: 'low',
            category: 'spam',
            sellerName: 'Alice Brown',
            sellerEmail: 'seller4@example.com',
        },
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('all');
    const [severityFilter, setSeverityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
    const [expandedReport, setExpandedReport] = useState<string | null>(null);

    const filteredReports = useMemo(() => {
        return reports.filter(report => {
            const matchesSearch = 
                report.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                report.reportedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
                report.message.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
            const matchesSeverity = severityFilter === 'all' || report.severity === severityFilter;
            return matchesSearch && matchesStatus && matchesSeverity;
        });
    }, [reports, searchQuery, statusFilter, severityFilter]);

    const handleResolve = (reportId: string) => {
        setReports(reports.map(r => 
            r.id === reportId ? { ...r, status: 'resolved' as const } : r
        ));
    };

    const handleDismiss = (reportId: string) => {
        setReports(reports.map(r => 
            r.id === reportId ? { ...r, status: 'dismissed' as const } : r
        ));
    };

    const handleDisableProject = (projectId: string) => {
        // In real app, this would disable the project
        console.log('Disabling project:', projectId);
    };

    const pendingReports = reports.filter(r => r.status === 'pending');
    const resolvedReports = reports.filter(r => r.status === 'resolved');
    const dismissedReports = reports.filter(r => r.status === 'dismissed');
    const criticalReports = reports.filter(r => r.severity === 'critical' && r.status === 'pending');

    const getStatusBadge = (status: FraudReport['status']) => {
        const styles = {
            'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'resolved': 'bg-green-100 text-green-800 border-green-300',
            'dismissed': 'bg-gray-100 text-gray-800 border-gray-300',
        };
        return styles[status] || styles.pending;
    };

    const getSeverityBadge = (severity: FraudReport['severity']) => {
        const styles = {
            'low': 'bg-blue-100 text-blue-800 border-blue-300',
            'medium': 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'high': 'bg-orange-100 text-orange-800 border-orange-300',
            'critical': 'bg-red-100 text-red-800 border-red-300',
        };
        return styles[severity] || styles.low;
    };

    const getCategoryLabel = (category: FraudReport['category']) => {
        const labels = {
            'copyright': 'Copyright Violation',
            'scam': 'Scam/Fraud',
            'misleading': 'Misleading Content',
            'spam': 'Spam',
            'other': 'Other',
        };
        return labels[category] || category;
    };

    const getSeverityIcon = (severity: FraudReport['severity']) => {
        switch (severity) {
            case 'critical':
                return (
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                );
            case 'high':
                return (
                    <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Reports</p>
                            <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-yellow-200 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-yellow-50 to-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-yellow-700 font-medium">Pending</p>
                            <p className="text-2xl font-bold text-yellow-900">{pendingReports.length}</p>
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
                            <p className="text-sm text-green-700 font-medium">Resolved</p>
                            <p className="text-2xl font-bold text-green-900">{resolvedReports.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-red-200 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-red-50 to-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-red-700 font-medium">Critical</p>
                            <p className="text-2xl font-bold text-red-900">{criticalReports.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-gray-50 to-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-700 font-medium">Dismissed</p>
                            <p className="text-2xl font-bold text-gray-900">{dismissedReports.length}</p>
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
                                placeholder="Search reports by project, reporter, or message..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="resolved">Resolved</option>
                            <option value="dismissed">Dismissed</option>
                        </select>
                        <select
                            value={severityFilter}
                            onChange={(e) => setSeverityFilter(e.target.value as any)}
                            className="px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                            <option value="all">All Severity</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
                {filteredReports.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <p className="text-gray-500">No reports found matching your criteria.</p>
                    </div>
                ) : (
                    filteredReports.map((report) => (
                        <div 
                            key={report.id} 
                            className={`bg-white rounded-xl border-2 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-xl ${
                                report.severity === 'critical' ? 'border-red-300' :
                                report.severity === 'high' ? 'border-orange-300' :
                                report.severity === 'medium' ? 'border-yellow-300' :
                                'border-gray-200'
                            }`}
                        >
                            <div className="p-6">
                                <div className="flex gap-6">
                                    {/* Project Image */}
                                    <div className="flex-shrink-0">
                                        <div className="relative">
                                            <img 
                                                src={report.projectImage} 
                                                alt={report.projectTitle} 
                                                className="w-32 h-32 rounded-xl object-cover shadow-md"
                                            />
                                            {report.severity === 'critical' && (
                                                <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg animate-pulse">
                                                    {getSeverityIcon(report.severity)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Report Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-bold text-gray-900">{report.projectTitle}</h3>
                                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getSeverityBadge(report.severity)}`}>
                                                        {report.severity.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 mb-2">Project ID: <span className="font-mono">{report.projectId}</span></p>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(report.status)}`}>
                                                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                                    </span>
                                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                                        {getCategoryLabel(report.category)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Reporter Info */}
                                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                                        {report.reportedBy.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{report.reportedBy}</p>
                                                        <p className="text-xs text-gray-500">{report.reporterEmail}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">Reported on</p>
                                                    <p className="text-sm font-semibold text-gray-900">{report.reportedDate}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Seller Info */}
                                        {report.sellerName && (
                                            <div className="bg-orange-50 rounded-lg p-4 mb-4 border border-orange-200">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                                                        {report.sellerName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-orange-700 font-medium">Seller</p>
                                                        <p className="text-sm font-semibold text-gray-900">{report.sellerName}</p>
                                                        <p className="text-xs text-gray-600">{report.sellerEmail}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Message */}
                                        <div className="mb-4">
                                            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                Report Message:
                                            </p>
                                            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                                                <p className="text-sm text-gray-800 leading-relaxed">{report.message}</p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {report.status === 'pending' && (
                                            <div className="flex flex-wrap gap-3">
                                                <button
                                                    onClick={() => handleResolve(report.id)}
                                                    className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-sm shadow-md hover:shadow-lg"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Mark as Resolved
                                                </button>
                                                <button
                                                    onClick={() => handleDismiss(report.id)}
                                                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold text-sm shadow-md hover:shadow-lg"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    Dismiss Report
                                                </button>
                                                <button
                                                    onClick={() => handleDisableProject(report.projectId)}
                                                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold text-sm shadow-md hover:shadow-lg"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                    </svg>
                                                    Disable Project
                                                </button>
                                                <button
                                                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold text-sm shadow-md hover:shadow-lg"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    View Project Details
                                                </button>
                                            </div>
                                        )}
                                        {report.status !== 'pending' && (
                                            <div className="text-sm text-gray-500 italic">
                                                This report has been {report.status}.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FraudManagementPage;

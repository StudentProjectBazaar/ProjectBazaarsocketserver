import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass }) => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass} shadow-sm`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

interface ChartBarProps {
    label: string;
    value: number;
    maxValue: number;
    colorClass: string;
}

const ChartBar: React.FC<ChartBarProps> = ({ label, value, maxValue, colorClass }) => (
    <div className="flex flex-col items-center gap-2">
        <div className="w-full h-40 bg-gray-100 rounded-lg flex items-end">
            <div 
                className={`w-full rounded-lg ${colorClass}`}
                style={{ height: `${(value / maxValue) * 100}%` }}
                title={`$${value}`}
            ></div>
        </div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
    </div>
);


const BuyerAnalyticsPage: React.FC = () => {
    const monthlySpendData = [
        { month: 'Jan', amount: 120 }, { month: 'Feb', amount: 200 }, { month: 'Mar', amount: 150 },
        { month: 'Apr', amount: 300 }, { month: 'May', amount: 250 }, { month: 'Jun', amount: 180 },
    ];
    const maxSpend = Math.max(...monthlySpendData.map(d => d.amount));

    const categorySpendData = [
        { category: 'Web Dev', amount: 45, color: 'bg-orange-500', angle: 0 },
        { category: 'Mobile App', amount: 25, color: 'bg-orange-400', angle: 0.45 * 360 },
        { category: 'Data Science', amount: 20, color: 'bg-orange-600', angle: (0.45 + 0.25) * 360 },
        { category: 'UI/UX', amount: 10, color: 'bg-orange-300', angle: (0.45 + 0.25 + 0.20) * 360 },
    ];
    const conicGradient = `conic-gradient(
        #f97316 0% 45%,
        #fb923c 45% 70%,
        #ea580c 70% 90%,
        #fdba74 90% 100%
    )`;

    const recentPurchases = [
        { title: 'E-commerce Platform', date: '2024-06-15', price: 49.99 },
        { title: 'Sales Prediction AI', date: '2024-06-10', price: 79.99 },
        { title: 'Fintech App UI Kit', date: '2024-05-28', price: 29.99 },
    ];

    return (
        <div className="mt-8 space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Spent" value="$1,200" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} colorClass="bg-gradient-to-br from-orange-500 to-orange-600" />
                <StatCard title="Projects Purchased" value="15" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>} colorClass="bg-gradient-to-br from-orange-400 to-orange-500" />
                <StatCard title="Favorite Category" value="Web Dev" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>} colorClass="bg-gradient-to-br from-orange-600 to-orange-700" />
                <StatCard title="Avg. Project Cost" value="$80" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>} colorClass="bg-gradient-to-br from-orange-500 to-orange-600" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spend</h3>
                    <div className="grid grid-cols-6 gap-4">
                        {monthlySpendData.map(data => (
                            <ChartBar key={data.month} label={data.month} value={data.amount} maxValue={maxSpend} colorClass="bg-gradient-to-t from-orange-400 to-orange-600" />
                        ))}
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
                    <div className="flex items-center justify-center gap-8">
                         <div className="relative w-32 h-32">
                            <div className="absolute inset-0 rounded-full" style={{ background: conicGradient }}></div>
                            <div className="absolute inset-2 bg-white rounded-full"></div>
                        </div>
                        <ul className="space-y-2">
                            {categorySpendData.map(item => (
                                <li key={item.category} className="flex items-center gap-2">
                                    <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                                    <span className="text-sm text-gray-600">{item.category} ({item.amount}%)</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Recent Purchases */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Purchases</h3>
                <ul className="divide-y divide-gray-100">
                    {recentPurchases.map(item => (
                        <li key={item.title} className="py-3 flex justify-between items-center hover:bg-orange-50/30 px-2 rounded-lg transition-colors">
                            <div>
                                <p className="font-medium text-gray-800">{item.title}</p>
                                <p className="text-sm text-gray-500">{item.date}</p>
                            </div>
                            <p className="font-bold text-orange-600">${item.price.toFixed(2)}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default BuyerAnalyticsPage;
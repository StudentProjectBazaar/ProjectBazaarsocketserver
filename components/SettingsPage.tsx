import React, { useState } from 'react';
import { useAuth, useNavigation, usePremium } from '../App';

interface SectionCardProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, description, children }) => (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

interface InputFieldProps {
    id: string;
    label: string;
    type?: string;
    value?: string;
    placeholder?: string;
    icon: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({ id, label, type = 'text', value = '', placeholder, icon }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                {icon}
            </span>
            <input 
                type={type} 
                id={id} 
                defaultValue={value}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-gray-900"
            />
        </div>
    </div>
);

interface ToggleSwitchProps {
    label: string;
    description: string;
    enabled: boolean;
    setEnabled: (enabled: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, description, enabled, setEnabled }) => (
    <div className="flex justify-between items-center">
        <div>
            <p className="font-medium text-gray-800">{label}</p>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={enabled} onChange={() => setEnabled(!enabled)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 shadow-inner"></div>
        </label>
    </div>
);


const SettingsPage: React.FC = () => {
    const { userEmail } = useAuth();
    const { isPremium, credits, setIsPremium } = usePremium();
    const { navigateTo } = useNavigation();
    const [profileImg, setProfileImg] = useState<string | null>(null);
    
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setProfileImg(event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    return (
        <div className="mt-8 space-y-8 max-w-4xl mx-auto">
            <SectionCard title="Profile Picture">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                            {profileImg ? (
                                <img src={profileImg} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                            )}
                        </div>
                    </div>
                    <div>
                        <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        <label htmlFor="file-upload" className="cursor-pointer bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-2 px-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg">
                            Upload Photo
                        </label>
                        <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
                    </div>
                </div>
            </SectionCard>

            <SectionCard title="Public Profile" description="This information will be displayed publicly.">
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField id="fullName" label="Full Name" placeholder="John Doe" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>} />
                        <InputField id="email" label="Email Address" value={userEmail || ''} placeholder="you@example.com" type="email" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField id="linkedin" label="LinkedIn URL" placeholder="linkedin.com/in/..." icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>} />
                        <InputField id="github" label="GitHub URL" placeholder="github.com/..." icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>} />
                    </div>
                    <div className="text-right">
                        <button type="submit" className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-2.5 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg">Save Changes</button>
                    </div>
                </form>
            </SectionCard>

            <SectionCard title="Notifications">
                <div className="space-y-4">
                    <ToggleSwitch label="Email Notifications" description="Get emails about new projects and offers." enabled={emailNotifications} setEnabled={setEmailNotifications} />
                    <ToggleSwitch label="Push Notifications" description="Receive push notifications on your device." enabled={pushNotifications} setEnabled={setPushNotifications} />
                </div>
            </SectionCard>

            {/* Premium & Credits Section */}
            <SectionCard title="Premium & Credits" description="Manage your premium subscription and credits.">
                <div className="space-y-6">
                    {/* Premium Status */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isPremium ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gray-200'}`}>
                                {isPremium ? (
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 2v.01M12 20v.01M3 12h.01M21 12h.01M4.207 4.207l.01.01M19.793 4.207l.01.01M4.207 19.793l.01.01M19.793 19.793l.01.01" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">
                                    {isPremium ? 'Premium Member' : 'Free Plan'}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {isPremium ? 'Unlimited projects & features' : 'Up to 5 projects'}
                                </p>
                            </div>
                        </div>
                        {!isPremium && (
                            <button
                                onClick={() => {
                                    navigateTo('home');
                                    setTimeout(() => {
                                        const pricingSection = document.getElementById('pricing');
                                        if (pricingSection) {
                                            pricingSection.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }, 100);
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg"
                            >
                                Upgrade to Premium
                            </button>
                        )}
                    </div>

                    {/* Credits Display */}
                    {isPremium && (
                        <div className="p-6 bg-white border-2 border-orange-200 rounded-xl">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-1">Available Credits</h4>
                                    <p className="text-sm text-gray-500">Use credits to upload premium projects and access exclusive features</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-orange-600">{credits}</span>
                                        <span className="text-lg text-gray-500">credits</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span className="text-sm font-semibold text-gray-700">Upload Project</span>
                                    </div>
                                    <p className="text-xs text-gray-500">10 credits per project</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                        </svg>
                                        <span className="text-sm font-semibold text-gray-700">Premium Badge</span>
                                    </div>
                                    <p className="text-xs text-gray-500">5 credits per project</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <span className="text-sm font-semibold text-gray-700">Featured Listing</span>
                                    </div>
                                    <p className="text-xs text-gray-500">20 credits per week</p>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        navigateTo('home');
                                        setTimeout(() => {
                                            const pricingSection = document.getElementById('pricing');
                                            if (pricingSection) {
                                                pricingSection.scrollIntoView({ behavior: 'smooth' });
                                            }
                                        }, 100);
                                    }}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg"
                                >
                                    Buy More Credits
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </SectionCard>
            
            <SectionCard title="Danger Zone">
                <button className="bg-red-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-red-700 transition-colors">
                    Delete Account
                </button>
                <p className="text-sm text-gray-500 mt-2">Once you delete your account, there is no going back. Please be certain.</p>
            </SectionCard>

        </div>
    );
};

export default SettingsPage;
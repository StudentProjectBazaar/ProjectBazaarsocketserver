import React, { useState } from 'react';
import { usePremium, useNavigation } from '../App';

const CheckIcon = () => (
    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
);

const GiftIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
    </svg>
);


const lifetimePlans = [
    {
        name: 'Premium Lifetime',
        originalPrice: 320,
        price: 87,
        discount: 72,
        offer: 'Big Friday Sale | One-time purchase',
        buttonText: 'Get Started',
        isPopular: false,
        features: [
            '1 user',
            '40 downloads per day',
            'Lifetime update & access',
            'Use on personal & commercial projects',
            'Access to all present+future products'
        ]
    },
    {
        name: 'Team Lifetime',
        originalPrice: 699,
        price: 279,
        discount: 60,
        offer: 'One-time purchase',
        buttonText: 'Get Started',
        isPopular: true,
        features: [
            'Upto 5 user',
            '60 downloads per day per user',
            'Lifetime update & access',
            'Use on personal & commercial projects',
            'Access to all present+future products'
        ]
    },
    {
        name: 'B2B',
        originalPrice: null,
        price: null,
        discount: null,
        offer: null,
        description: 'Contact Us',
        subDescription: 'Custom enterprise solution',
        buttonText: 'Contact Us',
        isPopular: false,
        features: [
            'Unlimited Users',
            'Unlimited downloads per day per user',
            'Lifetime update & access',
            'Use on personal & commercial projects',
            'Access to all present+future products'
        ]
    }
];

const yearlyPlans = [
    {
        name: 'Premium Yearly',
        originalPrice: 120,
        price: 29,
        discount: 76,
        offer: 'Annual subscription',
        buttonText: 'Get Started',
        isPopular: false,
        features: [
            '1 user',
            '40 downloads per day',
            'Yearly update & access',
            'Use on personal & commercial projects',
            'Access to all present+future products'
        ]
    },
    {
        name: 'Team Yearly',
        originalPrice: 300,
        price: 99,
        discount: 67,
        offer: 'Annual subscription',
        buttonText: 'Get Started',
        isPopular: true,
        features: [
            'Upto 5 user',
            '60 downloads per day per user',
            'Yearly update & access',
            'Use on personal & commercial projects',
            'Access to all present+future products'
        ]
    },
    {
        name: 'B2B',
        originalPrice: null,
        price: null,
        discount: null,
        offer: null,
        description: 'Contact Us',
        subDescription: 'Custom enterprise solution',
        buttonText: 'Contact Us',
        isPopular: false,
        features: [
            'Unlimited Users',
            'Unlimited downloads per day per user',
            'Yearly update & access',
            'Use on personal & commercial projects',
            'Access to all present+future products'
        ]
    }
];

const Pricing: React.FC = () => {
    const [planType, setPlanType] = useState<'yearly' | 'lifetime'>('lifetime');
    const { setIsPremium, setCredits } = usePremium();
    const { navigateTo } = useNavigation();

    const plans = planType === 'lifetime' ? lifetimePlans : yearlyPlans;
    const planLabel = planType === 'lifetime' ? 'Lifetime Plans' : 'Yearly Plans';

    const handlePurchase = (planName: string) => {
        // Set premium status and give credits
        setIsPremium(true);
        setCredits(100);
        // Navigate to dashboard
        navigateTo('dashboard');
    };

    return (
        <section id="pricing" className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
                    <p className="text-lg text-gray-600">
                        Select the perfect plan for your needs. All plans include lifetime updates and access to all products.
                    </p>
                </div>

                {/* Toggle Switch */}
                <div className="flex justify-center mb-12">
                    <div className="inline-flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200">
                        <button
                            onClick={() => setPlanType('yearly')}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                                planType === 'yearly'
                                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Yearly Plans
                        </button>
                        <button
                            onClick={() => setPlanType('lifetime')}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                                planType === 'lifetime'
                                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Lifetime Plans
                        </button>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative bg-white border-2 rounded-2xl p-8 flex flex-col h-full transition-all duration-300 ${
                                plan.isPopular
                                    ? 'border-orange-500 shadow-xl scale-105'
                                    : 'border-gray-200 hover:border-orange-300 hover:shadow-lg'
                            }`}
                        >
                            {/* Most Popular Badge */}
                            {plan.isPopular && (
                                <div className="absolute -top-4 right-6 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg transform rotate-12">
                                    Most Popular
                                </div>
                            )}

                            {/* Discount Badge */}
                            {plan.discount && (
                                <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                    Save {plan.discount}%
                                </div>
                            )}

                            {/* Plan Name */}
                            <h3 className="text-2xl font-bold text-gray-900 mb-6 mt-4">{plan.name}</h3>

                            {/* Pricing */}
                            {plan.price ? (
                                <div className="mb-4">
                                    <div className="flex items-baseline gap-2 mb-2">
                                        {plan.originalPrice && (
                                            <span className="text-xl text-gray-400 line-through">
                                                ${plan.originalPrice}
                                            </span>
                                        )}
                                        <span className="text-5xl font-bold text-gray-900">
                                            ${plan.price}
                                        </span>
                                        <span className="text-lg text-gray-600">
                                            /{planType === 'lifetime' ? 'lifetime' : 'year'}
                                        </span>
                                    </div>
                                    {plan.offer && (
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <GiftIcon />
                                            <span>{plan.offer}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="mb-6">
                                    <p className="text-3xl font-bold text-gray-900 mb-2">{plan.description}</p>
                                    <p className="text-sm text-gray-600">{plan.subDescription}</p>
                                </div>
                            )}

                            {/* CTA Button */}
                            <button
                                onClick={() => plan.name !== 'B2B' ? handlePurchase(plan.name) : {}}
                                className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 shadow-md hover:shadow-lg mb-8 ${
                                    plan.isPopular
                                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                                        : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                                }`}
                            >
                                {plan.buttonText}
                            </button>

                            {/* Features List */}
                            <ul className="space-y-4 flex-grow">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckIcon />
                                        <span className="text-sm text-gray-700 flex-1">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;

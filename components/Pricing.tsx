import React from 'react';
import { usePremium, useNavigation } from '../App';
import { Pricing as AnimatedPricing } from './ui/pricing';

const Pricing: React.FC = () => {
    const { setIsPremium, setCredits } = usePremium();
    const { navigateTo } = useNavigation();

    const handlePurchase = (_planName: string) => {
        // Set premium status and give credits
        setIsPremium(true);
        setCredits(100);
        // Navigate to dashboard
        navigateTo('dashboard');
    };

    // Convert existing plans to new format
    const plans = [
        {
            name: "PREMIUM",
            price: "29",
            yearlyPrice: "23",
            period: "per month",
            features: [
                "1 user",
                "40 downloads per day",
                "Yearly update & access",
                "Use on personal & commercial projects",
                "Access to all present+future products"
            ],
            description: "Perfect for individuals and small projects",
            buttonText: "Get Started",
            href: "#",
            isPopular: false,
        },
        {
            name: "TEAM",
            price: "99",
            yearlyPrice: "79",
            period: "per month",
            features: [
                "Upto 5 users",
                "60 downloads per day per user",
                "Yearly update & access",
                "Use on personal & commercial projects",
                "Access to all present+future products",
                "Team collaboration",
                "Priority support"
            ],
            description: "Ideal for growing teams and businesses",
            buttonText: "Get Started",
            href: "#",
            isPopular: true,
        },
        {
            name: "ENTERPRISE",
            price: "299",
            yearlyPrice: "239",
            period: "per month",
            features: [
                "Unlimited Users",
                "Unlimited downloads per day per user",
                "Lifetime update & access",
                "Use on personal & commercial projects",
                "Access to all present+future products",
                "Dedicated account manager",
                "Custom solutions",
                "SLA agreement"
            ],
            description: "For large organizations with specific needs",
            buttonText: "Contact Sales",
            href: "#",
            isPopular: false,
        },
    ];

    // Custom button handler to integrate with existing functionality
    const plansWithHandlers = plans.map(plan => ({
        ...plan,
        href: plan.href,
        onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            if (plan.name !== 'ENTERPRISE') {
                handlePurchase(plan.name);
            } else {
                // Handle enterprise contact
                console.log('Contact sales for enterprise plan');
            }
        }
    }));

    return (
        <section id="pricing" className="py-20 bg-black border-t border-white/5">
            <AnimatedPricing
                plans={plansWithHandlers}
                title="Choose Your Plan"
                description="Select the perfect plan for your needs. All plans include lifetime updates and access to all products."
            />
        </section>
    );
};

export default Pricing;

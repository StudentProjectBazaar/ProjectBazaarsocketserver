import React from 'react';
import { useCart } from './DashboardPage';
import type { BuyerProject } from './BuyerProjectCard';

interface CartPageProps {
    allProjects: BuyerProject[];
}

const CartPage: React.FC<CartPageProps> = ({ allProjects }) => {
    const { cart, removeFromCart } = useCart();

    const cartProjects = allProjects.filter(p => cart.includes(p.id));

    const totalPrice = cartProjects.reduce((sum, project) => sum + project.price, 0);

    if (cartProjects.length === 0) {
        return (
            <div className="mt-8">
                <div className="text-center py-24 bg-white border border-gray-200 rounded-2xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-4 text-xl font-semibold text-gray-900">Your cart is empty</h3>
                    <p className="mt-2 text-sm text-gray-500">Add projects to your cart to get started.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
                <span className="text-sm text-gray-600">{cartProjects.length} item{cartProjects.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cartProjects.map((project) => (
                        <div key={project.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                            <div className="flex gap-4">
                                <img
                                    src={project.imageUrl}
                                    alt={project.title}
                                    className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.title}</h3>
                                            <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(project.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remove from cart"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex flex-wrap gap-2">
                                            {project.tags.slice(0, 2).map((tag) => (
                                                <span key={tag} className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-xl font-bold text-orange-600">${project.price.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal ({cartProjects.length} items)</span>
                                <span>${totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Tax</span>
                                <span>${(totalPrice * 0.1).toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-3">
                                <div className="flex justify-between text-lg font-bold text-gray-900">
                                    <span>Total</span>
                                    <span className="text-orange-600">${(totalPrice * 1.1).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
                            Proceed to Checkout
                        </button>
                        <button className="w-full mt-3 text-orange-600 font-medium py-2 px-4 rounded-xl hover:bg-orange-50 transition-colors">
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;


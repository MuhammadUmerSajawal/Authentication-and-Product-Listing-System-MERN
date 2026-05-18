import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { handleError, handleSuccess } from '../utils/toast';

const CheckoutPage = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);

    // Load order summary from localStorage with fallback calculations
    const [summary] = useState(() => {
        const saved = localStorage.getItem('checkout_summary');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                // fallback
            }
        }
        const subtotal = cartTotal;
        const baseDiscount = subtotal > 0 ? Math.round(subtotal * 0.2) : 0;
        const deliveryFee = subtotal > 0 ? 1 : 0;
        const total = subtotal - baseDiscount + deliveryFee;
        return {
            subtotal,
            baseDiscount,
            additionalDiscount: 0,
            deliveryFee,
            total,
            appliedCode: ''
        };
    });

    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        address: '',
        city: '',
        zipCode: '',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        
        if (cartItems.length === 0) {
            handleError("Your cart is empty");
            return;
        }

        setIsProcessing(true);

        try {
            const itemsToCheckout = cartItems.map(item => ({
                id: item._id,
                size: item.size,
                quantity: item.quantity
            }));

            const response = await fetch('http://localhost:8080/products/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items: itemsToCheckout })
            });

            const result = await response.json();

            if (result.success) {
                handleSuccess("Checkout successful! Items have been purchased.");
                clearCart();
                navigate('/dashboard');
            } else {
                handleError(result.message || "Checkout failed");
            }
        } catch (error) {
            handleError("An error occurred during checkout");
        } finally {
            setIsProcessing(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 bg-gray-50 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                    Return to Shop
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Checkout Form */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Checkout Details</h2>
                    <form onSubmit={handleCheckout} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input
                                required
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input
                                    required
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                                <input
                                    required
                                    type="text"
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                    <input
                                        required
                                        type="text"
                                        name="cardNumber"
                                        value={formData.cardNumber}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="0000 0000 0000 0000"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                        <input
                                            required
                                            type="text"
                                            name="expiryDate"
                                            value={formData.expiryDate}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="MM/YY"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                        <input
                                            required
                                            type="text"
                                            name="cvv"
                                            value={formData.cvv}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="123"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isProcessing}
                            className={`w-full mt-6 px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {isProcessing ? 'Processing...' : `Pay $${summary.total}`}
                        </button>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-fit sticky top-24">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
                    <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                        {cartItems.map((item) => (
                            <div key={`${item._id}-${item.size}`} className="flex items-center space-x-4 py-4 border-b border-gray-100">
                                <img src={`http://localhost:8080${item.images[0]}`} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                                    <p className="text-sm text-gray-500">Size: {item.size}</p>
                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                </div>
                                <p className="text-sm font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-gray-200 pt-4 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                            <p>Subtotal</p>
                            <p>${summary.subtotal}</p>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <p>Discount (-20%)</p>
                            <p>-${summary.baseDiscount}</p>
                        </div>
                        {summary.appliedCode && (
                            <div className="flex justify-between text-sm text-green-600 bg-green-50 p-2 rounded border border-green-100">
                                <p>Promo: {summary.appliedCode} (-10%)</p>
                                <p>-${summary.additionalDiscount}</p>
                            </div>
                        )}
                        <div className="flex justify-between text-sm text-gray-600">
                            <p>Shipping</p>
                            <p>${summary.deliveryFee}</p>
                        </div>
                        <div className="flex justify-between text-lg font-medium text-gray-900 pt-2 border-t border-gray-200">
                            <p>Total</p>
                            <p>${summary.total}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;

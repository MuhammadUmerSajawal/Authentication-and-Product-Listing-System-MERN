import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiTrash, HiMinus, HiPlus, HiArrowRight, HiShoppingBag, HiShieldCheck } from 'react-icons/hi2';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { handleSuccess } from '../utils/toast';
import { useCart } from '../context/CartContext';

const CartPage = () => {
    const navigate = useNavigate();
    const { cartItems, removeFromCart, updateQuantity: updateCartQuantity, cartTotal } = useCart();
    const [loggedInUser, setLoggedInUser] = useState('');
    const [loggedInEmail, setLoggedInEmail] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [promoInput, setPromoInput] = useState('');
    const [promoDiscount, setPromoDiscount] = useState(0); // Additional 10%
    const [appliedCode, setAppliedCode] = useState('');

    useEffect(() => {
        setLoggedInUser(localStorage.getItem('loggedInUser'));
        setLoggedInEmail(localStorage.getItem('loggedInEmail'));
    }, []);

    const updateQuantity = (id, size, delta) => {
        updateCartQuantity(id, size, delta);
    };

    const removeItem = (id, size) => {
        removeFromCart(id, size);
        handleSuccess('Item removed from cart');
    };

    const getImageUrl = (image) => {
        if (!image) return '/main.png';
        if (image.startsWith('http') || image.startsWith('/static')) return image;
        if (image.startsWith('/uploads')) return `http://localhost:8080${image}`;
        return image;
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('loggedInEmail');
        navigate('/login');
    };

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/dashboard');
        }
    };

    const handleApplyPromo = () => {
        const code = promoInput.trim().toUpperCase();
        if (code === 'SAVE10') {
            if (appliedCode === 'SAVE10') {
                handleSuccess('Promo code already applied!');
                return;
            }
            setPromoDiscount(0.1); // 10%
            setAppliedCode('SAVE10');
            handleSuccess('Promo code applied successfully! (10% OFF)');
        } else {
            handleSuccess('Invalid promo code. Try "SAVE10"');
        }
        setPromoInput('');
    };

    const subtotal = cartTotal;
    const baseDiscount = subtotal > 0 ? Math.round(subtotal * 0.2) : 0; // 20% base
    const additionalDiscount = subtotal > 0 ? Math.round(subtotal * promoDiscount) : 0; // Promo discount
    const deliveryFee = subtotal > 0 ? 1 : 0;
    const total = subtotal - baseDiscount - additionalDiscount + deliveryFee;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header 
                loggedInUser={loggedInUser} 
                loggedInEmail={loggedInEmail} 
                handleLogout={handleLogout} 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                hideSecondaryNav={true}
            />

            <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-3 text-sm text-gray-400 mb-8">
                    <button
                        onClick={handleBack}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-800 shadow-sm transition hover:bg-gray-100 border border-gray-100"
                    >
                        <HiArrowLeft size={20} />
                    </button>
                    <button onClick={() => navigate('/dashboard')} className="hover:text-black transition">Home</button>
                    <span>/</span>
                    <span className="text-black font-semibold">Cart</span>
                </nav>

                <h1 className="text-4xl font-black tracking-tight text-black mb-10">YOUR CART</h1>

                {cartItems.length > 0 ? (
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* Cart Items List */}
                        <div className="flex-1 w-full space-y-4 rounded-[20px] border border-gray-100 bg-white p-6 shadow-sm">
                            {cartItems.map((item, index) => (
                                <div key={`${item._id}-${item.size}`} className={`flex gap-4 sm:gap-6 py-6 ${index !== cartItems.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                                        <img src={getImageUrl(item.images?.[0])} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-base sm:text-xl font-bold text-black mb-1">{item.name}</h3>
                                                <p className="text-xs sm:text-sm text-gray-500 mb-1">Size: <span className="text-gray-800">{item.size}</span></p>
                                                {item.color && <p className="text-xs sm:text-sm text-gray-500">Color: <span className="text-gray-800">{item.color}</span></p>}
                                            </div>
                                            <button 
                                                onClick={() => removeItem(item._id, item.size)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"
                                            >
                                                <HiTrash size={20} />
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-end mt-4">
                                            <p className="text-xl sm:text-2xl font-bold text-black">${item.price}</p>
                                            
                                            <div className="flex items-center gap-4 bg-gray-100 rounded-full px-4 py-2">
                                                <button 
                                                    onClick={() => updateQuantity(item._id, item.size, -1)}
                                                    className="text-black hover:scale-110 transition active:scale-90"
                                                >
                                                    <HiMinus size={16} />
                                                </button>
                                                <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item._id, item.size, 1)}
                                                    className="text-black hover:scale-110 transition active:scale-90"
                                                >
                                                    <HiPlus size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="w-full lg:w-[450px] space-y-6">
                            <div className="rounded-[20px] border border-gray-100 bg-white p-8 shadow-sm">
                                <h2 className="text-2xl font-bold text-black mb-8">Order Summary</h2>
                                
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-lg">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="text-black font-bold">${subtotal}</span>
                                    </div>
                                    <div className="flex justify-between text-lg">
                                        <span className="text-gray-500">Discount (-20%)</span>
                                        <span className="text-red-500 font-bold">-${baseDiscount}</span>
                                    </div>
                                    {appliedCode && (
                                        <div className="flex justify-between text-lg bg-green-50 p-2 rounded-lg border border-green-100">
                                            <span className="text-green-600 font-medium">Promo: {appliedCode} (-10%)</span>
                                            <span className="text-green-600 font-bold">-${additionalDiscount}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg">
                                        <span className="text-gray-500">Delivery Fee</span>
                                        <span className="text-black font-bold">${deliveryFee}</span>
                                    </div>
                                </div>
                                
                                <div className="border-t border-gray-100 pt-6 mb-8">
                                    <div className="flex justify-between text-xl">
                                        <span className="text-black font-bold">Total</span>
                                        <span className="text-black font-extrabold text-2xl">${total}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3 mb-4">
                                    <div className="flex-1 relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <HiShoppingBag size={18} />
                                        </div>
                                        <input 
                                            type="text" 
                                            placeholder="Add promo code" 
                                            value={promoInput}
                                            onChange={(e) => setPromoInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
                                            className="w-full bg-gray-50 border-none rounded-full py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-black transition"
                                        />
                                    </div>
                                    <button 
                                        onClick={handleApplyPromo}
                                        className="bg-black text-white px-8 rounded-full font-bold hover:bg-gray-800 transition"
                                    >
                                        Apply
                                    </button>
                                </div>

                                <button 
                                    onClick={() => {
                                        localStorage.setItem('checkout_summary', JSON.stringify({
                                            subtotal,
                                            baseDiscount,
                                            additionalDiscount,
                                            deliveryFee,
                                            total,
                                            appliedCode
                                        }));
                                        navigate('/checkout');
                                    }}
                                    className="w-full bg-black text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition shadow-lg shadow-black/10"
                                >
                                    Go to Checkout
                                    <HiArrowRight size={20} />
                                </button>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                                <HiShieldCheck size={18} />
                                <span>Secure Checkout | Powered by Stripe</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[20px] border border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
                            <HiShoppingBag size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-black mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 bg-black text-white px-10 py-4 rounded-full font-bold hover:bg-gray-800 transition"
                        >
                            <HiArrowLeft size={18} />
                            Continue Shopping
                        </button>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default CartPage;

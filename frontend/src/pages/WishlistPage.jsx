import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiTrash, HiShoppingBag, HiHeart, HiStar } from 'react-icons/hi2';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { handleSuccess, handleError } from '../utils/toast';
import { useCart } from '../context/CartContext';

const WishlistPage = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [loggedInUser, setLoggedInUser] = useState('');
    const [loggedInEmail, setLoggedInEmail] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [wishlistItems, setWishlistItems] = useState([]);

    useEffect(() => {
        setLoggedInUser(localStorage.getItem('loggedInUser'));
        setLoggedInEmail(localStorage.getItem('loggedInEmail'));
        
        const fetchWishlistData = async () => {
            const storedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
            if (storedWishlist.length === 0) return;

            try {
                // Fetch all products to get fresh data (rating, price, etc.)
                const response = await fetch('http://localhost:8080/products', {
                    headers: {
                        'Authorization': localStorage.getItem('token')
                    }
                });
                const result = await response.json();
                
                if (result.success) {
                    const freshData = result.data.filter(p => 
                        storedWishlist.some(item => item._id === p._id)
                    );
                    setWishlistItems(freshData);
                    // Update localStorage with fresh data to keep it in sync
                    localStorage.setItem('wishlist', JSON.stringify(freshData));
                }
            } catch (error) {
                console.error('Error fetching fresh wishlist data:', error);
                // Fallback to stored data if fetch fails
                setWishlistItems(storedWishlist);
            }
        };

        fetchWishlistData();
    }, []);

    const removeItem = (id) => {
        const updated = wishlistItems.filter(item => item._id !== id);
        setWishlistItems(updated);
        localStorage.setItem('wishlist', JSON.stringify(updated));
        handleSuccess('Removed from wishlist');
    };

    const handleAddToCart = (product) => {
        // Find first available size or default to 'S'
        const firstSize = product.sizes?.find(s => s.stock > 0)?.size || 'S';
        addToCart(product, firstSize);
        handleSuccess(`Added ${product.name} (Size: ${firstSize}) to cart!`);
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

    const getImageUrl = (image) => {
        if (!image) return '/main.png';
        if (image.startsWith('http') || image.startsWith('/static')) return image;
        if (image.startsWith('/uploads')) return `http://localhost:8080${image}`;
        return image;
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header 
                loggedInUser={loggedInUser} 
                loggedInEmail={loggedInEmail} 
                handleLogout={handleLogout} 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />

            <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <nav className="flex items-center gap-3 text-sm text-gray-400 mb-8">
                    <button
                        onClick={handleBack}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-800 shadow-sm transition hover:bg-gray-100 border border-gray-100"
                    >
                        <HiArrowLeft size={20} />
                    </button>
                    <button onClick={() => navigate('/dashboard')} className="hover:text-black transition">Home</button>
                    <span>/</span>
                    <span className="text-black font-semibold">Wishlist</span>
                </nav>

                <div className="flex items-center gap-3 mb-10">
                    <h1 className="text-4xl font-black tracking-tight text-black">MY WISHLIST</h1>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-xs font-bold">
                        {wishlistItems.length}
                    </div>
                </div>

                {wishlistItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlistItems.map((item) => (
                            <div key={item._id} className="group relative flex flex-col bg-white rounded-[24px] border border-gray-100 p-3 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                                {/* Product Image */}
                                <div 
                                    className="relative aspect-[4/5] w-full overflow-hidden rounded-[18px] bg-gray-50 cursor-pointer"
                                    onClick={() => navigate(`/productpage/${item._id}`)}
                                >
                                    <img 
                                        src={getImageUrl(item.images?.[0])} 
                                        alt={item.name} 
                                        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                                    />
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeItem(item._id);
                                        }}
                                        className="absolute top-3 right-3 h-10 w-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-red-500 shadow-sm hover:bg-red-500 hover:text-white transition-all duration-300"
                                    >
                                        <HiTrash size={18} />
                                    </button>
                                </div>

                                {/* Product Info */}
                                <div className="mt-4 px-2 pb-2">
                                    <div className="flex items-center gap-1 text-yellow-400 mb-2">
                                        <HiStar size={14} className="fill-current" />
                                        <span className="text-xs font-bold text-gray-800">{(item.averageRating || 0).toFixed(1)}</span>
                                        <span className="text-xs font-medium text-gray-400">({item.totalReviews || 0})</span>
                                    </div>
                                    <h3 
                                        className="text-base font-bold text-gray-900 line-clamp-1 cursor-pointer hover:text-black"
                                        onClick={() => navigate(`/productpage/${item._id}`)}
                                    >
                                        {item.name}
                                    </h3>
                                    <p className="text-xs font-medium text-gray-400 mb-3">{item.category}</p>
                                    
                                    <div className="flex items-center justify-between">
                                        <p className="text-xl font-black text-black">PKR {item.price}</p>
                                        <button 
                                            onClick={() => handleAddToCart(item)}
                                            className="h-10 w-10 flex items-center justify-center rounded-full bg-[#1f1f1f] text-white hover:bg-black hover:scale-110 transition-all shadow-md shadow-black/10"
                                        >
                                            <HiShoppingBag size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[32px] border border-dashed border-gray-200">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-8 animate-bounce">
                            <HiHeart size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-black mb-3">Your wishlist is empty</h2>
                        <p className="text-gray-500 mb-10 max-w-xs text-center">Save items you love here to find them again easily!</p>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 bg-black text-white px-10 py-4 rounded-full font-bold hover:bg-gray-800 transition-all shadow-lg shadow-black/10 active:scale-95"
                        >
                            <HiArrowLeft size={18} />
                            Back to Shopping
                        </button>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default WishlistPage;

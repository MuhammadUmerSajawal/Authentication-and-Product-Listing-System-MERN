import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    HiArrowLeft, HiChevronUp, HiHeart, HiShoppingBag, HiStar, HiTruck, HiBell, HiPencilSquare, HiChevronRight
}
    from 'react-icons/hi2';
import { handleSuccess, handleError } from '../utils/toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { slugify } from '../utils/slugify';

const defaultSizes = ['S', 'M', 'L', 'XL', 'XXL'].map((size) => ({ size, stock: 0 }));
const shippingItems = [
    { label: 'Discount', value: 'Disc 50%' },
    { label: 'Package', value: 'Regular Package' },
    { label: 'Delivery Time', value: '3-4 Working Days' },
    // { label: 'Estimate Arrival', value: '10-12 October 2024' },
];

function ProductPage() {
    const navigate = useNavigate();
    const { productName } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(Boolean(productName));
    const [errorMessage, setErrorMessage] = useState('');
    const [reviews, setReviews] = useState([]);
    const [userRating, setUserRating] = useState(5);
    const [userComment, setUserComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loggedInUser, setLoggedInUser] = useState('');
    const [loggedInEmail, setLoggedInEmail] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setLoggedInUser(localStorage.getItem('loggedInUser'));
        setLoggedInEmail(localStorage.getItem('loggedInEmail'));
        if (!productName) return;

        const fetchProduct = async () => {
            try {
                const response = await fetch(`http://localhost:8080/products/${productName}`);
                const result = await response.json();

                if (result.success) {
                    setProduct(result.data);
                } else {
                    setErrorMessage(result.message || 'Unable to load product');
                }
            } catch (error) {
                setErrorMessage('Unable to connect to the server');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [productName]);

    const fetchReviews = async () => {
        if (!product?._id) return;
        try {
            const response = await fetch(`http://localhost:8080/reviews/${product._id}`);
            const result = await response.json();
            if (result.success) {
                setReviews(result.data);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [product?._id]);

    useEffect(() => {
        if (!product?._id) return;

        const fetchRelatedProducts = async () => {
            try {
                const response = await fetch(`http://localhost:8080/products/related/${product._id}`);
                const result = await response.json();
                if (result.success) {
                    setRelatedProducts(result.data);
                }
            } catch (error) {
                console.error("Error fetching related products:", error);
            }
        };

        fetchRelatedProducts();
    }, [product]);

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/dashboard');
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (!loggedInUser) {
            handleError("Please login to add a review");
            return;
        }

        setIsSubmittingReview(true);
        try {
            const response = await fetch('http://localhost:8080/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product._id,
                    userName: loggedInUser,
                    rating: userRating,
                    comment: userComment
                })
            });
            const result = await response.json();
            if (result.success) {
                handleSuccess("Review added successfully!");
                setUserComment('');
                setUserRating(5);
                setShowReviewForm(false);
                fetchReviews();
                // Optionally re-fetch product to get updated averageRating
                const prodResponse = await fetch(`http://localhost:8080/products/${productName}`);
                const prodResult = await prodResponse.json();
                if (prodResult.success) setProduct(prodResult.data);
            } else {
                handleError(result.message);
            }
        } catch (error) {
            handleError("Unable to submit review");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleNotifyMe = () => {
        handleSuccess(`Notification set! We'll alert you when size ${selectedSize} is back in stock.`);
    };

    const nextReview = () => {
        setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
    };

    const prevReview = () => {
        setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('loggedInEmail');
        handleSuccess("Logout successful");
        setTimeout(() => {
            navigate('/login');
        }, 1000)
    };

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product, selectedSize);
        handleSuccess(`Added size ${selectedSize} to your cart!`);
    };

    const getImageUrl = (image) => {
        if (!image) return '/main.png';
        if (image.startsWith('http') || image.startsWith('/static')) return image;
        if (image.startsWith('/uploads')) return `http://localhost:8080${image}`;
        return image;
    };

    const productImages = product?.images?.length ? product.images : ['/main.png'];
    const mainImage = getImageUrl(productImages[0]);
    const thumbnailImages = productImages
        .slice(1)
        .filter((image, index, images) => image !== productImages[0] && images.indexOf(image) === index)
        .slice(0, 3);

    const [selectedSize, setSelectedSize] = useState('S');
    const [isWishlisted, setIsWishlisted] = useState(false);
    const productSizes = useMemo(() => (
        product?.sizes?.length ? product.sizes : defaultSizes
    ), [product]);
    const selectedSizeStock = productSizes.find((item) => item.size === selectedSize)?.stock || 0;

    useEffect(() => {
        if (!product) return;

        const firstAvailableSize = productSizes.find((item) => Number(item.stock) > 0) || productSizes[0];
        setSelectedSize(firstAvailableSize?.size || '');

        // Check if current product is in wishlist
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setIsWishlisted(wishlist.some(item => item._id === product._id));
    }, [product, productSizes]);

    const toggleWishlist = () => {
        if (!product) return;
        
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const isCurrentlyWishlisted = wishlist.some(item => item._id === product._id);

        let updatedWishlist;
        if (isCurrentlyWishlisted) {
            updatedWishlist = wishlist.filter(item => item._id !== product._id);
            handleSuccess("Removed from wishlist");
        } else {
            updatedWishlist = [...wishlist, product];
            handleSuccess("Added to wishlist!");
        }

        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        setIsWishlisted(!isCurrentlyWishlisted);
    };

    if (isLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-4 text-[#1f1f1f]">
                <p className="m-0 rounded-full bg-white px-5 py-3 text-sm font-semibold shadow-sm">Loading product...</p>
            </main>
        );
    }

    if (errorMessage) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-4 text-[#1f1f1f]">
                <div className="rounded-[18px] bg-white p-6 text-center shadow-sm">
                    <p className="mb-4 text-sm font-semibold text-red-500">{errorMessage}</p>
                    <button
                        type="button"
                        onClick={handleBack}
                        className="rounded-full bg-[#1f1f1f] px-5 py-2 text-sm font-semibold text-white"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </main>
        );
    }

    return (
        <div className="min-h-screen w-full bg-slate-50">
            <Header 
                loggedInUser={loggedInUser} 
                loggedInEmail={loggedInEmail} 
                handleLogout={handleLogout} 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />
            <main className="w-full px-3 py-5 text-[#1f1f1f] sm:px-5 lg:px-6 xl:px-8">
                <div className="mx-auto w-full max-w-[1600px]">
                    <nav className="mb-5 flex items-center gap-2 text-xs font-medium text-gray-500">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-800 shadow-sm transition hover:bg-gray-100"
                    >
                        <HiArrowLeft size={17} />
                    </button>
                    <span>Home</span>
                    <span>/</span>
                    <span className="text-gray-800">Product details</span>
                </nav>

                <section className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1.18fr)_minmax(420px,0.82fr)] lg:items-start">
                    <div className="relative overflow-hidden rounded-[18px] bg-white shadow-sm">
                        <img
                            src={mainImage}
                            alt={product?.name || 'Product image'}
                            className="h-[560px] w-full object-cover object-top sm:h-[650px] xl:h-[720px]"
                        />

                        <div className="absolute left-4 right-4 top-4 h-1 rounded-full bg-white/25">
                            <div className="mx-auto h-1 w-28 rounded-full bg-white" />
                        </div>

                        {thumbnailImages.length > 0 && (
                            <div className={`absolute bottom-4 left-4 right-4 grid gap-3 ${thumbnailImages.length === 1 ? 'grid-cols-1' : thumbnailImages.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                                {thumbnailImages.map((src, index) => (
                                    <button
                                        key={`${src}-${index}`}
                                        className="h-36 overflow-hidden rounded-[14px] border border-white bg-white shadow-sm transition hover:border-[#1f1f1f] sm:h-44 xl:h-52"
                                    >
                                        <img src={getImageUrl(src)} alt={`${product?.name || 'Product'} preview`} className="h-full w-full object-contain" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <span className="inline-flex rounded-full border border-gray-200 bg-white px-8 py-2 text-xs font-semibold text-gray-700">
                                {product?.category || 'General'}
                            </span>
                            <h1 className="mb-0 mt-4 text-3xl font-semibold tracking-normal text-[#1f1f1f] sm:text-4xl">
                                {product?.name || 'Product'}
                            </h1>
                            <p className="mb-0 mt-3 text-2xl font-bold">${product?.price || '0'}</p>
                            {product?.createdBy && (
                                <p className="mb-0 mt-2 text-sm font-medium text-gray-500">By {product.createdBy}</p>
                            )}
                        </div>

                        {/* <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600">
                            <HiInformationCircle size={17} className="text-gray-900" />
                            Order in 02:30:25 to get next day delivery
                        </div> */}

                        <div>
                            <p className="mb-3 text-sm font-medium text-gray-500">Select Size</p>
                            <div className="grid grid-cols-5 gap-3">
                                {productSizes.map((item) => {
                                    const isOutOfStock = Number(item.stock) <= 0;
                                    const isLowStock = !isOutOfStock && Number(item.stock) < 5;

                                    return (
                                        <button
                                            key={item.size}
                                            type="button"
                                            onClick={() => setSelectedSize(item.size)}
                                            title={isOutOfStock ? 'Out of stock' : `${item.stock} in stock`}
                                            className={`relative h-14 rounded-full text-sm font-semibold transition overflow-hidden
                                            ${selectedSize === item.size
                                                    ? 'bg-[#1f1f1f] text-white shadow-md'
                                                    : 'bg-white text-gray-500 hover:text-gray-900 hover:bg-gray-50 shadow-sm'
                                                }
                                            ${isOutOfStock ? 'opacity-40' : ''}
                                        `}
                                        >
                                            {item.size}
                                            {isOutOfStock && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <div className="w-[60%] h-[1.5px] bg-current opacity-60 -rotate-45" />
                                                </div>
                                            )}
                                            {isLowStock && (
                                                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            {selectedSize && (
                                <p className={`mb-0 mt-2 text-xs font-medium transition-colors duration-300 ${selectedSizeStock > 0
                                        ? (selectedSizeStock < 5 ? 'text-orange-500' : 'text-emerald-600')
                                        : 'text-red-500'
                                    }`}>
                                    {selectedSizeStock > 0
                                        ? (selectedSizeStock < 5
                                            ? `Only ${selectedSizeStock} left - order soon!`
                                            : `In stock (${selectedSizeStock} units)`)
                                        : 'Currently out of stock. We can notify you when it returns!'}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={selectedSizeStock > 0 ? handleAddToCart : handleNotifyMe}
                                disabled={!selectedSize}
                                className={`flex h-14 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-300 active:scale-[0.98]
                                    ${selectedSizeStock > 0
                                        ? 'bg-[#1f1f1f] text-white hover:bg-black shadow-lg shadow-black/5'
                                        : 'bg-white border-2 border-[#1f1f1f] text-[#1f1f1f] hover:bg-gray-50'
                                    }
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                            >
                                {selectedSizeStock > 0 ? (
                                    <>
                                        <HiShoppingBag size={18} />
                                        Add to Cart
                                    </>
                                ) : (
                                    <>
                                        <HiBell size={18} className="animate-pulse" />
                                        Notify Me
                                    </>
                                )}
                            </button>
                            <button
                                onClick={toggleWishlist}
                                className={`flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm transition ${isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <HiHeart size={20} className={isWishlisted ? 'fill-current' : ''} />
                            </button>
                        </div>

                        <article className="rounded-[18px] border border-gray-200 bg-white px-5 py-4 shadow-sm">
                            <div className="mb-3 flex items-center justify-between">
                                <h2 className="m-0 text-base font-semibold">Description & Fit</h2>
                                <HiChevronUp size={18} />
                            </div>
                            <p className="m-0 text-sm leading-6 text-gray-500">
                                {product?.description || 'No description available for this product.'}
                            </p>
                        </article>

                        <article className="rounded-[18px] border border-gray-200 bg-white px-5 py-4 shadow-sm">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="m-0 text-base font-semibold">Shipping</h2>
                                <HiChevronUp size={18} />
                            </div>
                            <div className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
                                {shippingItems.map((item) => (
                                    <div key={item.label} className="grid grid-cols-[38px_1fr] items-center gap-3">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
                                            <HiTruck size={16} />
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block text-xs leading-tight text-gray-400">{item.label}</span>
                                            <span className="mt-1 block truncate text-sm font-semibold leading-tight">{item.value}</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </article>
                    </div>
                </section>

                <section className="mt-16">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-semibold sm:text-3xl">Rating & Reviews</h2>
                        <button 
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-semibold transition hover:bg-gray-50"
                        >
                            <HiPencilSquare size={18} />
                            Write a review
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr]">
                        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-10">
                            <div>
                                <div className="flex items-end">
                                    <span className="text-9xl font-semibold leading-none">{(product?.averageRating || 0).toString().replace('.', ',')}</span>
                                    <span className="mb-4 text-2xl font-semibold text-gray-400">/5</span>
                                </div>
                                <p className="mt-4 text-sm text-gray-400">({product?.totalReviews || 0} New Reviews)</p>
                            </div>

                            <div className="flex-1 w-full space-y-3">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = reviews.filter(r => Math.round(r.rating) === star).length;
                                    const percentage = product?.totalReviews > 0 ? (count / product.totalReviews) * 100 : 0;
                                    return (
                                        <div key={star} className="grid grid-cols-[38px_1fr] items-center gap-4">
                                            <span className="flex items-center gap-1 text-sm font-semibold">
                                                <HiStar size={15} className="text-yellow-400" />
                                                {star}
                                            </span>
                                            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                                <div className="h-full bg-[#1f1f1f] transition-all duration-500" style={{ width: `${percentage}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="relative">
                            {showReviewForm && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-300">
                                    <div 
                                        className="fixed inset-0" 
                                        onClick={() => setShowReviewForm(false)} 
                                    />
                                    <form 
                                        onSubmit={handleReviewSubmit} 
                                        className="relative w-full max-w-[500px] flex flex-col rounded-[32px] border border-gray-100 bg-white p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500"
                                    >
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-2xl font-bold tracking-tight text-[#1f1f1f]">What's your rate?</h3>
                                            <button 
                                                type="button" 
                                                onClick={() => setShowReviewForm(false)} 
                                                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-black"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        
                                        <div className="mb-8 text-center">
                                            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">Overall Rating</p>
                                            <div className="flex justify-center gap-3">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onMouseEnter={() => setUserRating(star)}
                                                        onClick={() => setUserRating(star)}
                                                        className="group relative transition-transform hover:scale-125 active:scale-90"
                                                    >
                                                        <HiStar size={44} className={star <= userRating ? 'text-yellow-400 fill-current drop-shadow-sm' : 'text-gray-100'} />
                                                        {star <= userRating && (
                                                            <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-yellow-400" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mb-8 flex flex-col">
                                            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-400">Your Review</label>
                                            <textarea
                                                required
                                                value={userComment}
                                                onChange={(e) => setUserComment(e.target.value)}
                                                className="min-h-[160px] w-full resize-none rounded-[24px] border border-gray-100 bg-gray-50/50 p-5 text-sm leading-relaxed outline-none focus:border-[#1f1f1f] focus:bg-white transition-all shadow-inner"
                                                placeholder="Describe your experience with this product..."
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmittingReview}
                                            className="w-full rounded-full bg-[#1f1f1f] py-4 text-sm font-bold text-white transition-all hover:bg-black hover:shadow-xl active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-black/10"
                                        >
                                            {isSubmittingReview ? 'Sending Review...' : 'Submit Review'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            <div className="space-y-4">
                                {reviews.length > 0 ? (
                                    <div className="relative group">
                                        <article className="rounded-[24px] border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md">
                                            <div className="flex items-start justify-between gap-4 mb-6">
                                                <div>
                                                    <h3 className="text-lg font-bold text-[#1f1f1f]">{reviews[currentReviewIndex].userName}</h3>
                                                    <div className="mt-1.5 flex text-yellow-400">
                                                        {Array.from({ length: 5 }).map((_, index) => (
                                                            <HiStar key={index} size={18} className={index < reviews[currentReviewIndex].rating ? 'fill-current' : 'text-gray-100'} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                    {new Date(reviews[currentReviewIndex].createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>

                                            <p className="text-sm leading-7 text-gray-500 italic min-h-[80px]">
                                                "{reviews[currentReviewIndex].comment}"
                                            </p>

                                            <div className="mt-8 flex items-center gap-4">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 overflow-hidden shadow-inner">
                                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-700 to-black text-sm font-bold text-white uppercase">
                                                        {reviews[currentReviewIndex].userName.slice(0, 2)}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="h-1.5 w-16 rounded-full bg-[#1f1f1f]" />
                                                    <div className="h-1 w-10 rounded-full bg-gray-100" />
                                                </div>
                                            </div>

                                            {reviews.length > 1 && (
                                                <button 
                                                    onClick={nextReview}
                                                    className="absolute -right-5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-400 shadow-lg transition-all hover:scale-110 hover:text-black active:scale-95"
                                                >
                                                    <HiChevronRight size={20} />
                                                </button>
                                            )}
                                        </article>

                                        {reviews.length > 1 && (
                                            <div className="mt-8 flex justify-center gap-2">
                                                {reviews.map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setCurrentReviewIndex(i)}
                                                        className={`h-1 transition-all duration-300 rounded-full ${i === currentReviewIndex ? 'w-8 bg-[#1f1f1f]' : 'w-4 bg-gray-200 hover:bg-gray-300'}`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-gray-200 bg-gray-50/50 py-16 px-8 text-center">
                                        <p className="text-sm font-medium text-gray-400">No reviews yet. Be the first to share your thoughts!</p>
                                        <button 
                                            onClick={() => setShowReviewForm(true)}
                                            className="mt-4 text-xs font-bold text-[#1f1f1f] underline underline-offset-4"
                                        >
                                            Write the first review
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {relatedProducts.length > 0 && (
                    <section className="mt-16">
                        <h2 className="mb-8 text-center text-3xl font-semibold sm:text-4xl">You might also like</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {relatedProducts.map((item) => (
                                <button
                                    key={item._id}
                                    type="button"
                                    onClick={() => {
                                        navigate(`/products/${slugify(item.name)}`);
                                        window.scrollTo(0, 0);
                                    }}
                                    className="group flex flex-col items-start bg-transparent p-0 text-left"
                                >
                                    <div className="relative mb-4 aspect-[3/4] w-full overflow-hidden rounded-[18px] bg-white shadow-sm">
                                        <img
                                            src={getImageUrl(item.images?.[0])}
                                            alt={item.name}
                                            className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <h3 className="mb-1 text-sm font-semibold text-[#1f1f1f] line-clamp-1">{item.name}</h3>
                                    <div className="flex items-center gap-1 text-yellow-400 mb-2">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <HiStar key={i} size={14} className={i < 4 ? 'fill-current' : 'fill-current opacity-30'} />
                                        ))}
                                        <span className="ml-1 text-xs font-semibold text-gray-400">4.0/5</span>
                                    </div>
                                    <p className="m-0 text-sm font-bold">${item.price}</p>
                                </button>
                            ))}
                        </div>
                    </section>
                )}
            </div>
            </main>
            <Footer />
        </div>
    );
}

export default ProductPage;

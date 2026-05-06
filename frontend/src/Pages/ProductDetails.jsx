import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { handleError } from '../utils/toast';
import { HiArrowLeft, HiShoppingBag, HiUserCircle, HiTag } from 'react-icons/hi2';

function ProductDetails() {
    const { productName } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`http://localhost:8080/products/${productName}`);
                const result = await response.json();

                if (result.success) {
                    setProduct(result.data);
                } else {
                    setErrorMessage(result.message || 'Failed to fetch product');
                }
            } catch (error) {
                handleError('Unable to connect to the server');
                setErrorMessage('Unable to connect to the server');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [productName]);

    const getCollapsedDescription = (text, limit = 18) => {
        if (!text) return '------------';
        const words = text.trim().split(/\s+/);
        if (words.length <= limit) return text;
        return `${words.slice(0, limit).join(' ')} .....`;
    };

    return (
        <div className="min-h-screen w-full bg-[#f4f4f4] px-4 py-6 text-[#262a33] sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="inline-flex h-11 items-center gap-2 rounded-[8px] bg-white px-4 text-sm font-semibold text-[#5d6472] shadow-[0_10px_30px_rgba(20,25,35,0.08)] transition hover:text-[#3267ff]"
                    >
                        <HiArrowLeft size={18} />
                        Back to Dashboard
                    </button>
                </div>

                <div className="overflow-hidden rounded-[8px] bg-white shadow-[0_18px_45px_rgba(25,31,44,0.08)]">
                    {isLoading && (
                        <div className="flex min-h-[420px] items-center justify-center px-6 py-12">
                            <p className="m-0 text-lg font-semibold text-[#9aa2af]">Loading product...</p>
                        </div>
                    )}

                    {!isLoading && errorMessage && (
                        <div className="flex min-h-[420px] items-center justify-center px-6 py-12">
                            <p className="m-0 rounded-[8px] bg-[#fff1f0] px-5 py-3 text-base font-semibold text-red-500">{errorMessage}</p>
                        </div>
                    )}

                    {!isLoading && product && (
                        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr]">
                            <div className="border-b border-[#edf0f4] bg-[#fbfcfd] p-6 lg:border-b-0 lg:border-r">
                                <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[8px] border border-[#edf0f4] bg-white p-8 text-center">
                                    <span className="mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-[#eaf0ff] text-5xl font-bold text-[#3267ff]">
                                        {product.name?.charAt(0)?.toUpperCase() || 'P'}
                                    </span>
                                    <p className="m-0 max-w-[280px] break-words text-2xl font-bold leading-tight text-[#323743]">
                                        {product.name}
                                    </p>
                                    <p className="m-0 mt-3 text-sm font-semibold text-[#9aa2af]">
                                        #{product._id?.slice(-8).toUpperCase()}
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 sm:p-8 lg:p-10">
                                <div className="mb-7">
                                    <p className="mb-2 inline-flex items-center rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-bold uppercase text-[#3267ff]">
                                        Product Detail
                                    </p>
                                    <h1 className="m-0 max-w-3xl break-words text-3xl font-bold leading-tight text-[#252934] sm:text-4xl">
                                        {product.name}
                                    </h1>
                                </div>

                                <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="rounded-[8px] border border-[#edf0f4] bg-[#fbfcfd] p-4">
                                        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#9aa2af]">
                                            <HiTag size={18} />
                                            Price
                                        </p>
                                        <p className="m-0 text-2xl font-bold text-[#3267ff]">
                                            {product.price ? `$${product.price}` : '----'}
                                        </p>
                                    </div>

                                    <div className="rounded-[8px] border border-[#edf0f4] bg-[#fbfcfd] p-4">
                                        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#9aa2af]">
                                            <HiUserCircle size={18} />
                                            Product by
                                        </p>
                                        <p className="m-0 truncate text-2xl font-bold text-[#323743]">
                                            {product.createdBy || '------'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-8 rounded-[8px] border border-[#edf0f4] bg-white p-5">
                                    <p className="mb-3 text-sm font-bold uppercase text-[#9aa2af]">Description</p>
                                    <p className="m-0 whitespace-pre-line text-base font-medium leading-7 text-[#606875]">
                                        {isDescriptionExpanded ? (product.description || '------------') : getCollapsedDescription(product.description)}
                                    </p>
                                    {product.description && product.description.trim().split(/\s+/).length > 18 && (
                                        <button
                                            type="button"
                                            onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                                            className="mt-3 border-0 bg-transparent p-0 text-sm font-bold text-[#3267ff] transition hover:text-[#2556dc]"
                                        >
                                            {isDescriptionExpanded ? 'Show less' : 'Show more'}
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-[#3267ff] px-6 text-sm font-bold text-white shadow-[0_10px_24px_rgba(50,103,255,0.25)] transition hover:bg-[#2556dc]"
                                >
                                    <HiShoppingBag size={19} />
                                    Buy it Now
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductDetails;

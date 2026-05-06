import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { handleError } from '../utils/toast';

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
        <div className="min-h-screen w-full bg-[#eef1f4] p-0">
            <div className="min-h-screen border-[3px] border-[#4a86e8] p-4 sm:p-6 md:p-8">
                <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="mb-8 inline-block rounded-[4px] border border-[#4a86e8] bg-white px-4 py-2 text-[14px] font-semibold text-[#4a86e8] hover:bg-[#f3f8ff]"
                >
                    Back to Dashboard
                </button>

                <div className="mx-auto grid max-w-[1220px] grid-cols-1 gap-8 md:grid-cols-[420px_1fr] md:gap-12">
                    <div className="flex h-[460px] items-center justify-center border-[3px] border-[#4a86e8] bg-[#ceb7d8] px-6">
                        <p className="m-0 text-center text-[34px] font-normal tracking-wide text-[#4a86e8]">
                            {product?.name || 'Product Name'}
                        </p>
                    </div>

                    <div className="pt-2">
                        {isLoading && (
                            <p className="m-0 text-[24px] font-normal text-[#4a86e8]">Loading product...</p>
                        )}

                        {!isLoading && errorMessage && (
                            <p className="m-0 text-[20px] font-normal text-red-600">{errorMessage}</p>
                        )}

                        {!isLoading && product && (
                            <div>
                                <h1 className="m-0 mb-5 text-[42px] font-bold leading-[1.08] tracking-wide text-[#4a86e8]">
                                    {product.name}
                                </h1>
                                <p className="m-0 mb-2 text-[28px] font-bold leading-tight text-[#bb6ed6]">
                                    Price: {product.price ? `$${product.price}` : '----'}
                                </p>
                                <p className="m-0 mb-6 text-[28px] font-bold leading-tight text-[#bb6ed6]">
                                    Product by: {product.createdBy || '------'}
                                </p>

                                <div className="mb-8 max-w-[760px]">
                                    <p className="m-0 whitespace-pre-line text-[22px] font-normal leading-tight text-[#4a86e8]">
                                        {`Desc: ${isDescriptionExpanded ? (product.description || '------------') : getCollapsedDescription(product.description)}`}
                                    </p>
                                    {product.description && product.description.trim().split(/\s+/).length > 18 && (
                                        <button
                                            type="button"
                                            onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                                            className="mt-2 border-0 bg-transparent p-0 text-[16px] font-semibold text-[#4a86e8] underline hover:text-[#3f78d3]"
                                        >
                                            {isDescriptionExpanded ? 'Show less' : 'Show more'}
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    className="inline-block rounded-[6px] border border-[#4a86e8] bg-[#4a86e8] px-8 py-3 text-[32px] font-normal text-[#dfc8e6] shadow-sm hover:bg-[#3f78d3]"
                                >
                                    Buy it Now
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetails;

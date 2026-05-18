import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import { Modal, Form } from 'react-bootstrap';
import { handleSuccess, handleError } from '../utils/toast';
import { slugify } from '../utils/slugify';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { HiOutlineTrash, HiBars3, HiSquares2X2, HiPlus, HiArrowRightOnRectangle, HiEye, HiMagnifyingGlass, HiChevronDown, HiPencilSquare, HiShoppingBag, HiStar } from 'react-icons/hi2';

const defaultSizes = ['S', 'M', 'L', 'XL', 'XXL'];
const createEmptySizes = () => defaultSizes.map((size) => ({ size, stock: 0 }));

function Dashboard() {
    const [loggedInUser, setLoggedInUser] = useState('');
    const [products, setProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);              //used for showing the modal when the user clicks on add product button or edit product button
    const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', images: [], sizes: createEmptySizes(), category: '', subCategory: '' });
    const [editingProduct, setEditingProduct] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [loggedInEmail, setLoggedInEmail] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const navigate = useNavigate();
    const truncateDescription = (text, limit = 8) => {
        if (!text) return '.....';
        const words = text.trim().split(/\s+/);
        if (words.length <= limit) return text;
        return `${words.slice(0, limit).join(' ')} .....`;
    };

    const getProductTone = (index) => {
        const tones = [
            'bg-[#fff1f0] text-[#d04c3f]',
            'bg-[#eef8e9] text-[#5f9f35]',
            'bg-[#fff5dc] text-[#c6821c]',
            'bg-[#edf4ff] text-[#3d73d9]',
            'bg-[#f7ebff] text-[#9255c8]',
        ];

        return tones[index % tones.length];
    };

    const getProductImageUrl = (product) => {
        const image = product.images?.[0];
        if (!image) return '';
        if (image.startsWith('http') || image.startsWith('/static')) return image;
        if (image.startsWith('/uploads')) return `http://localhost:8080${image}`;
        return image;
    };

    const filteredProducts = products.filter((product) => {
        const searchWords = searchTerm
            .trim()
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean);

        if (searchWords.length === 0) return true;

        const searchableText = `${product.name || ''} ${product.category || ''} ${product.subCategory || ''}`.toLowerCase();
        
        return searchWords.every((word) => searchableText.includes(word));
    });

    const fetchProducts = async () => {
        try {
            const url = "http://localhost:8080/products";
            const response = await fetch(url);
            const result = await response.json();
            if (result.success) {
                setProducts(result.data);
            }
        } catch (err) {
            handleError(err);
        }
    }

    const location = useLocation();

    useEffect(() => {
        setLoggedInUser(localStorage.getItem('loggedInUser'));
        setLoggedInEmail(localStorage.getItem('loggedInEmail'));
        fetchProducts();

        // Check for search query in URL
        const params = new URLSearchParams(location.search);
        const search = params.get('search');
        if (search) {
            setSearchTerm(search);
        }
    }, [location.search])

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('loggedInEmail');
        handleSuccess("Logout successful");
        setTimeout(() => {
            navigate('/login');
        }, 1000)
    }

    const openAddProductModal = () => {
        setEditingProduct(null);
        setNewProduct({ name: '', price: '', description: '', images: [], sizes: createEmptySizes(), category: '', subCategory: '' });
        setShowModal(true);
    };

    const openEditProductModal = (product) => {
        setEditingProduct(product);
        setNewProduct({
            name: product.name || '',
            price: product.price || '',
            description: product.description || '',
            images: [],
            sizes: product.sizes?.length ? product.sizes : createEmptySizes(),
            category: product.category || '',
            subCategory: product.subCategory || ''
        });
        setShowModal(true);
    };

    const closeProductModal = () => {            // used to close the modal & reset all states
        setShowModal(false);
        setEditingProduct(null);
        setNewProduct({ name: '', price: '', description: '', images: [], sizes: createEmptySizes(), category: '', subCategory: '' });
    };

    const handleSizeStockChange = (index, value) => {
        const nextSizes = newProduct.sizes.map((item, itemIndex) => (
            itemIndex === index ? { ...item, stock: value } : item
        ));
        setNewProduct({ ...newProduct, sizes: nextSizes });
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        const { name, price } = newProduct;
        const isEditing = Boolean(editingProduct);

        if (!name || !price) {
            handleError("Please fill all fields");
            return;
        }
        if (!isEditing && newProduct.images.length === 0) {
            handleError("Please select at least one product image");
            return;
        }
        try {
            const url = isEditing
                ? `http://localhost:8080/products/${editingProduct._id}?requester=${loggedInUser}`
                : "http://localhost:8080/products";
            const productData = new FormData();

            productData.append('name', newProduct.name);
            productData.append('price', newProduct.price);
            productData.append('description', newProduct.description);
            productData.append('category', newProduct.category);
            productData.append('subCategory', newProduct.subCategory);
            productData.append('sizes', JSON.stringify(newProduct.sizes.map((item) => ({
                size: item.size,
                stock: Number(item.stock) || 0
            }))));
            if (!isEditing) {
                productData.append('createdBy', loggedInUser);
            }
            newProduct.images.forEach((image) => {
                productData.append('images', image);
            });

            const response = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                body: productData
            });
            const result = await response.json();
            const { success, message, error } = result;
            if (success) {
                handleSuccess(message);
                fetchProducts();
                closeProductModal();
            } else if (error) {
                const details = error?.details?.[0]?.message || message;
                handleError(details);
            } else {
                handleError(message);
            }
        } catch (err) {
            handleError(err);
        }
    }

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            const url = `http://localhost:8080/products/${id}?requester=${loggedInUser}`;
            const response = await fetch(url, {
                method: "DELETE"
            });
            const result = await response.json();
            if (result.success) {
                handleSuccess(result.message);
                fetchProducts();
            } else {
                handleError(result.message);
            }
        } catch (err) {
            handleError(err);
        }
    }

    return (
        <div className="min-h-screen w-full bg-[#f8f9fa]">
            <Header 
                searchTerm={searchTerm} 
                onSearchChange={setSearchTerm} 
                loggedInUser={loggedInUser}
                loggedInEmail={loggedInEmail}
                handleLogout={handleLogout}
            />
            <div className="mx-auto max-w-[1600px] px-4 py-6 text-[#262a33] sm:px-6 lg:px-8">

                <div className="rounded-[8px] bg-white shadow-[0_18px_45px_rgba(25,31,44,0.08)]">
                    <div className="flex flex-col gap-4 border-b border-[#edf0f4] px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-6">
                            <div>
                                <h3 className="m-0 text-[26px] font-bold leading-tight text-[#252934]">Product</h3>
                                <p className="m-0 mt-1 text-sm font-medium text-[#9aa2af]">
                                    {filteredProducts.length} of {products.length} products listed
                                </p>
                            </div>

                            <div className="flex items-center gap-2 rounded-md bg-[#f6f7f9] p-1" role="group" aria-label="View mode">
                                <button
                                    type="button"
                                    className={`flex h-9 w-9 items-center justify-center rounded-md transition ${viewMode === 'list' ? 'bg-white text-[#356bff] shadow-sm' : 'text-[#9aa2af] hover:text-[#356bff]'}`}
                                    onClick={() => setViewMode('list')}
                                    title="List view"
                                >
                                    <HiBars3 size={21} />
                                </button>
                                <button
                                    type="button"
                                    className={`flex h-9 w-9 items-center justify-center rounded-md transition ${viewMode === 'grid' ? 'bg-white text-[#356bff] shadow-sm' : 'text-[#9aa2af] hover:text-[#356bff]'}`}
                                    onClick={() => setViewMode('grid')}
                                    title="Grid view"
                                >
                                    <HiSquares2X2 size={20} />
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#3267ff] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(50,103,255,0.25)] transition hover:bg-[#2556dc]"
                            onClick={openAddProductModal}
                        >
                            <HiPlus size={18} />
                            Add New Product
                        </button>
                    </div>

                    {viewMode === 'list' ? (
                        <div className="overflow-x-auto">
                            <table className="m-0 w-full min-w-[920px] border-collapse">
                                <thead>
                                    <tr className="bg-[#fbfcfd]">
                                        <th className="border-b border-[#edf0f4] px-5 py-4 text-left text-xs font-semibold text-[#9aa2af]">Product Name</th>
                                        <th className="border-b border-[#edf0f4] px-4 py-4 text-left text-xs font-semibold text-[#9aa2af]">Product ID</th>
                                        <th className="border-b border-[#edf0f4] px-4 py-4 text-left text-xs font-semibold text-[#9aa2af]">Price</th>
                                        <th className="border-b border-[#edf0f4] px-4 py-4 text-left text-xs font-semibold text-[#9aa2af]">Created By</th>
                                        <th className="border-b border-[#edf0f4] px-4 py-4 text-left text-xs font-semibold text-[#9aa2af]">Description</th>
                                        <th className="border-b border-[#edf0f4] px-5 py-4 text-right text-xs font-semibold text-[#9aa2af]">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts && filteredProducts.length > 0 ? (
                                        filteredProducts.map((product, index) => (
                                            <tr key={product._id || index} className="transition hover:bg-[#fbfcff]">
                                                <td className="border-b border-[#f1f3f6] px-5 py-4">
                                                    <button
                                                        type="button"
                                                        className="m-0 flex items-center gap-3 bg-transparent p-0 text-left"
                                                        onClick={() => navigate(`/products/${slugify(product.name)}`)}
                                                    >
                                                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold ${getProductImageUrl(product) ? 'bg-white' : getProductTone(index)}`}>
                                                            {getProductImageUrl(product) ? (
                                                                <img
                                                                    src={getProductImageUrl(product)}
                                                                    alt={product.name || 'Product'}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                product.name?.charAt(0)?.toUpperCase() || 'P'
                                                            )}
                                                        </span>
                                                        <span className="max-w-[210px] truncate text-sm font-bold text-[#323743]">{product.name}</span>
                                                    </button>
                                                </td>
                                                <td className="border-b border-[#f1f3f6] px-4 py-4 text-sm font-semibold text-[#9aa2af]">
                                                    #{product._id?.slice(-8).toUpperCase() || index + 1}
                                                </td>
                                                <td className="border-b border-[#f1f3f6] px-4 py-4 text-sm font-semibold text-[#606875]">${product.price}</td>
                                                <td className="border-b border-[#f1f3f6] px-4 py-4 text-sm font-semibold text-[#606875]">{product.createdBy}</td>
                                                <td
                                                    className="border-b border-[#f1f3f6] px-4 py-4 text-sm font-medium text-[#9aa2af]"
                                                    title={product.description || ''}
                                                >
                                                    <span className="block max-w-[260px] truncate">{truncateDescription(product.description, 10)}</span>
                                                </td>
                                                <td className="border-b border-[#f1f3f6] px-5 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            className="flex h-9 w-9 items-center justify-center rounded-md text-[#9aa2af] transition hover:bg-[#edf4ff] hover:text-[#3267ff]"
                                                            onClick={() => navigate(`/products/${slugify(product.name)}`)}
                                                            title="View product"
                                                        >
                                                            <HiEye size={18} />
                                                        </button>
                                                        {product.createdBy === loggedInUser && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    className="flex h-9 w-9 items-center justify-center rounded-md text-[#9aa2af] transition hover:bg-[#fff8e8] hover:text-[#c6821c]"
                                                                    onClick={() => openEditProductModal(product)}
                                                                    title="Edit product"
                                                                >
                                                                    <HiPencilSquare size={18} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="flex h-9 w-9 items-center justify-center rounded-md text-[#c5a0a6] transition hover:bg-[#fff1f0] hover:text-red-500"
                                                                    onClick={() => handleDeleteProduct(product._id)}
                                                                    title="Delete product"
                                                                >
                                                                    <HiOutlineTrash size={18} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-5 py-8 text-center text-sm font-medium text-[#9aa2af]">
                                                {searchTerm ? 'No products match your search.' : 'No products found. Add your first product!'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5 p-5">
                            {filteredProducts && filteredProducts.length > 0 ? (
                                filteredProducts.map((product, index) => (
                                    <div key={product._id || index} className="group overflow-hidden rounded-[8px] border border-[#edf0f4] bg-white transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(25,31,44,0.08)]">
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/products/${slugify(product.name)}`)}
                                            className="relative block w-full bg-[#f6f7f9] p-0"
                                        >
                                            <div className="flex aspect-[4/5] w-full items-center justify-center overflow-hidden">
                                                {getProductImageUrl(product) ? (
                                                    <img
                                                        src={getProductImageUrl(product)}
                                                        alt={product.name || 'Product'}
                                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                                                    />
                                                ) : (
                                                    <span className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold ${getProductTone(index)}`}>
                                                        {product.name?.charAt(0)?.toUpperCase() || 'P'}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#9aa2af] shadow-sm">
                                                <HiEye size={16} />
                                            </span>
                                        </button>

                                        <div className="p-3">
                                            <div className="flex items-center gap-1 text-yellow-400 mb-1.5">
                                                <HiStar size={12} className="fill-current" />
                                                <span className="text-[10px] font-bold text-gray-800">{(product.averageRating || 0).toFixed(1)}</span>
                                                <span className="text-[10px] font-medium text-gray-400">({product.totalReviews || 0})</span>
                                            </div>
                                            <h4 className="mb-2 line-clamp-2 min-h-[40px] text-sm font-bold leading-5 text-[#323743]">
                                                {product.name}
                                            </h4>
                                            <p
                                                className="mb-3 line-clamp-2 min-h-[36px] text-xs font-medium leading-[18px] text-[#9aa2af]"
                                                title={product.description || ''}
                                            >
                                                {truncateDescription(product.description, 10)}
                                            </p>
                                            <p className="mb-1 text-xs font-medium text-[#9aa2af]">Price</p>
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="m-0 text-base font-bold text-[#323743]">${product.price}</p>
                                                <button
                                                    type="button"
                                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#3267ff] text-white shadow-[0_10px_20px_rgba(50,103,255,0.22)] transition hover:bg-[#2556dc]"
                                                    onClick={() => navigate(`/products/${slugify(product.name)}`)}
                                                    title="View product"
                                                >
                                                    <HiShoppingBag size={18} />
                                                </button>
                                            </div>

                                            {product.createdBy === loggedInUser && (
                                                <div className="mt-3 flex items-center justify-end gap-1 border-t border-[#edf0f4] pt-3">
                                                    <button
                                                        type="button"
                                                        className="flex h-8 w-8 items-center justify-center rounded-md text-[#9aa2af] transition hover:bg-[#fff8e8] hover:text-[#c6821c]"
                                                        onClick={() => openEditProductModal(product)}
                                                        title="Edit product"
                                                    >
                                                        <HiPencilSquare size={18} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="flex h-8 w-8 items-center justify-center rounded-md text-[#c5a0a6] transition hover:bg-[#fff1f0] hover:text-red-500"
                                                        onClick={() => handleDeleteProduct(product._id)}
                                                        title="Delete product"
                                                    >
                                                        <HiOutlineTrash size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-[8px] border border-[#edf0f4] bg-[#fbfcfd] py-6 text-center text-sm font-medium text-[#9aa2af]">
                                    {searchTerm ? 'No products match your search.' : 'No products found. Add your first product!'}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Modal show={showModal} onHide={closeProductModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editingProduct ? 'Edit Product' : 'Add New Product'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleProductSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Product Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter product name"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Price ($)</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Enter price"
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Enter product description"
                                value={newProduct.description}
                                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Category</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter category (e.g. Men Fashion)"
                                value={newProduct.category}
                                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Sub Category</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter sub category (optional)"
                                value={newProduct.subCategory}
                                onChange={(e) => setNewProduct({ ...newProduct, subCategory: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Sizes & Stock</Form.Label>
                            <div className="grid gap-2">
                                {newProduct.sizes.map((item, index) => (
                                    <div key={item.size} className="grid grid-cols-[72px_1fr] items-center gap-3">
                                        <span className="rounded-[8px] bg-[#f6f7f9] px-3 py-2 text-center text-sm font-semibold text-[#323743]">
                                            {item.size}
                                        </span>
                                        <Form.Control
                                            type="number"
                                            min="0"
                                            placeholder="Stock"
                                            value={item.stock}
                                            onChange={(e) => handleSizeStockChange(index, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{editingProduct ? 'Product Images (optional)' : 'Product Images'}</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => setNewProduct({ ...newProduct, images: Array.from(e.target.files) })}
                            />
                            {editingProduct && (
                                <Form.Text className="text-muted">
                                    Leave empty to keep the current images.
                                </Form.Text>
                            )}
                        </Form.Group>
                        <div className="grid">
                            <button type="submit" className="rounded-[8px] bg-[#3267ff] py-2 font-semibold text-white hover:bg-[#2556dc]">
                                {editingProduct ? 'Save Changes' : 'Add Product'}
                            </button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>


            <Footer />
        </div>
    )
}

export default Dashboard;

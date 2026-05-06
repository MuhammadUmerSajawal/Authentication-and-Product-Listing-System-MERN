import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { Modal, Form } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import { handleSuccess, handleError } from '../utils/toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import { HiOutlineTrash, HiBars3, HiSquares2X2, HiPlus, HiArrowRightOnRectangle, HiEye, HiMagnifyingGlass, HiChevronDown, HiPencilSquare } from 'react-icons/hi2';

function Dashboard() {
    const [loggedInUser, setLoggedInUser] = useState('');
    const [products, setProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);              //used for showing the modal when the user clicks on add product button or edit product button
    const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '' });
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

    const getProductUrl = (productName) => {
        const slug = productName
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        return `/products/${encodeURIComponent(slug)}`;
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

    const filteredProducts = products.filter((product) => {
        const searchWords = searchTerm
            .trim()
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean);

        if (searchWords.length === 0) return true;

        const searchableText = String(product.name || '').toLowerCase();

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

    useEffect(() => {
        setLoggedInUser(localStorage.getItem('loggedInUser'));
        setLoggedInEmail(localStorage.getItem('loggedInEmail'));
        fetchProducts();
    }, [])

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
        setNewProduct({ name: '', price: '', description: '' });
        setShowModal(true);
    };

    const openEditProductModal = (product) => {
        setEditingProduct(product);
        setNewProduct({
            name: product.name || '',
            price: product.price || '',
            description: product.description || ''
        });
        setShowModal(true);
    };

    const closeProductModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setNewProduct({ name: '', price: '', description: '' });
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        const { name, price } = newProduct;
        if (!name || !price) {
            handleError("Please fill all fields");
            return;
        }
        try {
            const isEditing = Boolean(editingProduct);
            const url = isEditing
                ? `http://localhost:8080/products/${editingProduct._id}?requester=${loggedInUser}`
                : "http://localhost:8080/products";
            const response = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(isEditing ? newProduct : { ...newProduct, createdBy: loggedInUser })
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
        <div className="min-h-screen w-full bg-[#f4f4f4] px-4 py-6 text-[#262a33] sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative w-full max-w-xl">
                        <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b8bec8]" size={20} />
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search"
                            className="h-12 w-full rounded-full border border-transparent bg-white pl-12 pr-4 text-sm font-medium text-[#323743] shadow-[0_10px_30px_rgba(20,25,35,0.08)] outline-none transition placeholder:text-[#b8bec8] focus:border-[#3267ff]"
                        />
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <div className="relative">
                            <button
                                type="button"
                                className="flex h-14 min-w-0 items-center gap-3 rounded-[8px] bg-white px-3 shadow-[0_10px_30px_rgba(20,25,35,0.08)] transition hover:bg-[#fbfcff]"
                                onClick={() => setIsProfileOpen((prev) => !prev)}
                                aria-expanded={isProfileOpen}
                                aria-haspopup="menu"
                            >
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eaf0ff] text-sm font-bold text-[#3267ff]">
                                    {loggedInUser?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                                <span className="min-w-0 text-left">
                                    <span className="block max-w-[150px] truncate text-sm font-bold leading-tight text-[#323743]">{loggedInUser || 'User'}</span>
                                    <span className="block max-w-[150px] truncate text-xs font-medium leading-tight text-[#9aa2af]">{loggedInEmail || 'Logged in'}</span>
                                </span>
                                <HiChevronDown className={`shrink-0 text-[#9aa2af] transition ${isProfileOpen ? 'rotate-180' : ''}`} size={16} />
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 z-20 mt-2 w-44 rounded-[8px] border border-[#edf0f4] bg-white p-2 shadow-[0_18px_45px_rgba(25,31,44,0.14)]">
                                    <button
                                        type="button"
                                        className="flex w-full items-center gap-2 rounded-[6px] px-3 py-2 text-left text-sm font-semibold text-[#5d6472] transition hover:bg-[#fff1f0] hover:text-red-500"
                                        onClick={handleLogout}
                                    >
                                        <HiArrowRightOnRectangle size={18} />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

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
                                                        onClick={() => navigate(getProductUrl(product.name))}
                                                    >
                                                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${getProductTone(index)}`}>
                                                            {product.name?.charAt(0)?.toUpperCase() || 'P'}
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
                                                            onClick={() => navigate(getProductUrl(product.name))}
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
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 p-5">
                            {filteredProducts && filteredProducts.length > 0 ? (
                                filteredProducts.map((product, index) => (
                                    <div key={product._id || index} className="rounded-[8px] border border-[#edf0f4] bg-[#fbfcfd] p-4 transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(25,31,44,0.08)]">
                                        <button
                                            type="button"
                                            onClick={() => navigate(getProductUrl(product.name))}
                                            className="m-0 flex w-full items-center gap-3 bg-transparent p-0 text-left"
                                        >
                                            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold ${getProductTone(index)}`}>
                                                {product.name?.charAt(0)?.toUpperCase() || 'P'}
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block truncate text-base font-bold text-[#323743]">{product.name}</span>
                                                <span className="block text-sm font-semibold text-[#3267ff]">${product.price}</span>
                                            </span>
                                        </button>
                                        <p className="mb-1 mt-4 text-sm font-medium text-[#9aa2af]">{truncateDescription(product.description, 9)}</p>
                                        <p className="mb-4 text-sm font-semibold text-[#606875]">By: {product.createdBy}</p>
                                        <div className="flex items-center justify-between border-t border-[#edf0f4] pt-3">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-semibold text-[#3267ff] transition hover:bg-[#edf4ff]"
                                                onClick={() => navigate(getProductUrl(product.name))}
                                            >
                                                <HiEye size={17} />
                                                View
                                            </button>
                                            {product.createdBy === loggedInUser && (
                                                <div className="flex items-center gap-1">
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
                        <div className="grid">
                            <button type="submit" className="rounded-[8px] bg-[#3267ff] py-2 font-semibold text-white hover:bg-[#2556dc]">
                                {editingProduct ? 'Save Changes' : 'Add Product'}
                            </button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            <ToastContainer />
        </div>
    )
}

export default Dashboard;

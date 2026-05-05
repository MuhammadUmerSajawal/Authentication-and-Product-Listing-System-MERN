import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { Modal, Form } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import { handleSuccess, handleError } from '../util';
import 'bootstrap/dist/css/bootstrap.min.css';
import { HiOutlineTrash, HiBars3, HiSquares2X2 } from 'react-icons/hi2';

function Dashboard() {
    const [loggedInUser, setLoggedInUser] = useState('');
    const [products, setProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '' });
    const [viewMode, setViewMode] = useState('list');

    const navigate = useNavigate();
    const truncateDescription = (text, limit = 8) => {
        if (!text) return '.....';
        const words = text.trim().split(/\s+/);
        if (words.length <= limit) return text;
        return `${words.slice(0, limit).join(' ')} .....`;
    };

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
        fetchProducts();
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        handleSuccess("Logout successful");
        setTimeout(() => {
            navigate('/login');
        }, 1000)
    }

    const handleAddProduct = async (e) => {
        e.preventDefault();
        const { name, price, description } = newProduct;
        if (!name || !price) {
            handleError("Please fill all fields");
            return;
        }
        try {
            const url = "http://localhost:8080/products";
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...newProduct, createdBy: loggedInUser })
            });
            const result = await response.json();
            const { success, message, error } = result;
            if (success) {
                handleSuccess(message);
                fetchProducts();
                setShowModal(false);
                setNewProduct({ name: '', price: '', description: '' });
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
        <div className="min-h-screen w-full bg-slate-50 p-5">
            <div className="mb-5 flex justify-end">
                <button className="rounded-md bg-red-500 px-4 py-2 font-bold text-white transition hover:bg-red-600" onClick={handleLogout}>Logout</button>
            </div>

            <div className="mx-auto max-w-6xl">
                <div className="mb-4">
                    <h2 className="text-4xl font-bold text-[#232b5d]">Welcome, {loggedInUser}</h2>
                </div>

                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-3xl font-bold text-[#232b5d]">Product Listing</h3>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2" role="group" aria-label="View mode">
                            <button
                                type="button"
                                className={`m-0 bg-transparent p-1 leading-none ${viewMode === 'list' ? 'text-green-500' : 'text-[#8fa69d]'} hover:text-green-500`}
                                onClick={() => setViewMode('list')}
                                title="List view"
                            >
                                <HiBars3 size={22} />
                            </button>
                            <button
                                type="button"
                                className={`m-0 bg-transparent p-1 leading-none ${viewMode === 'grid' ? 'text-green-500' : 'text-[#8fa69d]'} hover:text-green-500`}
                                onClick={() => setViewMode('grid')}
                                title="Grid view"
                            >
                                <HiSquares2X2 size={20} />
                            </button>
                        </div>
                        <button
                            type="button"
                            className="rounded-full bg-[#396AFF] px-5 py-2 font-medium text-white transition hover:bg-[#2f59d8]"
                            onClick={() => setShowModal(true)}
                        >
                            + Add New Product
                        </button>
                    </div>
                </div>

                {viewMode === 'list' ? (
                    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                        <table className="m-0 w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="border-b border-[#f1f5fb] px-4 py-3 text-left font-medium text-[#718ebf]">ID</th>
                                    <th className="border-b border-[#f1f5fb] py-3 text-left font-medium text-[#718ebf]">Name</th>
                                    <th className="border-b border-[#f1f5fb] py-3 text-left font-medium text-[#718ebf]">Price ($)</th>
                                    <th className="border-b border-[#f1f5fb] py-3 text-left font-medium text-[#718ebf]">Created By</th>
                                    <th className="border-b border-[#f1f5fb] py-3 text-left font-medium text-[#718ebf]">Description</th>
                                    <th className="border-b border-[#f1f5fb] py-3 text-center font-medium text-[#718ebf]" style={{ width: '80px' }}></th>
                                </tr>

                            </thead>
                            <tbody>
                                {products && products.length > 0 ? (
                                    products.map((product, index) => (
                                        <tr key={product._id || index}>
                                            <td className="border-b border-[#f1f5fb] px-4 py-3 text-[#232b5d]">{(index + 1) < 10 ? `0${index + 1}.` : `${index + 1}.`}</td>
                                            <td className="border-b border-[#f1f5fb] py-3 font-semibold text-[#232b5d]">
                                                <button
                                                    type="button"
                                                    className="m-0 bg-transparent p-0 font-semibold text-[#2563eb] no-underline hover:underline"
                                                    onClick={() => navigate(`/products/${product._id}`)}
                                                >
                                                    {product.name}
                                                </button>
                                            </td>
                                            <td className="border-b border-[#f1f5fb] py-3 font-bold text-[#396AFF]">${product.price}</td>
                                            <td className="border-b border-[#f1f5fb] py-3 font-medium text-sky-500">{product.createdBy}</td>
                                            <td
                                                className="border-b border-[#f1f5fb] py-3 text-slate-500"
                                                title={product.description || ''}
                                                style={{ maxWidth: '280px' }}
                                            >
                                                {truncateDescription(product.description)}
                                            </td>
                                            <td className="border-b border-[#f1f5fb] py-3 text-center">
                                                {product.createdBy === loggedInUser && (
                                                    <button
                                                        type="button"
                                                        className="m-0 bg-transparent p-0 text-red-500 hover:text-red-600"
                                                        onClick={() => handleDeleteProduct(product._id)}
                                                    >
                                                        <HiOutlineTrash size={20} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-4 text-center text-slate-500">No products found. Add your first product!</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                        {products && products.length > 0 ? (
                            products.map((product, index) => (
                                <div key={product._id || index} className="rounded-none border-2 border-[#4a86e8] bg-[#eef2f5] p-2">
                                    <div className="flex flex-col">
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/products/${product._id}`)}
                                            className="relative m-0 flex h-[210px] w-full items-center justify-center border-2 border-[#4a86e8] bg-[#c9acd4] p-3 text-[22px] font-semibold text-[#4a86e8]"
                                        >
                                            <span className="max-w-[90%] break-words text-center leading-[1.2]">{product.name}</span>
                                            <span className="absolute bottom-2 right-2 text-sm font-bold text-[#4a86e8]">price ${product.price}</span>
                                        </button>
                                        <div className="mt-3">
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/products/${product._id}`)}
                                                className="m-0 mb-1 bg-transparent p-0 text-left text-[22px] font-bold leading-[1.15] text-[#4a86e8] hover:underline"
                                            >
                                                {product.name}
                                            </button>
                                            <p className="mb-1 text-base text-[#4a86e8]"><strong>Desc: </strong> {truncateDescription(product.description, 5)}</p>
                                            <p className="mb-0 text-base text-[#4a86e8]"><strong>By:</strong> {product.createdBy}</p>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            <button
                                                type="button"
                                                className="m-0 bg-transparent p-0 font-semibold text-[#2563eb] no-underline hover:underline"
                                                onClick={() => navigate(`/products/${product._id}`)}
                                            >
                                                View
                                            </button>
                                            {product.createdBy === loggedInUser && (
                                                <button
                                                    type="button"
                                                    className="m-0 bg-transparent p-0 text-red-500 hover:text-red-600"
                                                    onClick={() => handleDeleteProduct(product._id)}
                                                >
                                                    <HiOutlineTrash size={20} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-2xl bg-white py-4 text-center text-slate-500 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">No products found. Add your first product!</div>
                        )}
                    </div>
                )}
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Product</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAddProduct}>
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
                            <button type="submit" className="rounded-[10px] bg-[#396AFF] py-2 text-white hover:bg-[#2f59d8]">
                                Add Product
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

import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { Container, Table, Button, Modal, Form, Card } from 'react-bootstrap';
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
        <div className="dashboard-container">
            <div className="logout-container">
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>

            <Container>
                <div className="mb-4">
                    <h2 style={{ color: '#232b5d', fontWeight: 'bold' }}>Welcome, {loggedInUser}</h2>
                </div>

                <div className="table-header">
                    <h3 className="fs-4 fw-bold" style={{ color: '#232b5d' }}>Product Listing</h3>
                    <div className="d-flex align-items-center gap-3">
                        <div className="view-toggle" role="group" aria-label="View mode">
                            <button
                                type="button"
                                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                                title="List view"
                            >
                                <HiBars3 size={22} />
                            </button>
                            <button
                                type="button"
                                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                title="Grid view"
                            >
                                <HiSquares2X2 size={20} />
                            </button>
                        </div>
                        <Button className="add-product-btn" onClick={() => setShowModal(true)}>
                            + Add New Product
                        </Button>
                    </div>
                </div>

                {viewMode === 'list' ? (
                    <Card className="dashboard-panel border-0 overflow-hidden">
                        <Table responsive hover className="m-0 product-table">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3">ID</th>
                                    <th className="py-3">Name</th>
                                    <th className="py-3">Price ($)</th>
                                    <th className="py-3">Created By</th>
                                    <th className="py-3">Description</th>
                                    <th className="py-3 text-center" style={{ width: '80px' }}></th>
                                </tr>

                            </thead>
                            <tbody>
                                {products && products.length > 0 ? (
                                    products.map((product, index) => (
                                        <tr key={product._id || index}>
                                            <td className="px-4 py-3">{(index + 1) < 10 ? `0${index + 1}.` : `${index + 1}.`}</td>
                                            <td className="py-3 fw-semibold">
                                                <Button
                                                    variant="link"
                                                    className="p-0 text-decoration-none fw-semibold"
                                                    onClick={() => navigate(`/products/${product._id}`)}
                                                >
                                                    {product.name}
                                                </Button>
                                            </td>
                                            <td className="py-3 fw-bold" style={{ color: '#396AFF' }}>${product.price}</td>
                                            <td className="py-3 fw-medium text-info">{product.createdBy}</td>
                                            <td
                                                className="py-3 text-secondary"
                                                title={product.description || ''}
                                                style={{ maxWidth: '280px' }}
                                            >
                                                {truncateDescription(product.description)}
                                            </td>
                                            <td className="py-3 text-center">
                                                {product.createdBy === loggedInUser && (
                                                    <Button
                                                        variant="link"
                                                        className="text-danger p-0"
                                                        onClick={() => handleDeleteProduct(product._id)}
                                                    >
                                                        <HiOutlineTrash size={20} />
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-secondary">No products found. Add your first product!</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Card>
                ) : (
                    <div className="product-grid">
                        {products && products.length > 0 ? (
                            products.map((product, index) => (
                                <Card key={product._id || index} className="grid-product-card border-0">
                                    <Card.Body className="d-flex flex-column">
                                        <div className="grid-product-image">
                                            <span className="grid-product-name">{product.name}</span>
                                            <span className="grid-product-price">price ${product.price}</span>
                                        </div>
                                        <div className="mt-3">
                                            <p className="grid-title mb-1">{product.name}</p>
                                            <p className="grid-meta mb-1"><strong>Desc: </strong> {truncateDescription(product.description, 5)}</p>
                                            <p className="grid-meta mb-0"><strong>By:</strong> {product.createdBy}</p>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <Button
                                                variant="link"
                                                className="p-0 text-decoration-none fw-semibold"
                                                onClick={() => navigate(`/products/${product._id}`)}
                                            >
                                                View
                                            </Button>
                                            {product.createdBy === loggedInUser && (
                                                <Button
                                                    variant="link"
                                                    className="text-danger p-0"
                                                    onClick={() => handleDeleteProduct(product._id)}
                                                >
                                                    <HiOutlineTrash size={20} />
                                                </Button>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>
                            ))
                        ) : (
                            <Card className="dashboard-panel border-0">
                                <Card.Body className="text-center text-secondary py-4">No products found. Add your first product!</Card.Body>
                            </Card>
                        )}
                    </div>
                )}
            </Container>

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
                        <div className="d-grid">
                            <Button variant="primary" type="submit" style={{ backgroundColor: '#396AFF', borderRadius: '10px' }}>
                                Add Product
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            <ToastContainer />
        </div>
    )
}

export default Dashboard;

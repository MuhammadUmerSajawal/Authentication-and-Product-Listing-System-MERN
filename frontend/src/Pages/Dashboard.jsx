import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { Container, Table, Button, Modal, Form, Card } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import { handleSuccess, handleError } from '../util';
import 'bootstrap/dist/css/bootstrap.min.css';
import { HiOutlineTrash } from 'react-icons/hi2';

function Dashboard() {
    const [loggedInUser, setLoggedInUser] = useState('');
    const [products, setProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '' });

    const navigate = useNavigate();

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
                    <Button className="add-product-btn" onClick={() => setShowModal(true)}>
                        + Add New Product
                    </Button>
                </div>

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
                                        <td className="py-3 fw-semibold">{product.name}</td>
                                        <td className="py-3 fw-bold" style={{ color: '#396AFF' }}>${product.price}</td>
                                        <td className="py-3 fw-medium text-info">{product.createdBy}</td>
                                        <td className="py-3 text-secondary">{product.description}</td>
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

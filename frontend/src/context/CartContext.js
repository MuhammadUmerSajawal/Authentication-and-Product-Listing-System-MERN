import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { handleError } from '../utils/toast';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [userEmail, setUserEmail] = useState(localStorage.getItem('loggedInEmail') || 'guest');
    
    // Initialize cartItems from localStorage immediately
    const [cartItems, setCartItems] = useState(() => {
        const email = localStorage.getItem('loggedInEmail') || 'guest';
        const savedCart = localStorage.getItem(`cart_${email}`);
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const isInitialMount = useRef(true);

    const getCartKey = useCallback((email) => `cart_${email || 'guest'}`, []);

    // Watch for user changes (login/logout)
    useEffect(() => {
        const interval = setInterval(() => {
            const currentEmail = localStorage.getItem('loggedInEmail') || 'guest';
            if (currentEmail !== userEmail) {
                setUserEmail(currentEmail);
                const savedCart = localStorage.getItem(getCartKey(currentEmail));
                setCartItems(savedCart ? JSON.parse(savedCart) : []);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [userEmail, getCartKey]);

    // Save cart whenever it changes, but skip the very first empty render if we just loaded data
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        localStorage.setItem(getCartKey(userEmail), JSON.stringify(cartItems));
    }, [cartItems, userEmail, getCartKey]);

    const addToCart = (product, selectedSize) => {
        const sizeInfo = product.sizes?.find(s => s.size === selectedSize);
        const stockAvailable = sizeInfo ? Number(sizeInfo.stock) : 0;

        setCartItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(
                item => item._id === product._id && item.size === selectedSize
            );

            if (existingItemIndex > -1) {
                const currentQuantity = prevItems[existingItemIndex].quantity;
                if (currentQuantity >= stockAvailable) {
                    handleError(`Sorry, only ${stockAvailable} units available for size ${selectedSize}`);
                    return prevItems;
                }
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex].quantity += 1;
                return updatedItems;
            } else {
                if (stockAvailable < 1) {
                    handleError(`Sorry, size ${selectedSize} is out of stock`);
                    return prevItems;
                }
                return [...prevItems, { 
                    ...product, 
                    size: selectedSize, 
                    quantity: 1,
                    id: product._id
                }];
            }
        });
    };

    const removeFromCart = (id, size) => {
        setCartItems(prevItems => prevItems.filter(item => !(item._id === id && item.size === size)));
    };

    const updateQuantity = (id, size, delta) => {
        setCartItems(prevItems => prevItems.map(item => {
            if (item._id === id && item.size === size) {
                const sizeInfo = item.sizes?.find(s => s.size === size);
                const stockAvailable = sizeInfo ? Number(sizeInfo.stock) : 0;
                
                const newQuantity = item.quantity + delta;
                
                if (newQuantity > stockAvailable) {
                    handleError(`Only ${stockAvailable} units available in stock`);
                    return item;
                }
                
                if (newQuantity < 1) return item;
                
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ 
            cartItems, 
            addToCart, 
            removeFromCart, 
            updateQuantity, 
            clearCart, 
            cartCount,
            cartTotal 
        }}>
            {children}
        </CartContext.Provider>
    );
};

import './App.css';
import { Navigate,Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Signup from './pages/Signup';
import ProductPage from './pages/ProductPage';
import RefreshHandler from './components/RefreshHandler';
import { useState } from 'react';
import ProductDetails from './pages/ProductDetails';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';

import { ToastContainer } from 'react-toastify';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem('token')));  
  
  const PrivateRoute = ({element}) => {                                  //check the status of the user, if the user is loggedin⤵️
    return isAuthenticated ? element : <Navigate to="/login" />;         //stay as it is otherwise navigate to login page
  };                                                                    //now we will create refresh handler to check the status of the user when the page is refreshed⤵️

  return (
    <div className="App">
      <RefreshHandler setisAuthenticated={setIsAuthenticated} />         {/* //used for maintaining the state of the user when the page is refreshed */}
      <Routes> 
        <Route path="/" element={<Navigate to="/login"/>} />
        <Route path="/dashboard" element={<PrivateRoute element= {<Dashboard/>} />} />    {/* //when user is authenticated then it will render home page else it will redirect to login page */}
        {/* <Route path="/productpage" element={<PrivateRoute element={<ProductPage/>} />} /> */}
        <Route path="/productpage/:id" element={<PrivateRoute element={<ProductPage/>} />} />
        <Route path="/products/:productName" element={<PrivateRoute element={<ProductDetails/>} />} />
        <Route path="/cart" element={<PrivateRoute element={<CartPage/>} />} />
        <Route path="/wishlist" element={<PrivateRoute element={<WishlistPage/>} />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<Signup/>} />
      </Routes>
      <ToastContainer />
    </div>
  );
}

export default App;

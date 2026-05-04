import './App.css';
import { Navigate,Route, Routes } from 'react-router-dom';
import Login from './Pages/Login';
// import Home from './Pages/Home';
import Dashboard from './Pages/Dashboard';
import Signup from './Pages/Signup';
import RefreshHandler from './RefreshHandler';
import { useState } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);  
  
  const PrivateRoute = ({element}) => {                                  //check the status of the user, if the user is loggedin⤵️
    return isAuthenticated ? element : <Navigate to="/login" />;         //stay as it is otherwise navigate to login page
  };                                                                    //now we will create refresh handler to check the status of the user when the page is refreshed⤵️

  return (
    <div className="App">
      <RefreshHandler setisAuthenticated={setIsAuthenticated} />         {/* //used for maintaining the state of the user when the page is refreshed */}
      <Routes> 
        <Route path="/" element={<Navigate to="/login"/>} />
        <Route path="/dashboard" element={<PrivateRoute element= {<Dashboard/>} />} />    {/* //when user is authenticated then it will render home page else it will redirect to login page */}
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<Signup/>} />
      </Routes>
      {/* <h1>MERN Authentication App</h1> */}
    </div>
  );
}

export default App;

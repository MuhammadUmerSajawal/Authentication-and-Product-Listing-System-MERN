//used for maintaining the state of the user when the page is refreshed

import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function RefreshHandler({setisAuthenticated}) {   
    const location= useLocation();           
    const navigate = useNavigate();

    useEffect(()=>{
        if(localStorage.getItem('token')){
            setisAuthenticated(true);
            if(location.pathname === '/' ||
               location.pathname === '/login' ||
               location.pathname === '/signup'
            ){
                navigate('/dashboard',{replace: false});      //if the token is present in the local storage then navigate to home page
            }
        }                     
    },[location, navigate, setisAuthenticated])  //if the location changes then check the token and navigate accordingly

  return (
    null
  )
}

export default RefreshHandler;
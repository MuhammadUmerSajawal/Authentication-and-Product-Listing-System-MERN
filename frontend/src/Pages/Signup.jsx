import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../util';

function Signup() {

    const [signupInfo, setSignupInfo] = useState({
        name: '',
        email: '',
        password: ''
    })
    const [showPassword, setShowPassword] = useState(false);

      
    console.log('signupInfo -> ', signupInfo)

    const navigate = useNavigate();
    const handleChange = (e) => {
        const { name, value } = e.target;
        const copySignupInfo = { ...signupInfo };
        copySignupInfo[name] = value;
        setSignupInfo(copySignupInfo);
    }

    const handleSubmit = async (e)=>{
        e.preventDefault();                                             //prevent default page reload
        const {name, email, password} = signupInfo;
        if(!name || !email || !password){
            return handleError("Please fill all the required fields.");
        }
        try{
            const url = "http://localhost:8080/auth/signup";             //api call
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(signupInfo),
            });
            const result = await response.json();
            const {success, message, error} = result;
            if(success){                                                //success message and redirecting to login page
                handleSuccess(message);
                setTimeout(()=>{
                    navigate("/login");
                }, 1000)
            }else if (error){                                           //error message from joi validation
                const details = error?.details[0].message;
                handleError(details);
            }else if (!success){
                handleError(message);
            }
        }catch(error){
            handleError(error)
        }
    }

    return (
        <div className="auth-page">
            <div className='Container'>
                <h1>Signup</h1>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor='name'>Name</label>
                        <input
                            onChange={handleChange}
                            type='text'
                            name='name'
                            autoFocus
                            placeholder='Enter your name'
                            value= {signupInfo.name}
                        />
                    </div>
                    <div>
                        <label htmlFor='email'>Email</label>
                        <input
                            onChange={handleChange}
                            type='email'
                            name='email'
                            placeholder='Enter your email'
                            value= {signupInfo.email}
                        />
                    </div>
                    <div>
                        <label htmlFor='password'>Password</label>
                        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                            <input
                                onChange={handleChange}
                                type={showPassword ? 'text' : 'password'}
                                name='password'
                                placeholder='Enter your password'
                                value={signupInfo.password}
                                style={{ width: '100%', paddingRight: '50px' }}
                            />
                            <span 
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '10px', cursor: 'pointer', userSelect: 'none' }}
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </span>
                        </div>
                    </div>
                    <button type='submit'>Signup</button>
                    <span>Already have an account?
                        <Link to="/login">Login</Link>
                    </span>
                </form>
                <ToastContainer />
            </div>
        </div>
    )
}


export default Signup

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../util';

function Login() {

    const [loginInfo, setLoginInfo] = useState({
        email: '',
        password: ''
    })
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        const copyLoginInfo = { ...loginInfo };
        copyLoginInfo[name] = value;
        setLoginInfo(copyLoginInfo);
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        const { email, password } = loginInfo;
        if (!email || !password) {
            return handleError('email and password are required')
        }
        try {
            const url = "http://localhost:8080/auth/login";
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginInfo)
            });
            const result = await response.json();
            const { success, message, jwtToken, name, error } = result;
            if (success) {
                handleSuccess(message);
                localStorage.setItem('loggedInUser', name);
                localStorage.setItem('token', jwtToken);
                setTimeout(() => {
                    navigate('/dashboard')
                }, 1000)
            } else if (error) {
                const details = error?.details[0].message;
                handleError(details);
            } else if (!success) {
                handleError(message);
            }
        } catch (err) {
            handleError(err);
        }
    }

    return (
        <div className="auth-page">
            <div className='Container'>
                <h1>Login</h1>
                <form onSubmit={handleLogin}>
                    <div>
                        <label htmlFor='email'>Email</label>
                        <input
                            onChange={handleChange}
                            type='email'
                            name='email'
                            placeholder='Enter your email'
                            value={loginInfo.email}
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
                                value={loginInfo.password}
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
                    <button type='submit'>Login</button>
                    <span>Don't have an account?
                        <Link to="/signup">Signup</Link>
                    </span>
                </form>
                <ToastContainer />
            </div>
        </div>
    )
}


export default Login

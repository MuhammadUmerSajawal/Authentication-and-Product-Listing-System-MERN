import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { handleError, handleSuccess } from '../utils/toast';

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
                localStorage.setItem('loggedInEmail', email);
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
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-[8px_8px_24px_-3px_rgba(0,0,0,0.1)]">
                <h1 className="mb-8 text-center text-4xl font-semibold text-indigo-600">Login</h1>
                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label htmlFor='email' className="text-sm font-medium text-gray-800">Email</label>
                        <input
                            onChange={handleChange}
                            type='email'
                            name='email'
                            placeholder='Enter your email'
                            value={loginInfo.email}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base outline-none transition focus:border-indigo-600 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.1)]"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor='password' className="text-sm font-medium text-gray-800">Password</label>
                        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                            <input
                                onChange={handleChange}
                                type={showPassword ? 'text' : 'password'}
                                name='password'
                                placeholder='Enter your password'
                                value={loginInfo.password}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-base outline-none transition focus:border-indigo-600 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.1)]"
                            />
                            <span 
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '10px', cursor: 'pointer', userSelect: 'none' }}
                                className="m-0 text-sm font-semibold text-indigo-600"
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </span>
                        </div>
                    </div>
                    <button type='submit' className="mt-2 rounded-lg bg-indigo-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-indigo-700">
                        Login
                    </button>
                    <span className="m-0 mt-4 text-center text-sm text-gray-500">Don't have an account?
                        <Link to="/signup" className="ml-1 font-semibold text-indigo-600 hover:underline">Signup</Link>
                    </span>
                </form>

            </div>
        </div>
    )
}


export default Login

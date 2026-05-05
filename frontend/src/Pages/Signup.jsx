import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils/toast';

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
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-[8px_8px_24px_-3px_rgba(0,0,0,0.1)]">
                <h1 className="mb-8 text-center text-4xl font-semibold text-indigo-600">Signup</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label htmlFor='name' className="text-sm font-medium text-gray-800">Name</label>
                        <input
                            onChange={handleChange}
                            type='text'
                            name='name'
                            autoFocus
                            placeholder='Enter your name'
                            value= {signupInfo.name}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base outline-none transition focus:border-indigo-600 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.1)]"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor='email' className="text-sm font-medium text-gray-800">Email</label>
                        <input
                            onChange={handleChange}
                            type='email'
                            name='email'
                            placeholder='Enter your email'
                            value= {signupInfo.email}
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
                                value={signupInfo.password}
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
                        Signup
                    </button>
                    <span className="m-0 mt-4 text-center text-sm text-gray-500">Already have an account?
                        <Link to="/login" className="ml-1 font-semibold text-indigo-600 hover:underline">Login</Link>
                    </span>
                </form>
                <ToastContainer />
            </div>
        </div>
    )
}


export default Signup

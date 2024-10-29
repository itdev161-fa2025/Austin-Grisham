import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ authenticateUser }) => {
    let navigate = useNavigate();

    const [userData, setUserData] = useState({
        email: '',
        password: ''
    });

    const [errorData, setErrorData] = useState({ errors: null });
    const { email, password } = userData;
    const { errors } = errorData;

    const onChange = (e) => {
        const { name, value } = e.target;
        setUserData({
            ...userData,
            [name]: value
        });
    };

    const loginUser = async () => {
        const newUser = {
            email,
            password
        };

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const body = JSON.stringify(newUser);
            const res = await axios.post('http://localhost:5000/api/login', body, config);

            // Store user data and redirect
            localStorage.setItem('token', res.data.token);
            navigate('/');

            // Authenticate the user
            authenticateUser();
        } catch (error) {
            // Clear user data and set errors
            localStorage.removeItem('token');
            setErrorData({
                errors: error.response && error.response.data && error.response.data.errors
                    ? error.response.data.errors
                    : [{ msg: 'Server error. Please try again later.' }]
            });
        }
    };

    return (
        <div>
            <h2>Log In</h2>
            <div>
                <input
                    type="text"
                    placeholder="Email"
                    name="email"
                    value={email}
                    onChange={(e) => onChange(e)}
                />
            </div>
            <div>
                <input
                    type="password"
                    placeholder="Password"
                    name="password"
                    value={password}
                    onChange={(e) => onChange(e)}
                />
            </div>
            <div>
                <button onClick={loginUser}>Log In</button>
            </div>
            <div>
                {errors && errors.map((error) => (
                    <div key={error.msg}>{error.msg}</div>
                ))}
            </div>
        </div>
    );
};

export default Login;

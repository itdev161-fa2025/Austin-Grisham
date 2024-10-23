import React from 'react';
import './App.css';
import axios from 'axios';
import { Routes, Route, Link } from 'react-router-dom';

// Components for different pages
function Home() {
  return (
    <div>
      <h2>Welcome to GoodThings</h2>
      <p>This is the Home page.</p>
    </div>
  );
}

function Register() {
  return (
    <div>
      <h2>Register Page</h2>
      <p>Please register for an account here.</p>
    </div>
  );
}

function Login() {
  return (
    <div>
      <h2>Login Page</h2>
      <p>Enter your credentials to log in.</p>
    </div>
  );
}

class App extends React.Component {
  state = {
    data: null
  };

  componentDidMount() {
    axios.get('http://localhost:3000')
      .then((response) => {
        this.setState({
          data: response.data
        });
      })
      .catch((error) => {
        console.error(`Error fetching data: ${error}`);
      });
  }

  render() {
    return (
      <div className='App'>
        <header className='App-header'>
          {/* Title */}
          <h1>GoodThings</h1>

          {/* Navigation Links */}
          <nav>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/login">Login</Link></li>
            </ul>
          </nav>
        </header>

        {/* Define Routes */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    );
  }
}

export default App;

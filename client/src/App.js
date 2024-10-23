import React from 'react';
import './App.css';
import axios from 'axios';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home'; // Corrected Import
import Register from './components/Register'; // Corrected Import
import Login from './components/Login'; // Corrected Import

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
              <li><Link to="/">Home</Link></li> {/* Changed path to "/" */}
              <li><Link to="/register">Register</Link></li> {/* Lowercase */}
              <li><Link to="/login">Login</Link></li> {/* Lowercase */}
            </ul>
          </nav>
        </header>

        {/* Define Routes */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} /> {/* Home path is "/" */}
            <Route path="/register" element={<Register />} /> {/* Lowercase */}
            <Route path="/login" element={<Login />} /> {/* Lowercase */}
          </Routes>
        </main>
      </div>
    );
  }
}

export default App;

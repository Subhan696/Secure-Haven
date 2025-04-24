import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => (
  <section className="hero">
    <h2>Secure and Transparent Online Voting</h2>
    <p>Your voice matters. Vote with confidence and integrity.</p>
    
    <div className="hero-buttons">
      <Link to="/login" className="btn login-btn">Login</Link>
      <Link to="/signup" className="btn signup-btn">Sign Up</Link>
    </div>
  </section>
);

export default Home;

import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <section className="hero-section">
        <h1>About Secure Haven</h1>
        <p className="tagline">Making Elections Secure, Transparent, and Accessible</p>
      </section>

      <section className="mission-section">
        <h2>Our Mission</h2>
        <p>
          At Secure Haven, we're dedicated to revolutionizing the way organizations conduct elections.
          Our platform combines cutting-edge security with user-friendly design to make voting
          accessible, transparent, and trustworthy.
        </p>
      </section>

      <section className="features-section">
        <h2>Why Choose Secure Haven?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>End-to-End Encryption</h3>
            <p>Your votes are protected with military-grade encryption, ensuring complete privacy and security.</p>
          </div>
          <div className="feature-card">
            <h3>Real-Time Results</h3>
            <p>Get instant insights as votes are cast, with transparent and verifiable results.</p>
          </div>
          <div className="feature-card">
            <h3>User-Friendly Interface</h3>
            <p>Intuitive design makes voting accessible to everyone, regardless of technical expertise.</p>
          </div>
          <div className="feature-card">
            <h3>Comprehensive Analytics</h3>
            <p>Detailed reports and analytics help you understand voting patterns and trends.</p>
          </div>
        </div>
      </section>

      <section className="team-section">
        <h2>Our Team</h2>
        <div className="team-grid">
          <div className="team-member">
            <div className="member-image"></div>
            <h3>John Smith</h3>
            <p>Founder & CEO</p>
          </div>
          <div className="team-member">
            <div className="member-image"></div>
            <h3>Sarah Johnson</h3>
            <p>Security Lead</p>
          </div>
          <div className="team-member">
            <div className="member-image"></div>
            <h3>Michael Chen</h3>
            <p>Technical Director</p>
          </div>
        </div>
      </section>

      <section className="contact-cta">
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of organizations that trust Secure Haven for their elections.</p>
        <button className="cta-button">Contact Us</button>
      </section>
    </div>
  );
};

export default About;

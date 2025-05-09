import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <section className="about-hero">
        <h1>About Secure Haven</h1>
        <p>Empowering organizations with secure, transparent, and accessible voting solutions.</p>
      </section>

      <section className="about-mission">
        <h2>Our Mission</h2>
        <p>
          At Secure Haven, we're dedicated to revolutionizing the way organizations conduct elections. 
          Our platform combines cutting-edge security with user-friendly design to make voting accessible, 
          transparent, and trustworthy for everyone.
        </p>
      </section>

      <section className="about-team">
        <h2>Our Team</h2>
        <div className="team-grid">
          <div className="team-member">
            <div className="member-info">
              <h3>Subhan Kashif</h3>
              <p className="role">Founder</p>
              <p className="bio">
                Leading the vision and strategy of Secure Haven, bringing innovation to digital voting solutions.
              </p>
            </div>
          </div>
          <div className="team-member">
            <div className="member-info">
              <h3>Hassan Tariq</h3>
              <p className="role">Co-Founder</p>
              <p className="bio">
                Driving technical excellence and ensuring the highest standards of security in our platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of organizations that trust Secure Haven for their voting needs.</p>
        <Link to="/contact" className="contact-btn">
          Contact Us
        </Link>
      </section>
    </div>
  );
};

export default About;

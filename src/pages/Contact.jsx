import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add API call to send contact form
    console.log('Contact form data:', formData);
    alert('Thank you for your message. We will get back to you soon!');
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <h1>Contact Us</h1>
        <p>Have questions? We're here to help!</p>
      </section>

      <div className="contact-content">
        <div className="contact-info">
          <div className="info-card">
            <h3>Email Us</h3>
            <p>support@securehaven.com</p>
          </div>
          <div className="info-card">
            <h3>Call Us</h3>
            <p>+1 (555) 123-4567</p>
          </div>
          <div className="info-card">
            <h3>Office Hours</h3>
            <p>Monday - Friday: 9:00 AM - 6:00 PM EST</p>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
            />
          </div>

          <button type="submit" className="submit-button">Send Message</button>
        </form>
      </div>

      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h3>How secure is the voting process?</h3>
            <p>Our platform uses end-to-end encryption and blockchain technology to ensure the highest level of security for your elections.</p>
          </div>
          <div className="faq-item">
            <h3>Can I customize the election settings?</h3>
            <p>Yes, you have full control over election parameters, including voting period, eligibility criteria, and result visibility.</p>
          </div>
          <div className="faq-item">
            <h3>What kind of support do you offer?</h3>
            <p>We provide 24/7 technical support and dedicated account managers for enterprise clients.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;

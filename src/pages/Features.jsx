import React from 'react';

const features = [
  "Encrypted Voting Process",
  "Real-Time Results",
  "User Authentication",
  "Mobile-Friendly Interface"
];

const Features = () => (
  <section className="features">
    <h3>Features</h3>
    <ul>
      {features.map((feature, index) => (
        <li key={index}>{feature}</li>
      ))}
    </ul>
  </section>
);

export default Features;

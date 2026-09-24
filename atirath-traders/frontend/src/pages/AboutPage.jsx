import React from 'react';
import SEO from '../components/SEO';

const AboutPage = () => {
  return (
    <>
      <SEO 
        title="About Us" 
        description="Learn about Atirath Traders, a leading global import and export company. Discover our mission, vision, and the leadership team driving international trade excellence."
        keywords="about atirath traders, import export company profile, global trade leaders, trading mission vision"
      />
      <section className="about-hero">
        <div className="container hero-content">
          <div className="hero-text">
            <h2>About Us</h2>
            <h3>Building Trust. Delivering Excellence.</h3>
            <p>
              At Atirath Traders, we connect global markets with quality products and reliable services.
              Our commitment to trust, transparency and timely delivery has made us a preferred partner worldwide.
            </p>
          </div>
        </div>
      </section>

      <section className="company-profile">
        <div className="container profile-grid">
          <div className="profile-content">
            <h2 className="section-title">Company Profile</h2>
            <div className="underline"></div>
            <p>
              Atirath Traders is a leading import & export company delivering high-quality products across the globe.
              With a strong network of manufacturers, suppliers, and logistics partners, we ensure the best quality,
              competitive pricing, and on-time delivery.
            </p>
            <ul className="profile-list">
              <li><i className="fa-regular fa-circle-check"></i> Founded with a vision to empower global trade</li>
              <li><i className="fa-regular fa-circle-check"></i> Wide range of products across multiple industries</li>
              <li><i className="fa-regular fa-circle-check"></i> Customer-centric approach with 24/7 support</li>
              <li><i className="fa-regular fa-circle-check"></i> Ethical business practices and transparent dealings</li>
            </ul>
          </div>
          <div className="profile-image">
            <img src="./Logo.jpeg" alt="Company Profile" />
          </div>
        </div>

        {/* Three leadership cards directly below the profile grid – name & designation only */}
        <div className="container team-cards-wrapper">
          <div className="team-cards" style={{ display: 'flex', justifyContent: 'center' }}>
            {/* Chairman Card */}
            <div className="team-card" style={{ maxWidth: '350px', width: '100%' }}>
              <div className="team-image">
                <img 
                  src="./chairman.jpeg" 
                  alt="Ch.v.k.sai kumar, Chairman"
                  onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                />
              </div>
              <h3>Ch.v.k.sai kumar</h3>
              <div className="team-title">Chairman</div>
            </div>
          </div>
        </div>
      </section>

      <section className="vision-section">
        <div className="container">
          <div className="vision-heading">
            <span className="line"></span>
            <h2>Our Vision, Mission & Values</h2>
            <span className="line"></span>
          </div>
          <div className="vision-grid">
            <div className="vision-card">
              <div className="icon-box"><i className="fa-regular fa-eye"></i></div>
              <div className="vision-content">
                <h3>Our Vision</h3>
                <p>To be a globally trusted trading partner, recognized for quality, reliability, and long-term value creation.</p>
              </div>
            </div>
            <div className="vision-card">
              <div className="icon-box orange"><i className="fa-solid fa-bullseye"></i></div>
              <div className="vision-content">
                <h3>Our Mission</h3>
                <p>To deliver superior products and services by building strong relationships and expanding global trade opportunities.</p>
              </div>
            </div>
            <div className="vision-card">
              <div className="icon-box"><i className="fa-regular fa-gem"></i></div>
              <div className="vision-content">
                <h3>Our Values</h3>
                <ul>
                  <li>Integrity</li>
                  <li>Quality</li>
                  <li>Reliability</li>
                  <li>Customer Satisfaction</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="global-presence">
        <div className="container">
          <div className="global-title-wrap">
            <h2 className="global-title">Global Presence</h2>
            <div className="global-line"></div>
          </div>
          <div className="global-grid">
            <div className="global-map">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.2216480407724!2d78.38583247383066!3d17.44910230102695!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb91000098943d%3A0xcc4507c0561825ba!2sAtirath%20Traders!5e0!3m2!1sen!2sin!4v1780726727666!5m2!1sen!2sin"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Atirath Traders Office Location"
              ></iframe>
            </div>
            <div className="global-stats">
              <div className="global-stat-card">
                <div className="stat-icon"><i className="fa-solid fa-globe"></i></div>
                <div>
                  <h3>50+</h3>
                  <p>Countries Served</p>
                </div>
              </div>
              <div className="global-stat-card">
                <div className="stat-icon"><i className="fa-regular fa-handshake"></i></div>
                <div>
                  <h3>500+</h3>
                  <p>Satisfied Clients</p>
                </div>
              </div>
              <div className="global-stat-card">
                <div className="stat-icon"><i className="fa-solid fa-cube"></i></div>
                <div>
                  <h3>1000+</h3>
                  <p>Products</p>
                </div>
              </div>
              <div className="global-stat-card">
                <div className="stat-icon"><i className="fa-solid fa-users"></i></div>
                <div>
                  <h3>200+</h3>
                  <p>Trusted Suppliers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;
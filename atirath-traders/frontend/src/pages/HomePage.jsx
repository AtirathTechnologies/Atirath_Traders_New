import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import FeaturedProductsSlider from '../components/FeaturedProductsSlider';
import SEO from '../components/SEO';
import { useProducts } from '../context/ProductsContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { categories, brands, brandImages, loading } = useProducts();
  const [rssFeeds, setRssFeeds] = useState([]);

  // Horizontal scroll ref & state
  const brandSliderRef = useRef(null);
  const [leftDisabled, setLeftDisabled] = useState(true);
  const [rightDisabled, setRightDisabled] = useState(false);

  const youtubeVideo =
    "https://www.youtube.com/embed/EAGPsXlZlkg?autoplay=1&mute=1&loop=1&playlist=EAGPsXlZlkg&controls=0&showinfo=0&modestbranding=1";

  // Fetch RSS news
  useEffect(() => {
    const fetchRSS = async () => {
      try {
        const response = await axios.get("http://localhost:8000/basmati-rss");
        setRssFeeds(response.data.articles);
      } catch (error) {
        console.log("RSS Fetch Error:", error);
      }
    };
    fetchRSS();
  }, []);

  // Update scroll buttons state
  const updateButtonsState = useCallback(() => {
    if (brandSliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = brandSliderRef.current;
      setLeftDisabled(scrollLeft <= 5);
      setRightDisabled(scrollLeft + clientWidth >= scrollWidth - 5);
    }
  }, []);

  const handleScroll = useCallback(() => {
    updateButtonsState();
  }, [updateButtonsState]);

  const scrollLeft = () => {
    if (brandSliderRef.current) {
      const firstCard = brandSliderRef.current.querySelector(".brand-card");
      if (firstCard) {
        const cardWidth = firstCard.offsetWidth;
        const gap = parseFloat(getComputedStyle(brandSliderRef.current).gap) || 20;
        brandSliderRef.current.scrollBy({ left: -(cardWidth + gap), behavior: "smooth" });
      } else {
        brandSliderRef.current.scrollBy({ left: -200, behavior: "smooth" });
      }
    }
  };

  const scrollRight = () => {
    if (brandSliderRef.current) {
      const firstCard = brandSliderRef.current.querySelector(".brand-card");
      if (firstCard) {
        const cardWidth = firstCard.offsetWidth;
        const gap = parseFloat(getComputedStyle(brandSliderRef.current).gap) || 20;
        brandSliderRef.current.scrollBy({ left: cardWidth + gap, behavior: "smooth" });
      } else {
        brandSliderRef.current.scrollBy({ left: 200, behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    const slider = brandSliderRef.current;
    if (slider) {
      slider.addEventListener("scroll", handleScroll);
      window.addEventListener("resize", updateButtonsState);
      updateButtonsState();
      return () => {
        slider.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", updateButtonsState);
      };
    }
  }, [handleScroll, updateButtonsState]);

  useEffect(() => {
    updateButtonsState();
  }, [brands, updateButtonsState]);

  const handleCategoryClick = (categoryName) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  const handleBrandClick = (brandName) => {
    navigate(`/brands?brand=${encodeURIComponent(brandName)}`);
  };

  // Map category names to Font Awesome icons (covers all Firebase category name variants)
  const getCategoryIcon = (cat) => {
    const exactIcons = {
      // Agriculture variants
      "Agriculture": "fas fa-seedling",
      "Agri Products": "fas fa-seedling",
      "Agricultural Products": "fas fa-seedling",
      "Agri": "fas fa-seedling",

      // Food & Beverage variants
      "Food & Beverages": "fas fa-utensils",
      "Food and Beverages": "fas fa-utensils",
      "Food": "fas fa-utensils",
      "Beverages": "fas fa-coffee",
      "Food & Drinks": "fas fa-utensils",

      // Condiments / Spices
      "Condiments": "fas fa-mortar-pestle",
      "Spices": "fas fa-mortar-pestle",
      "Spices & Condiments": "fas fa-mortar-pestle",
      "Herbs & Spices": "fas fa-mortar-pestle",
      "Sauces": "fas fa-mortar-pestle",

      // Rice / Grains
      "Rice": "fas fa-leaf",
      "Basmati Rice": "fas fa-leaf",
      "Grains": "fas fa-seedling",
      "Cereals": "fas fa-seedling",
      "Pulses": "fas fa-seedling",

      // Textiles
      "Textiles": "fas fa-tshirt",
      "Textile": "fas fa-tshirt",
      "Fabrics": "fas fa-tshirt",
      "Textiles & Fabrics": "fas fa-tshirt",
      "Garments": "fas fa-tshirt",
      "Clothing": "fas fa-tshirt",

      // Electronics
      "Electronics": "fas fa-microchip",
      "Electronics & Accessories": "fas fa-microchip",
      "Electrical": "fas fa-bolt",
      "Gadgets": "fas fa-mobile-alt",

      // Home & Lifestyle
      "Home & Lifestyle": "fas fa-couch",
      "Home & Lifestyle Products": "fas fa-couch",
      "Home": "fas fa-home",
      "Furniture": "fas fa-couch",
      "Home Decor": "fas fa-couch",

      // Auto Parts
      "Auto Parts": "fas fa-car",
      "Automotive": "fas fa-car",
      "Spare Parts": "fas fa-cogs",

      // Machinery
      "Machinery": "fas fa-cogs",
      "Machinery & Equipment": "fas fa-cogs",
      "Equipment": "fas fa-tools",
      "Industrial": "fas fa-industry",

      // Chemicals & Minerals
      "Chemicals": "fas fa-flask",
      "Chemicals & Minerals": "fas fa-flask",
      "Minerals": "fas fa-gem",

      // Health & Beauty
      "Health & Beauty": "fas fa-heartbeat",
      "Healthcare": "fas fa-heartbeat",
      "Pharma": "fas fa-pills",
      "Cosmetics": "fas fa-spa",

      // Construction
      "Construction": "fas fa-hard-hat",
      "Building Materials": "fas fa-hard-hat",

      // Dry Fruits / Nuts
      "Dry Fruits": "fas fa-leaf",
      "Nuts & Dry Fruits": "fas fa-leaf",

      // Seafood / Meat
      "Seafood": "fas fa-fish",
      "Meat": "fas fa-drumstick-bite",
      "Poultry": "fas fa-drumstick-bite",

      // Fruits & Vegetables
      "Fruits & Vegetables": "fas fa-apple-alt",
      "Fruits": "fas fa-apple-alt",
      "Vegetables": "fas fa-carrot",
      "Fresh Produce": "fas fa-carrot",
    };

    // Exact match first
    if (exactIcons[cat]) return exactIcons[cat];

    // Fuzzy / keyword match fallback
    const lower = cat.toLowerCase();
    if (lower.includes("agri") || lower.includes("crop") || lower.includes("farm")) return "fas fa-seedling";
    if (lower.includes("rice") || lower.includes("grain") || lower.includes("cereal")) return "fas fa-leaf";
    if (lower.includes("spice") || lower.includes("condiment") || lower.includes("herb")) return "fas fa-mortar-pestle";
    if (lower.includes("food") || lower.includes("beverage") || lower.includes("drink")) return "fas fa-utensils";
    if (lower.includes("fruit") || lower.includes("vegetable") || lower.includes("produce")) return "fas fa-apple-alt";
    if (lower.includes("textile") || lower.includes("fabric") || lower.includes("garment") || lower.includes("cloth")) return "fas fa-tshirt";
    if (lower.includes("electronic") || lower.includes("gadget") || lower.includes("tech")) return "fas fa-microchip";
    if (lower.includes("home") || lower.includes("furniture") || lower.includes("decor")) return "fas fa-couch";
    if (lower.includes("auto") || lower.includes("car") || lower.includes("vehicle")) return "fas fa-car";
    if (lower.includes("machine") || lower.includes("equipment") || lower.includes("industrial")) return "fas fa-cogs";
    if (lower.includes("chemical") || lower.includes("mineral") || lower.includes("lab")) return "fas fa-flask";
    if (lower.includes("health") || lower.includes("pharma") || lower.includes("medical")) return "fas fa-heartbeat";
    if (lower.includes("seafood") || lower.includes("fish")) return "fas fa-fish";
    if (lower.includes("dry fruit") || lower.includes("nut")) return "fas fa-leaf";
    if (lower.includes("construct") || lower.includes("build")) return "fas fa-hard-hat";

    return "fas fa-box-open";
  };

  if (loading) {
    return (
      <div className="loading-spinner" style={{ textAlign: "center", padding: "80px" }}>
        Loading amazing products...
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Home" 
        description="Welcome to Atirath Traders, your trusted partner for global import and export. Explore our wide range of agriculture, food, textiles, electronics, home & lifestyle, and auto parts."
        keywords="atirath traders home, global import export, india trade, agriculture products, textile exports, auto parts"
      />

      {/* HERO SECTION */}
      <div className="hero">
        <div className="container hero-content">
          <div className="hero-text">
            <h1>
              <span className="line-one">
                Connecting <span className="orange-word">Global</span>
              </span>
              <span className="line-two">Markets Delivering</span>
              <span className="line-two">
                <span className="orange-word">Trust</span> Worldwide
              </span>
            </h1>
            <p>
              Atirath Traders is a trusted name in Import & Export,
              offering quality products and reliable services across the globe.
              We specialize in sourcing premium goods and ensuring timely delivery.
            </p>
            <div className="hero-buttons">
              <a href="/products" className="btn-orange">
                Explore Products <i className="fas fa-arrow-right"></i>
              </a>
              <a href="/contact" className="btn-outline-dark">
                Contact Us
              </a>
            </div>
          </div>
          <div className="hero-video-box">
            <div className="video-container">
              <iframe
                width="100%"
                height="100%"
                src={youtubeVideo}
                title="Atirath Traders Video"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              ></iframe>
              <div className="video-overlay"></div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE STRIP */}
      <div className="feature-strip">
        <div className="container">
          <div className="feature-grid">
            <div className="feature-item">
              <i className="fas fa-globe-asia"></i>
              <h4>Global Sourcing</h4>
              <p>Trusted suppliers worldwide</p>
            </div>
            <div className="feature-item">
              <i className="fas fa-truck-fast"></i>
              <h4>Timely Delivery</h4>
              <p>On-time performance 99%</p>
            </div>
            <div className="feature-item">
              <i className="fas fa-check-circle"></i>
              <h4>Quality Assurance</h4>
              <p>100% quality guarantee</p>
            </div>
            <div className="feature-item">
              <i className="fas fa-headset"></i>
              <h4>Customer Satisfaction</h4>
              <p>24/7 dedicated support</p>
            </div>
          </div>
        </div>
      </div>

      {/* SHOP BY CATEGORY - DYNAMIC FROM FIREBASE */}
      <div className="container" style={{ marginTop: '60px' }}>
        <div className="section-header">
          <h2>Shop By Category</h2>
          <a href="/products" className="view-link">
            View All Categories →
          </a>
        </div>
        <div className="category-grid">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="category-card"
              onClick={() => handleCategoryClick(cat)}
            >
              <i className={getCategoryIcon(cat)}></i>
              <h5>{cat}</h5>
            </div>
          ))}
        </div>
      </div>

      {/* SHOP BY BRAND - HORIZONTAL SCROLL WITH BUTTONS, SHOWING ALL BRANDS */}
      <div className="container" style={{ marginTop: '60px' }}>
        <div className="section-header">
          <h2>Shop By Brand</h2>
          <a href="/brands" className="view-link">
            View All Brands →
          </a>
        </div>

        <div className="brand-slider-wrapper">
          {brands.length > 0 && (
            <button 
              className={`brand-slider-btn left-btn ${leftDisabled ? 'disabled' : ''}`}
              onClick={scrollLeft}
              disabled={leftDisabled}
              aria-label="Scroll left"
            >
              ‹
            </button>
          )}
          
          <div className="brand-slider no-scrollbar" ref={brandSliderRef}>
            {brands.map((brand) => (
              <div
                key={brand}
                className="category-card brand-card"
                onClick={() => handleBrandClick(brand)}
              >
                <div className="brand-logo-wrapper">
                  <img 
                    src={brandImages[brand] || "/placeholder-brand.png"} 
                    alt={brand} 
                    className="brand-logo" 
                    onError={(e) => { e.target.src = '/placeholder-brand.png'; }}
                  />
                </div>
                <h5>{brand}</h5>
              </div>
            ))}
          </div>
          
          {brands.length > 0 && (
            <button 
              className={`brand-slider-btn right-btn ${rightDisabled ? 'disabled' : ''}`}
              onClick={scrollRight}
              disabled={rightDisabled}
              aria-label="Scroll right"
            >
              ›
            </button>
          )}
        </div>
      </div>

      {/* WHY CHOOSE US */}
      <section className="why-section">
        <div className="container why-container">
          <div className="why-left">
            <span className="why-tag">WHY CHOOSE US</span>
            <h2>Why Choose Atirath Traders?</h2>
            <p>
              We are committed to providing the best quality products,
              competitive prices and exceptional service to build
              long-term relationships with our clients.
            </p>
            <button className="why-btn" onClick={() => navigate('/about')}>
              Learn More About Us
            </button>
          </div>
          <div className="why-right">
            <div className="why-box">
              <div className="icon blue">
                <i className="fas fa-shield-alt"></i>
              </div>
              <div>
                <h4>Quality Assurance</h4>
                <p>We ensure 100% quality in every product.</p>
              </div>
            </div>
            <div className="why-box">
              <div className="icon orange">
                <i className="fas fa-dollar-sign"></i>
              </div>
              <div>
                <h4>Competitive Pricing</h4>
                <p>Best prices in the market to maximize your profit.</p>
              </div>
            </div>
            <div className="why-box">
              <div className="icon green">
                <i className="fas fa-globe"></i>
              </div>
              <div>
                <h4>Global Network</h4>
                <p>Strong network of trusted suppliers and clients.</p>
              </div>
            </div>
            <div className="why-box">
              <div className="icon purple">
                <i className="fas fa-headset"></i>
              </div>
              <div>
                <h4>24/7 Support</h4>
                <p>Our team is always ready to help you.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <div className="stats-wrapper" style={{ margin: '40px 0' }}>
        <div className="container">
          <div className="stats-card">
            <div className="stat-box">
              <i className="fas fa-users"></i>
              <div>
                <h3>1000+</h3>
                <p>Happy Clients</p>
              </div>
            </div>
            <div className="divider"></div>
            <div className="stat-box">
              <i className="fas fa-box"></i>
              <div>
                <h3>5000+</h3>
                <p>Products</p>
              </div>
            </div>
            <div className="divider"></div>
            <div className="stat-box">
              <i className="fas fa-globe"></i>
              <div>
                <h3>50+</h3>
                <p>Countries Served</p>
              </div>
            </div>
            <div className="divider"></div>
            <div className="stat-box">
              <i className="fas fa-award"></i>
              <div>
                <h3>10+</h3>
                <p>Years of Experience</p>
              </div>
            </div>
            <div className="divider"></div>
            <div className="stat-box">
              <i className="fas fa-headset"></i>
              <div>
                <h3>24/7</h3>
                <p>Customer Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURED PRODUCTS SLIDER */}
      <FeaturedProductsSlider />

      {/* LIVE MARKET UPDATES (RSS) */}
      <section className="rss-section">
        <div className="container">
          <h2 className="rss-title">Live Market Updates</h2>
          <div className="rss-marquee">
            <div className="rss-track">
              <div className="rss-group">
                {rssFeeds.map((item, index) => (
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="rss-card" 
                    style={{ textDecoration: 'none', color: 'inherit' }} 
                    key={`first-${index}`}
                  >
                    📰 {item.title}
                  </a>
                ))}
              </div>
              <div className="rss-group">
                {rssFeeds.map((item, index) => (
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="rss-card" 
                    style={{ textDecoration: 'none', color: 'inherit' }} 
                    key={`second-${index}`}
                  >
                    📰 {item.title}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GLOBAL PARTNERS */}
      <section className="partners-section">
        <div className="container">
          <h3>Our Global Partners</h3>
          <div className="partners-logos">
            <img src="/img/Trusted/AANAK.webp" alt="AANAK" />
            <img src="/img/Trusted/Akil.webp" alt="Akil" />
            <img src="/img/Trusted/Siea.webp" alt="Siea" />
            <img src="/img/Trusted/Atirath_Industries.webp" alt="Atirath_Industries" />
            <img src="/img/Trusted/Dubai.webp" alt="Dubai" />
            <img src="/img/Trusted/ET_Logo.webp" alt="ET_Logo" />
            <img src="/img/Trusted/Heritage.webp" alt="Heritage" />
            <img src="/img/Trusted/Nopphada.webp" alt="Nopphada" />
            <img src="/img/Trusted/Tando.webp" alt="Tando" />
            <img src="/img/Trusted/Tyago.webp" alt="Nopphada" />
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="newsletter">
        <div className="container newsletter-box">
          <div className="newsletter-left">
            <i className="fas fa-paper-plane"></i>
            <div>
              <h4>Stay Updated With Atirath Traders</h4>
              <p>Subscribe to our newsletter for the latest updates and offers.</p>
            </div>
          </div>
          <div className="newsletter-right">
            <input type="email" placeholder="Enter your email address" />
            <button>Subscribe</button>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
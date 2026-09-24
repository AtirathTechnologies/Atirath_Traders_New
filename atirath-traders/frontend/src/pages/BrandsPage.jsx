import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SEO from "../components/SEO";
import { useProducts } from "../context/ProductsContext";
import "../styles/productlisting.css";

const BrandsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, brands, brandImages, loading, error } = useProducts();

  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [openBrandsMenu, setOpenBrandsMenu] = useState(true);
  const [openCategoriesMenu, setOpenCategoriesMenu] = useState(true);
  const [showAllBrands, setShowAllBrands] = useState(false); // toggle for sidebar brands
  const [sortOrder, setSortOrder] = useState("Newest First");

  // Filter states (price, origin, MOQ)
  const [maxPriceFilter, setMaxPriceFilter] = useState(100);
  const [sliderMax, setSliderMax] = useState(100);
  const [selectedOrigins, setSelectedOrigins] = useState([]);
  const [moqInput, setMoqInput] = useState("");
  const [appliedMoq, setAppliedMoq] = useState(null);

  // Helper to parse price string
  const parseProductPrice = (priceStr) => {
    if (!priceStr || priceStr.toLowerCase().includes("request")) return 0;
    const firstPart = priceStr.split(/[–-]/)[0];
    return parseFloat(firstPart.replace(/[^0-9.]/g, '')) || 0;
  };

  // Read brand from URL
  useEffect(() => {
    const brandParam = searchParams.get("brand");
    
    // Reset other filters on brand change
    setSelectedOrigins([]);
    setMoqInput("");
    setAppliedMoq(null);

    if (brandParam && brands.includes(brandParam)) {
      setSelectedBrand(brandParam);
      setSelectedSubcategory("All");
    } else {
      setSelectedBrand(null);
      setSelectedSubcategory("All");
    }
  }, [searchParams, brands]);

  const getSubcategoriesForBrand = (brandName) => {
    const brandProducts = products.filter(p => p.brand === brandName);
    const uniqueSubcats = [...new Set(brandProducts.map(p => p.subcategory))];
    return ["All", ...uniqueSubcats.sort()];
  };

  const getBaseFilteredProducts = () => {
    let filtered = products;
    if (selectedBrand) {
      filtered = filtered.filter(p => p.brand === selectedBrand);
      if (selectedSubcategory && selectedSubcategory !== "All") {
        filtered = filtered.filter(p => p.subcategory === selectedSubcategory);
      }
    }
    return filtered;
  };

  // Calibrate price slider range based on loaded products and currency
  useEffect(() => {
    if (products && products.length) {
      const baseProducts = getBaseFilteredProducts();
      const prices = baseProducts.map(p => parseProductPrice(p.priceDisplay)).filter(p => p > 0);
      if (prices.length) {
        const maxVal = Math.ceil(Math.max(...prices));
        setSliderMax(maxVal);
        setMaxPriceFilter(maxVal);
      } else {
        setSliderMax(100);
        setMaxPriceFilter(100);
      }
    }
  }, [selectedBrand, selectedSubcategory, products]);

  const getFilteredProducts = () => {
    let filtered = getBaseFilteredProducts();

    // Price range filter
    filtered = filtered.filter(p => {
      if (!p.priceDisplay || p.priceDisplay.toLowerCase().includes("request")) return true;
      const priceVal = parseProductPrice(p.priceDisplay);
      return priceVal <= maxPriceFilter;
    });

    // Country of Origin filter
    if (selectedOrigins.length > 0) {
      filtered = filtered.filter(p => selectedOrigins.includes(p.origin));
    }

    // MOQ filter
    if (appliedMoq !== null) {
      filtered = filtered.filter(p => {
        if (!p.moq || String(p.moq).toLowerCase().includes("n/a")) return true;
        const moqVal = parseFloat(String(p.moq).replace(/[^0-9.]/g, '')) || 0;
        return moqVal <= appliedMoq;
      });
    }

    if (sortOrder === "Price Low to High") {
      filtered.sort((a, b) => parseProductPrice(a.priceDisplay) - parseProductPrice(b.priceDisplay));
    } else if (sortOrder === "Price High to Low") {
      filtered.sort((a, b) => parseProductPrice(b.priceDisplay) - parseProductPrice(a.priceDisplay));
    }

    return filtered;
  };

  const displayProducts = getFilteredProducts();
  const subcategories = selectedBrand ? getSubcategoriesForBrand(selectedBrand) : [];

  const handleBrandClick = (brandName) => {
    setSelectedBrand(brandName);
    setSelectedSubcategory("All");
    setSelectedOrigins([]);
    setMoqInput("");
    setAppliedMoq(null);
    setSearchParams({ brand: brandName });
  };

  const clearBrandFilter = () => {
    setSelectedBrand(null);
    setSelectedSubcategory("All");
    setSelectedOrigins([]);
    setMoqInput("");
    setAppliedMoq(null);
    setSearchParams({});
  };

  const handleSubcategoryClick = (subcat) => {
    setSelectedSubcategory(subcat);
    setSelectedOrigins([]);
    setMoqInput("");
    setAppliedMoq(null);
    if (selectedBrand) {
      setSearchParams({ brand: selectedBrand });
    }
  };

  const handleClearAll = () => {
    setSelectedOrigins([]);
    setMoqInput("");
    setAppliedMoq(null);
    if (products && products.length) {
      const baseProducts = getBaseFilteredProducts();
      const prices = baseProducts.map(p => parseProductPrice(p.priceDisplay)).filter(p => p > 0);
      if (prices.length) {
        const maxVal = Math.ceil(Math.max(...prices));
        setMaxPriceFilter(maxVal);
      } else {
        setMaxPriceFilter(100);
      }
    }
  };

  const handleApplyMoq = () => {
    const val = parseFloat(moqInput);
    if (!isNaN(val)) {
      setAppliedMoq(val);
    } else {
      setAppliedMoq(null);
    }
  };

  const handleViewDetails = (product, e) => {
    e.stopPropagation();
    navigate("/product-details", { state: { product, firebaseId: product.id } });
  };

  // Determine which brands to show in sidebar
  const displayedBrands = showAllBrands ? brands : brands.slice(0, 6);

  const baseProducts = getBaseFilteredProducts();

  // Dynamic values based on current filtered products
  const hasRupee = baseProducts.some(p => p.priceDisplay && p.priceDisplay.includes("₹"));
  const currencySymbol = hasRupee ? "₹" : "$";

  // Calculate country of origin options dynamically
  const originCounts = {};
  baseProducts.forEach(p => {
    if (p.origin) {
      originCounts[p.origin] = (originCounts[p.origin] || 0) + 1;
    }
  });

  const availableOrigins = Object.keys(originCounts).sort();

  if (loading) {
    return (
      <div className="product-page">
        <div className="container">
          <div className="loading-spinner" style={{ textAlign: "center", padding: "80px" }}>
            Loading brands & products...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-page">
        <div className="container">
          <div className="empty-message" style={{ textAlign: "center", padding: "80px", color: "red" }}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-page">
      <SEO 
        title={selectedBrand ? `${selectedBrand} Products` : "Our Brands"} 
        description={selectedBrand ? `Explore the complete range of products from ${selectedBrand}. High-quality items sourced and exported by Atirath Traders.` : "Discover the global brands partnered with Atirath Traders. Quality products across multiple categories."}
        keywords={selectedBrand ? `${selectedBrand} products, ${selectedBrand} atirath traders, brand products india` : "atirath traders brands, global trading partners, branded agriculture products"}
      />
      <div className="container">
        {/* PRODUCT HEADER */}
        <div className="product-header">
          <div className="header-left">
            <p className="breadcrumb">Home › Brands</p>
            <h2>{selectedBrand ? `${selectedBrand} Products` : "All Brands"}</h2>
            <p className="subtitle">
              {selectedBrand
                ? selectedSubcategory === "All"
                  ? `Showing all products from ${selectedBrand}`
                  : `Showing ${selectedSubcategory} from ${selectedBrand}`
                : "Showing products from all partnered brands. Select a brand to filter."}
            </p>
          </div>
          <div className="header-right">
            <div className="sort-box">
              <span>Sort By:</span>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option>Newest First</option>
                <option>Price Low to High</option>
                <option>Price High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div className="product-layout">
          <div className="sidebar">
            {/* BRANDS SECTION - now with "View All Brands" toggle */}
            <div className="filter-section">
              <div className="filter-header">
                <h4>Brands</h4>
                <span
                  className="toggle-icon"
                  onClick={() => setOpenBrandsMenu(!openBrandsMenu)}
                  style={{ cursor: "pointer" }}
                >
                  {openBrandsMenu ? "⌃" : "⌄"}
                </span>
              </div>
              {openBrandsMenu && (
                <>
                  <ul className="category-list" style={{ marginTop: "10px" }}>
                    {displayedBrands.map((brand) => (
                      <li
                        key={brand}
                        style={{
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "8px 0",
                          color: selectedBrand === brand ? "#ff6b00" : "inherit",
                          fontWeight: selectedBrand === brand ? "600" : "normal"
                        }}
                        onClick={() => handleBrandClick(brand)}
                      >
                        <img 
                          src={brandImages[brand] || "/placeholder-brand.png"} 
                          alt={brand} 
                          style={{ width: "30px", height: "30px", objectFit: "contain" }} 
                          onError={(e) => { e.target.src = '/placeholder-brand.png'; }}
                        />
                        <span>{brand}</span>
                      </li>
                    ))}
                  </ul>
                  {brands.length > 6 && (
                    <div 
                      className="view-all-brands-btn"
                      onClick={() => setShowAllBrands(!showAllBrands)}
                    >
                      {showAllBrands ? "Show Less" : "View All Brands"}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* PRODUCT CATEGORIES (only if brand selected) */}
            {selectedBrand && (
              <div className="filter-section">
                <div className="filter-header">
                  <h4>Product Categories</h4>
                  <span
                    className="toggle-icon"
                    onClick={() => setOpenCategoriesMenu(!openCategoriesMenu)}
                    style={{ cursor: "pointer" }}
                  >
                    {openCategoriesMenu ? "⌃" : "⌄"}
                  </span>
                </div>
                {openCategoriesMenu && (
                  <ul className="category-list" style={{ marginTop: "10px" }}>
                    {subcategories.map((subcat, idx) => (
                      <li
                        key={idx}
                        style={{
                          cursor: "pointer",
                          color: selectedSubcategory === subcat ? "#ff6b00" : "inherit",
                          fontWeight: selectedSubcategory === subcat ? "600" : "normal"
                        }}
                        onClick={() => handleSubcategoryClick(subcat)}
                      >
                        {subcat === "All" ? "All Products" : subcat}
                        <span>(
                          {subcat === "All"
                            ? products.filter(p => p.brand === selectedBrand).length
                            : products.filter(p => p.brand === selectedBrand && p.subcategory === subcat).length}
                        )</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* DYNAMIC FILTERS */}
            <div className="filter-header top">
              <h4>Filter By</h4>
              <span className="clear" onClick={handleClearAll} style={{ cursor: "pointer" }}>Clear All</span>
            </div>
            
            {/* Price Range */}
            <div className="filter-section">
              <p className="filter-title">Price Range</p>
              <div className="range-values">
                <span>{currencySymbol}1</span>
                <span>{currencySymbol}{maxPriceFilter.toLocaleString()}+</span>
              </div>
              <input 
                type="range" 
                className="range" 
                min="1"
                max={sliderMax}
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(parseFloat(e.target.value))}
              />
            </div>

            {/* Minimum Order Quantity (MOQ) */}
            <div className="filter-section">
              <p className="filter-title">Minimum Order Quantity (MOQ)</p>
              <div className="moq-box">
                <input 
                  type="number" 
                  placeholder="Enter MOQ" 
                  value={moqInput}
                  onChange={(e) => setMoqInput(e.target.value)}
                />
                <button onClick={handleApplyMoq}>OK</button>
              </div>
              {appliedMoq !== null && (
                <div className="active-filter-badge" style={{ marginTop: "8px", fontSize: "0.8rem", color: "#ff6b00" }}>
                  Active MOQ: ≤ {appliedMoq}
                </div>
              )}
            </div>

            {/* Country of Origin */}
            <div className="filter-section">
              <p className="filter-title">Country of Origin</p>
              {availableOrigins.length === 0 ? (
                <p style={{ fontSize: "0.85rem", color: "#666" }}>No origins available</p>
              ) : (
                availableOrigins.map(origin => (
                  <label key={origin} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", margin: "6px 0" }}>
                    <input 
                      type="checkbox" 
                      checked={selectedOrigins.includes(origin)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrigins([...selectedOrigins, origin]);
                        } else {
                          setSelectedOrigins(selectedOrigins.filter(o => o !== origin));
                        }
                      }}
                    /> 
                    {origin} <span>({originCounts[origin]})</span>
                  </label>
                ))
              )}
            </div>

            {/* Supplier Type (Static) */}
            <div className="filter-section">
              <p className="filter-title">Supplier Type</p>
              <label><input type="checkbox" />Verified Suppliers</label>
              <label><input type="checkbox" />Gold Suppliers 👑</label>
            </div>
            
            <div className="filter-buttons">
              <button className="reset" onClick={handleClearAll} style={{ width: "100%" }}>Reset Filters</button>
            </div>
          </div>

          <div className="products">
            {displayProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px", color: "#666", fontSize: "1.1rem", background: "#fff", borderRadius: "12px" }}>
                😔 No products found {selectedBrand ? `for ${selectedBrand}` : ""} in {selectedSubcategory !== "All" ? selectedSubcategory : "this category"}.
              </div>
            ) : (
              <div className="product-grid">
                {displayProducts.map((p, idx) => (
                  <div className="card whatsapp-card" key={idx}>
                    <div className="img-box">
                      <img
                        src={p.img}
                        alt={p.name}
                        onError={(e) => { e.target.src = "/placeholder.jpg"; }}
                      />
                    </div>
                    <div className="card-body whatsapp-style">
                      <span className="category-badge">{p.brand}</span>
                      <h4>{p.name}</h4>
                      <p className="short-desc">{p.shortDesc}</p>
                      <div className="product-price">{p.priceDisplay}</div>
                      <div className="product-meta">
                        <div className="meta-item">
                          <span className="meta-icon">⚖️</span> quantity: {p.quantityDisplay}
                        </div>
                        <div className="meta-item">
                          <span className="meta-icon">📦</span> MOQ: {p.moq}
                        </div>
                        <div className="meta-item">
                          <span className="meta-icon">📍</span> Origin: {p.origin}
                        </div>
                        <div className="meta-item">
                          <span className="meta-icon">🗂️</span> Pack Type: {p.packTypes}
                        </div>
                      </div>
                      <div className="card-actions">
                        <button className="btn-view" onClick={(e) => handleViewDetails(p, e)}>View Details</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandsPage;
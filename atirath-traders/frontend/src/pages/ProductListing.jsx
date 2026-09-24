import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SEO from "../components/SEO";
import { useProducts } from "../context/ProductsContext";
import "../styles/productlisting.css";

// Helper: shuffle array
const shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const ProductListing = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, error, categoryTree } = useProducts();

  // Filter state
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [activeType, setActiveType] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("Newest First");

  // Price Range, MOQ & Origin Filter states
  const [maxPriceFilter, setMaxPriceFilter] = useState(100);
  const [sliderMax, setSliderMax] = useState(100);
  const [selectedOrigins, setSelectedOrigins] = useState([]);
  const [moqInput, setMoqInput] = useState("");
  const [appliedMoq, setAppliedMoq] = useState(null);

  // Sidebar expand states
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});

  // Helper to parse price string
  const parseProductPrice = (priceStr) => {
    if (!priceStr || priceStr.toLowerCase().includes("request")) return 0;
    const firstPart = priceStr.split(/[–-]/)[0];
    return parseFloat(firstPart.replace(/[^0-9.]/g, '')) || 0;
  };

  const getBaseFilteredProducts = () => {
    let filtered = products;

    // Category filter
    if (activeCategory) {
      filtered = filtered.filter(p => p.category === activeCategory);
      if (activeSubcategory) {
        filtered = filtered.filter(p => p.subcategory === activeSubcategory);
      }
      if (activeType) {
        filtered = filtered.filter(p => p.subcategoryType === activeType);
      }
    }

    // Search text filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q) ||
        (p.subcategory || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.shortDesc || "").toLowerCase().includes(q) ||
        (p.origin || "").toLowerCase().includes(q)
      );
    }
    return filtered;
  };

  // Sync from URL and initialize price slider range
  useEffect(() => {
    const catParam = searchParams.get("category");
    const searchParam = searchParams.get("search") || "";
    setSearchQuery(searchParam);
    if (catParam) {
      setActiveCategory(catParam);
      setActiveSubcategory(null);
      setActiveType(null);
      setExpandedCategories({});
      setExpandedSubcategories({});
    } else {
      setActiveCategory(null);
      setActiveSubcategory(null);
      setActiveType(null);
      setExpandedCategories({});
      setExpandedSubcategories({});
    }
  }, [searchParams]);

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
  }, [activeCategory, activeSubcategory, activeType, searchQuery, products]);

  const updateUrlCategory = (category) => {
    setSearchParams({ category });
  };

  // Handlers
  const handleCategoryClick = (categoryName) => {
    if (activeCategory === categoryName && !activeSubcategory && !activeType) {
      // Toggle expand if already active with no deeper selection
      setExpandedCategories(prev => ({
        ...prev,
        [categoryName]: !prev[categoryName]
      }));
    } else {
      setActiveCategory(categoryName);
      setActiveSubcategory(null);
      setActiveType(null);
      setSelectedOrigins([]);
      setMoqInput("");
      setAppliedMoq(null);
      setExpandedCategories(prev => ({ ...prev, [categoryName]: true }));
      setExpandedSubcategories({});
      updateUrlCategory(categoryName);
    }
  };

  const handleSubcategoryClick = (categoryName, subcategoryName) => {
    setActiveCategory(categoryName);
    setActiveSubcategory(subcategoryName);
    setActiveType(null);
    setSelectedOrigins([]);
    setMoqInput("");
    setAppliedMoq(null);
    // Expand this subcategory's types
    setExpandedSubcategories(prev => ({
      ...prev,
      [`${categoryName}-${subcategoryName}`]: true
    }));
    updateUrlCategory(categoryName);
  };

  const handleTypeClick = (categoryName, subcategoryName, typeName) => {
    setActiveCategory(categoryName);
    setActiveSubcategory(subcategoryName);
    setActiveType(typeName);
    setSelectedOrigins([]);
    setMoqInput("");
    setAppliedMoq(null);
    updateUrlCategory(categoryName);
  };

  // Toggle expand category (arrow click)
  const toggleCategoryExpand = (categoryName, e) => {
    e.stopPropagation();
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  // Toggle expand subcategory
  const toggleSubcategoryExpand = (key, e) => {
    e.stopPropagation();
    setExpandedSubcategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Clear all filters
  const handleClearAll = () => {
    setActiveCategory(null);
    setActiveSubcategory(null);
    setActiveType(null);
    setSearchQuery("");
    setSelectedOrigins([]);
    setMoqInput("");
    setAppliedMoq(null);
    setMaxPriceFilter(sliderMax);
    setSearchParams({});
  };

  const handleApplyMoq = () => {
    const val = parseFloat(moqInput);
    if (!isNaN(val)) {
      setAppliedMoq(val);
    } else {
      setAppliedMoq(null);
    }
  };

  // Filter products
  const getDisplayProducts = () => {
    if (loading) return { products: [], message: null, loading: true };
    if (error) return { products: [], message: error, loading: false };
    if (!products.length) return { products: [], message: "No products found.", loading: false };

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

    if (filtered.length === 0) {
      let msg = searchQuery.trim()
        ? `No products found for "${searchQuery}"`
        : `No products found`;
      if (activeCategory) msg += ` in ${activeCategory}`;
      if (activeSubcategory) msg += ` / ${activeSubcategory}`;
      if (activeType) msg += ` / ${activeType}`;
      return { products: [], message: msg, loading: false };
    }

    if (!activeCategory && !searchQuery.trim() && sortOrder === "Newest First") {
      filtered = shuffleArray(filtered);
    }

    if (sortOrder === "Price Low to High") {
      filtered.sort((a, b) => parseProductPrice(a.priceDisplay) - parseProductPrice(b.priceDisplay));
    } else if (sortOrder === "Price High to Low") {
      filtered.sort((a, b) => parseProductPrice(b.priceDisplay) - parseProductPrice(a.priceDisplay));
    }

    return { products: filtered, message: null, loading: false };
  };

  const { products: displayProducts, message: displayMessage, loading: isLoading } = getDisplayProducts();

  const baseProducts = getBaseFilteredProducts();
  const hasRupee = baseProducts.some(p => p.priceDisplay && p.priceDisplay.includes("₹"));
  const currencySymbol = hasRupee ? "₹" : "$";

  return (
    <div className="product-page">
      <SEO 
        title="Products" 
        description="Browse our extensive catalog of high-quality products including agriculture, food & beverages, textiles, electronics, home & lifestyle, and auto parts."
        keywords="atirath traders products, agriculture catalog, food imports, textile exports, auto parts supply"
      />
      <div className="container">
        {/* Header */}
        <div className="product-header">
          <div className="header-left">
            <p className="breadcrumb">Home › Products</p>
            <h2>All Products</h2>
            <p className="subtitle">
              {searchQuery.trim()
                ? `Search results for "${searchQuery}"${activeCategory ? ` in ${activeCategory}` : ""}`
                : activeCategory
                ? `Showing ${activeCategory} products${activeSubcategory ? ` › ${activeSubcategory}` : ""}${activeType ? ` › ${activeType}` : ""}`
                : "Discover our wide range of quality products from trusted global suppliers."}
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

        {/* Main layout */}
        <div className="product-layout">
          <div className="sidebar">
            <div className="filter-section">
              <div className="filter-header">
                <h4>Categories</h4>
              </div>
              <ul className="category-list">
                {categoryTree.map(cat => {
                  const isCatExpanded = expandedCategories[cat.name];
                  const hasSubcategories = cat.children.length > 0;
                  const isCatActive = activeCategory === cat.name && !activeSubcategory && !activeType;
                  
                  return (
                    <li key={cat.name} className="category-item-wrapper">
                      <div 
                        className={`category-item ${isCatActive ? "active" : ""}`}
                        onClick={() => handleCategoryClick(cat.name)}
                      >
                        <span>{cat.name} <span>({cat.count})</span></span>
                        {hasSubcategories && (
                          <span 
                            className="arrow" 
                            onClick={(e) => toggleCategoryExpand(cat.name, e)}
                          >
                            {isCatExpanded ? "⌄" : ">"}
                          </span>
                        )}
                      </div>
                      {hasSubcategories && isCatExpanded && (
                        <ul className="nested-list">
                          {cat.children.map(sub => {
                            const subKey = `${cat.name}-${sub.name}`;
                            const isSubExpanded = expandedSubcategories[subKey];
                            const hasTypes = sub.children.length > 0;
                            const isSubActive = activeCategory === cat.name && activeSubcategory === sub.name && !activeType;
                            
                            return (
                              <li key={sub.name} className="category-item-wrapper">
                                <div 
                                  className={`category-item subcategory-item ${isSubActive ? "active" : ""}`}
                                  onClick={() => handleSubcategoryClick(cat.name, sub.name)}
                                >
                                  <span>{sub.name} <span>({sub.count})</span></span>
                                  {hasTypes && (
                                    <span 
                                      className="arrow"
                                      onClick={(e) => toggleSubcategoryExpand(subKey, e)}
                                    >
                                      {isSubExpanded ? "⌄" : ">"}
                                    </span>
                                  )}
                                </div>
                                {hasTypes && isSubExpanded && (
                                  <ul className="nested-list">
                                    {sub.children.map(type => {
                                      const isTypeActive = activeCategory === cat.name && 
                                                          activeSubcategory === sub.name && 
                                                          activeType === type.name;
                                      return (
                                        <li key={type.name} className="category-item-wrapper">
                                          <div 
                                            className={`category-item type-item ${isTypeActive ? "active" : ""}`}
                                            onClick={() => handleTypeClick(cat.name, sub.name, type.name)}
                                          >
                                            <span>{type.name} <span>({type.count})</span></span>
                                          </div>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className="view-all">View All Categories</p>
            </div>

            {/* Filters */}
            <div className="filter-header top">
              <h4>Filter By</h4>
              <span className="clear" onClick={handleClearAll}>Clear All</span>
            </div>
            <div className="filter-section">
              <p className="filter-title">Price Range</p>
              <div className="range-values"><span>{currencySymbol}0</span><span>{currencySymbol}{maxPriceFilter}</span></div>
              <input 
                type="range" 
                className="range" 
                min="0" 
                max={sliderMax} 
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
              />
            </div>
            <div className="filter-section">
              <p className="filter-title">Minimum Order Quantity (MOQ)</p>
              <div className="moq-box">
                <input 
                  type="text" 
                  placeholder="Enter MOQ" 
                  value={moqInput}
                  onChange={(e) => setMoqInput(e.target.value)}
                />
                <button onClick={handleApplyMoq}>OK</button>
              </div>
              {appliedMoq !== null && (
                <div style={{ fontSize: '12px', color: '#ff6b00', marginTop: '5px' }}>
                  Applied Max MOQ: {appliedMoq}
                </div>
              )}
            </div>
            <div className="filter-section">
              <p className="filter-title">Country of Origin</p>
              {[...new Set(baseProducts.map(p => p.origin).filter(Boolean))].slice(0, 5).map(origin => {
                const count = baseProducts.filter(p => p.origin === origin).length;
                return (
                  <label key={origin}>
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
                    {origin} <span>({count})</span>
                  </label>
                );
              })}
            </div>
            <div className="filter-buttons">
              <button className="apply" onClick={() => {}}>Filters Active</button>
              <button className="reset" onClick={handleClearAll}>Reset</button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="products">
            {isLoading ? (
              <div className="loading-spinner">Loading products...</div>
            ) : displayMessage ? (
              <div className="empty-message">{displayMessage}</div>
            ) : (
              <div className="product-grid">
                {displayProducts.map((p, idx) => (
                  <div className="card whatsapp-card" key={idx}>
                    <div className="img-box">
                      <img src={p.img} alt={p.name} onError={(e) => { e.target.src = "/placeholder.jpg"; }} />
                    </div>
                    <div className="card-body whatsapp-style">
                      <span className="category-badge">{p.brand}</span>
                      <h4>{p.name}</h4>
                      <p className="short-desc">{p.shortDesc}</p>
                      <div className="product-price">{p.priceDisplay}</div>
                      <div className="product-meta">
                        <div className="meta-item"><span className="meta-icon">⚖️</span> quantity: {p.quantityDisplay}</div>
                        <div className="meta-item"><span className="meta-icon">📦</span> MOQ: {p.moq}</div>
                        <div className="meta-item"><span className="meta-icon">📍</span> Origin: {p.origin}</div>
                        <div className="meta-item"><span className="meta-icon">🗂️</span> Pack Type: {p.packTypes}</div>
                      </div>
                      <div className="card-actions">
                        <button className="btn-view" onClick={() => {
                          navigate("/product-details", { state: { product: p, firebaseId: p.id } });
                        }}>View Details</button>
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

export default ProductListing;
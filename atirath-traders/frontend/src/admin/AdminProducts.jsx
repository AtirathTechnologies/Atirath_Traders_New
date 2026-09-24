import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, get, push, set, remove, update } from 'firebase/database';



const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  
  const initialFormState = {
    name: '', category: 'Agri Products', subcategory: '', brand: '', origin: '', type: 'configurable',
    image: '', brandImage: '', gallery: '', description: '', metaDescription: '',
    basePrice: '', currency: 'USD', priceType: 'FOB', pricingUnit: 'per_carton',
    packingTypes: '', quantityUnits: '',
    moq: '', leadTime: '', features: '', shelfLife: '',
    packUnit: 'g', packWeight: '', packUnitsPerCarton: '',
    specifications: [{ key: '', value: '' }]
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const productsRef = ref(database, 'products');
      const snapshot = await get(productsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const productList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setProducts(productList);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index][field] = value;
    setFormData(prev => ({ ...prev, specifications: newSpecs }));
  };

  const addSpecField = () => {
    setFormData(prev => ({ ...prev, specifications: [...prev.specifications, { key: '', value: '' }] }));
  };

  const removeSpecField = (index) => {
    const newSpecs = formData.specifications.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, specifications: newSpecs }));
  };

  const openAddModal = () => {
    setCurrentProduct(null);
    setFormData(initialFormState);
    setActiveTab('basic');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setCurrentProduct(product);
    
    // Parse specs object to array of {key, value}
    let parsedSpecs = [{ key: '', value: '' }];
    if (product.specifications && typeof product.specifications === 'object') {
      parsedSpecs = Object.entries(product.specifications).map(([k, v]) => ({ key: k, value: v }));
      if (parsedSpecs.length === 0) parsedSpecs = [{ key: '', value: '' }];
    }

    let initialBasePrice = '';
    if (product.pricing?.basePrice) {
      initialBasePrice = String(product.pricing.basePrice);
    } else if (product.meta?.price_range) {
      initialBasePrice = `${product.meta.price_range.min}-${product.meta.price_range.max}`;
    } else if (product.meta?.baseExMillPrices) {
      const prices = Object.values(product.meta.baseExMillPrices);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      initialBasePrice = `${min}-${max}`;
    }

    setFormData({
      name: product.name || '',
      category: product.category || 'Agri Products',
      subcategory: product.subcategory || '',
      brand: product.brand || '',
      origin: product.origin || '',
      type: product.type || 'configurable',
      
      image: product.image || '',
      brandImage: product.brandImage || '',
      gallery: Array.isArray(product.gallery) ? product.gallery.join(', ') : (product.gallery || ''),
      description: product.description || '',
      metaDescription: product.meta?.description || '',
      
      basePrice: initialBasePrice,
      currency: product.pricing?.currency || 'USD',
      priceType: product.pricing?.priceType || 'FOB',
      pricingUnit: product.pricing?.unit || 'per_carton',
      
      packingTypes: Array.isArray(product.configurations?.packingTypes) ? product.configurations.packingTypes.join(', ') : '',
      quantityUnits: Array.isArray(product.configurations?.quantityUnits) ? product.configurations.quantityUnits.join(', ') : '',
      
      moq: product.productDetails?.moq || '',
      leadTime: product.productDetails?.leadTime || '',
      features: Array.isArray(product.productDetails?.features) ? product.productDetails.features.join(', ') : '',
      shelfLife: product.meta?.shelf_life || '',
      
      packUnit: product.packagingDetails?.unit || 'g',
      packWeight: product.packagingDetails?.unit_weight ? String(product.packagingDetails.unit_weight) : '',
      packUnitsPerCarton: product.packagingDetails?.units_per_carton ? String(product.packagingDetails.units_per_carton) : '',
      
      specifications: parsedSpecs
    });
    setActiveTab('basic');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await remove(ref(database, `products/${id}`));
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Build specs object
      const specsObj = {};
      formData.specifications.forEach(spec => {
        if (spec.key.trim() && spec.value.trim()) {
          specsObj[spec.key.trim()] = spec.value.trim();
        }
      });

      const productPayload = {
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        subcategory: formData.subcategory,
        origin: formData.origin,
        type: formData.type,
        description: formData.description,
        image: formData.image,
        brandImage: formData.brandImage,
        gallery: formData.gallery.split(',').map(s => s.trim()).filter(Boolean),
        
        configurations: {
          packingTypes: formData.packingTypes.split(',').map(s => s.trim()).filter(Boolean),
          quantityUnits: formData.quantityUnits.split(',').map(s => s.trim()).filter(Boolean),
        },
        
        meta: {
          description: formData.metaDescription,
          shelf_life: formData.shelfLife
        },
        
        pricing: {
          type: "fixed",
          basePrice: formData.basePrice || "",
          currency: formData.currency,
          priceType: formData.priceType,
          unit: formData.pricingUnit
        },
        
        packagingDetails: {
          unit: formData.packUnit,
          unit_weight: Number(formData.packWeight) || 0,
          units_per_carton: Number(formData.packUnitsPerCarton) || 0
        },
        
        productDetails: {
          moq: formData.moq,
          leadTime: formData.leadTime,
          features: formData.features.split(',').map(s => s.trim()).filter(Boolean)
        },
        
        specifications: specsObj
      };

      if (currentProduct) {
        await update(ref(database, `products/${currentProduct.id}`), productPayload);
      } else {
        const newProductRef = push(ref(database, 'products'));
        await set(newProductRef, productPayload);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product.");
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h2 className="admin-page-title">Manage Products</h2>
        <button className="admin-btn-primary" onClick={openAddModal}>
          <i className="fas fa-plus"></i> Add New Product
        </button>
      </div>

      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>No products found. Add one above!</div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => {
                  let displayPrice = '-';
                  if (product.pricing?.basePrice) {
                    displayPrice = `${product.pricing.basePrice} ${product.pricing.currency || 'USD'}`;
                  } else if (product.meta?.price_range) {
                    displayPrice = `${product.meta.price_range.min} - ${product.meta.price_range.max} INR`;
                  } else if (product.meta?.baseExMillPrices) {
                    const prices = Object.values(product.meta.baseExMillPrices);
                    const min = Math.min(...prices);
                    const max = Math.max(...prices);
                    displayPrice = `${min} - ${max} INR`;
                  }

                  return (
                  <tr key={product.id}>
                    <td>
                      <img 
                        src={product.image || '/placeholder.jpg'} 
                        alt={product.name || product.brand} 
                        className="admin-product-img"
                        onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                      />
                    </td>
                    <td><strong>{product.name || `${product.brand} Product`}</strong></td>
                    <td><span style={{ background: '#eef4ff', color: '#0b2c5f', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{product.category}</span></td>
                    <td>{product.brand || '-'}</td>
                    <td>{displayPrice}</td>
                    <td>
                      <button className="admin-action-btn edit" onClick={() => openEditModal(product)} title="Edit">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="admin-action-btn delete" onClick={() => handleDelete(product.id)} title="Delete">
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content" style={{ maxWidth: '800px' }}>
            <div className="admin-modal-header">
              <h3>{currentProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="admin-close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            
            <div className="admin-modal-tabs">
              <button type="button" className={`admin-tab-btn ${activeTab === 'basic' ? 'active' : ''}`} onClick={() => setActiveTab('basic')}>Basic Info</button>
              <button type="button" className={`admin-tab-btn ${activeTab === 'media' ? 'active' : ''}`} onClick={() => setActiveTab('media')}>Media & Desc</button>
              <button type="button" className={`admin-tab-btn ${activeTab === 'pricing' ? 'active' : ''}`} onClick={() => setActiveTab('pricing')}>Pricing & Config</button>
              <button type="button" className={`admin-tab-btn ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Specs & Details</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                
                {/* BASIC INFO TAB */}
                {activeTab === 'basic' && (
                  <div className="tab-content">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="admin-form-group">
                        <label>Product Name</label>
                        <input type="text" name="name" className="admin-form-control" value={formData.name} onChange={handleInputChange} />
                      </div>
                      <div className="admin-form-group">
                        <label>Brand *</label>
                        <input type="text" name="brand" className="admin-form-control" value={formData.brand} onChange={handleInputChange} required />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="admin-form-group">
                        <label>Category *</label>
                        <input type="text" name="category" className="admin-form-control" value={formData.category} onChange={handleInputChange} placeholder="e.g., Agri Products" required />
                      </div>
                      <div className="admin-form-group">
                        <label>Subcategory</label>
                        <input type="text" name="subcategory" className="admin-form-control" value={formData.subcategory} onChange={handleInputChange} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="admin-form-group">
                        <label>Origin Country</label>
                        <input type="text" name="origin" className="admin-form-control" value={formData.origin} onChange={handleInputChange} />
                      </div>
                      <div className="admin-form-group">
                        <label>Product Type</label>
                        <input type="text" name="type" className="admin-form-control" value={formData.type} onChange={handleInputChange} placeholder="e.g., configurable, simple" />
                      </div>
                    </div>
                  </div>
                )}

                {/* MEDIA & DESC TAB */}
                {activeTab === 'media' && (
                  <div className="tab-content">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="admin-form-group">
                        <label>Main Image URL *</label>
                        <input type="url" name="image" className="admin-form-control" value={formData.image} onChange={handleInputChange} required />
                      </div>
                      <div className="admin-form-group">
                        <label>Brand Image URL</label>
                        <input type="url" name="brandImage" className="admin-form-control" value={formData.brandImage} onChange={handleInputChange} />
                      </div>
                    </div>
                    <div className="admin-form-group">
                      <label>Gallery Images (Comma separated URLs)</label>
                      <input type="text" name="gallery" className="admin-form-control" value={formData.gallery} onChange={handleInputChange} placeholder="url1.jpg, url2.jpg" />
                    </div>
                    <div className="admin-form-group">
                      <label>Full Description</label>
                      <textarea name="description" className="admin-form-control" value={formData.description} onChange={handleInputChange} style={{ minHeight: '120px' }}></textarea>
                    </div>
                    <div className="admin-form-group">
                      <label>Meta Description (Short)</label>
                      <textarea name="metaDescription" className="admin-form-control" value={formData.metaDescription} onChange={handleInputChange} style={{ minHeight: '60px' }}></textarea>
                    </div>
                  </div>
                )}

                {/* PRICING & CONFIG TAB */}
                {activeTab === 'pricing' && (
                  <div className="tab-content">
                    <h4 style={{ margin: '0 0 16px 0', color: '#0b2c5f' }}>Pricing</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="admin-form-group">
                        <label>Base Price</label>
                        <input type="text" name="basePrice" className="admin-form-control" value={formData.basePrice} onChange={handleInputChange} placeholder="e.g., 100 or 100-400" />
                      </div>
                      <div className="admin-form-group">
                        <label>Currency</label>
                        <input type="text" name="currency" className="admin-form-control" value={formData.currency} onChange={handleInputChange} placeholder="USD" />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="admin-form-group">
                        <label>Price Type</label>
                        <input type="text" name="priceType" className="admin-form-control" value={formData.priceType} onChange={handleInputChange} placeholder="FOB, CIF etc." />
                      </div>
                      <div className="admin-form-group">
                        <label>Pricing Unit</label>
                        <input type="text" name="pricingUnit" className="admin-form-control" value={formData.pricingUnit} onChange={handleInputChange} placeholder="per_carton, per_mt etc." />
                      </div>
                    </div>

                    <h4 style={{ margin: '24px 0 16px 0', color: '#0b2c5f' }}>Configurations</h4>
                    <div className="admin-form-group">
                      <label>Packing Types (Comma separated)</label>
                      <input type="text" name="packingTypes" className="admin-form-control" value={formData.packingTypes} onChange={handleInputChange} placeholder="Non, BOPP, PP, Jar" />
                    </div>
                    <div className="admin-form-group">
                      <label>Quantity Units (Comma separated)</label>
                      <input type="text" name="quantityUnits" className="admin-form-control" value={formData.quantityUnits} onChange={handleInputChange} placeholder="5kg, 10kg, 454g x 12" />
                    </div>
                  </div>
                )}

                {/* SPECS & DETAILS TAB */}
                {activeTab === 'details' && (
                  <div className="tab-content">
                    <h4 style={{ margin: '0 0 16px 0', color: '#0b2c5f' }}>Product Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="admin-form-group">
                        <label>MOQ</label>
                        <input type="text" name="moq" className="admin-form-control" value={formData.moq} onChange={handleInputChange} placeholder="200 cartons, 1 MT" />
                      </div>
                      <div className="admin-form-group">
                        <label>Lead Time</label>
                        <input type="text" name="leadTime" className="admin-form-control" value={formData.leadTime} onChange={handleInputChange} placeholder="7 - 10 Days" />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="admin-form-group">
                        <label>Shelf Life</label>
                        <input type="text" name="shelfLife" className="admin-form-control" value={formData.shelfLife} onChange={handleInputChange} placeholder="1 Year" />
                      </div>
                      <div className="admin-form-group">
                        <label>Features (Comma separated)</label>
                        <input type="text" name="features" className="admin-form-control" value={formData.features} onChange={handleInputChange} placeholder="Soft texture, Natural flavor" />
                      </div>
                    </div>

                    <h4 style={{ margin: '24px 0 16px 0', color: '#0b2c5f' }}>Packaging Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <div className="admin-form-group">
                        <label>Unit (e.g., g, kg)</label>
                        <input type="text" name="packUnit" className="admin-form-control" value={formData.packUnit} onChange={handleInputChange} />
                      </div>
                      <div className="admin-form-group">
                        <label>Unit Wt.</label>
                        <input type="number" name="packWeight" className="admin-form-control" value={formData.packWeight} onChange={handleInputChange} />
                      </div>
                      <div className="admin-form-group">
                        <label>Units/Carton</label>
                        <input type="number" name="packUnitsPerCarton" className="admin-form-control" value={formData.packUnitsPerCarton} onChange={handleInputChange} />
                      </div>
                    </div>

                    <h4 style={{ margin: '24px 0 16px 0', color: '#0b2c5f' }}>Specifications</h4>
                    {formData.specifications.map((spec, index) => (
                      <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                        <input 
                          type="text" 
                          className="admin-form-control" 
                          placeholder="Key (e.g., Moisture)" 
                          value={spec.key} 
                          onChange={(e) => handleSpecChange(index, 'key', e.target.value)} 
                          style={{ flex: 1 }}
                        />
                        <input 
                          type="text" 
                          className="admin-form-control" 
                          placeholder="Value (e.g., Max 15%)" 
                          value={spec.value} 
                          onChange={(e) => handleSpecChange(index, 'value', e.target.value)} 
                          style={{ flex: 1 }}
                        />
                        <button type="button" onClick={() => removeSpecField(index)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={addSpecField} style={{ background: '#eef4ff', color: '#0b2c5f', border: '1px dashed #0b2c5f', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}>
                      + Add Specification
                    </button>
                  </div>
                )}

              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn-primary">
                  {currentProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProducts;

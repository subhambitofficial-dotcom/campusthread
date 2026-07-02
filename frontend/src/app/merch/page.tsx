'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { ShoppingCart, Tag, Flame, Plus, Minus, X, Trash2, ArrowRight, ShieldCheck, Heart, Sparkles, Send, Download } from 'lucide-react';

interface CartItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  size: string;
  color: string;
}

export default function MerchStore() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  // Cart States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Variant selections (product-id map)
  const [sizeSelections, setSizeSelections] = useState<Record<string, string>>({});
  const [colorSelections, setColorSelections] = useState<Record<string, string>>({});

  // Custom Quote Form States
  const [productType, setProductType] = useState('Hoodies');
  const [quantity, setQuantity] = useState(30);
  const [details, setDetails] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [quoteSuccess, setQuoteSuccess] = useState(false);

  // Simulated Razorpay Checkout States
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'method' | 'processing' | 'invoice'>('method');
  const [generatedInvoice, setGeneratedInvoice] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/merch');
        setProducts(res);
        
        // Setup initial default variants
        const sizes: Record<string, string> = {};
        const colors: Record<string, string> = {};
        res.forEach((prod: any) => {
          sizes[prod.id] = prod.variants?.sizes?.[0] || 'M';
          colors[prod.id] = prod.variants?.colors?.[0] || 'Black';
        });
        setSizeSelections(sizes);
        setColorSelections(colors);
      } catch (err) {
        console.error('Failed to load store catalog:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  // Cart Logic handlers
  const addToCart = (product: any) => {
    const size = sizeSelections[product.id];
    const color = colorSelections[product.id];
    
    setCart(prev => {
      const existingIdx = prev.findIndex(
        it => it.productId === product.id && it.size === size && it.color === color
      );

      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            title: product.title,
            price: product.price,
            image: product.images?.[0] || '/placeholders/merch.jpg',
            quantity: 1,
            size,
            color
          }
        ];
      }
    });
    setCartOpen(true);
  };

  const updateQuantity = (idx: number, delta: number) => {
    setCart(prev => {
      const item = prev[idx];
      const newQty = item.quantity + delta;
      
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== idx);
      } else {
        const updated = [...prev];
        updated[idx].quantity = newQty;
        return updated;
      }
    });
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // Submit custom quote requests
  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check authentication
    const activeUser = api.getCurrentUser();
    if (!activeUser) {
      alert('Authentication required. Please click "Enter Campus" at the top navbar to sign in.');
      return;
    }

    try {
      await api.post('/merch/quote', {
        productType,
        quantity: Number(quantity),
        details,
        contactEmail,
        whatsapp
      });

      setQuoteSuccess(true);
      setTimeout(() => {
        setQuoteSuccess(false);
        setDetails('');
        setContactEmail('');
        setWhatsapp('');
      }, 5000);

    } catch (err) {
      alert('Failed to log custom quote request.');
    }
  };

  // Trigger simulated cart checkout
  const handleInitiateCheckout = () => {
    const activeUser = api.getCurrentUser();
    if (!activeUser) {
      alert('Authentication required. Please click "Enter Campus" to login.');
      return;
    }
    
    setShowCheckout(true);
    setPaymentStep('method');
  };

  // Authorize Payment, sync database stock, and render printable HTML invoice
  const handleAuthorizeCheckout = async () => {
    setPaymentStep('processing');
    
    try {
      const orderId = `order_ct_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      
      // Hit backend API to process cart verifying stocks & decrementing counts
      const res = await api.post('/payments/verify', {
        orderId,
        type: 'merch',
        orderDetails: cart.map(it => ({
          productId: it.productId,
          title: it.title,
          price: it.price,
          quantity: it.quantity,
          selectedSize: it.size,
          selectedColor: it.color
        }))
      });

      setGeneratedInvoice(res.invoice);
      setCart([]); // Clear cart
      
      setTimeout(() => {
        setPaymentStep('invoice');
      }, 1500);

    } catch (err: any) {
      alert(err.message || 'Verification failed. Out of stock properties.');
      setShowCheckout(false);
    }
  };

  return (
    <div className="w-full relative flex flex-col pb-24">
      
      {/* Background radial gradient adaptors */}
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-brand-pink/5 blur-[120px] pointer-events-none" />

      {/* ================= STORE TITLE BANNER ================= */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-pink/10 border border-brand-pink/20 text-[10px] font-bold uppercase tracking-wider text-brand-pink mb-4">
            <Flame className="w-3.5 h-3.5" /> Exclusive streetwear drop
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white">CampusThread Co.</h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1 font-light">The identity commerce layer for prestigious university societies</p>
        </div>

        {/* View Cart Pill trigger */}
        <button 
          onClick={() => setCartOpen(true)}
          className="relative inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-brand-cyan to-brand-pink text-black font-extrabold text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,0,127,0.3)]"
        >
          <ShoppingCart className="w-4 h-4 text-black" />
          <span>My Cart</span>
          {cart.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white text-black font-black text-[10px] flex items-center justify-center border-2 border-black">
              {cart.reduce((sum, it) => sum + it.quantity, 0)}
            </span>
          )}
        </button>
      </section>

      {/* ================= CATALOG WITH ACCENT CATEGORIES ================= */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Filtering buttons */}
        <div className="flex gap-2 border-b border-white/5 pb-4 mb-8 overflow-x-auto">
          {['all', 'hoodies', 'oversized-tees', 'drops'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shrink-0 ${activeCategory === cat ? 'bg-white text-black' : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'}`}
            >
              {cat.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Catalog grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2].map(n => (
              <div key={n} className="h-96 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="glass p-12 rounded-2xl text-center border border-white/5 text-xs text-white/40">
            No active apparel stock listed under this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => {
              const sizes = product.variants?.sizes || ['S', 'M', 'L'];
              const colors = product.variants?.colors || ['Black'];
              
              const currentSize = sizeSelections[product.id] || 'M';
              const currentColor = colorSelections[product.id] || 'Black';
              
              // Low stock tag alert
              const isLowStock = product.stock <= 30;

              return (
                <div 
                  key={product.id || product._id}
                  className="glass rounded-2xl border border-white/5 flex flex-col overflow-hidden group hover:border-brand-pink/30 transition-all duration-300 relative"
                >
                  {/* Photo Container */}
                  <div className="h-64 w-full relative overflow-hidden bg-black/20">
                    <img 
                      src={product.images?.[0]} 
                      alt={product.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Hype drop countdown tag */}
                    {product.countdownDropDate && (
                      <div className="absolute top-4 left-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-cyan/25 border border-brand-cyan/30 text-[9px] uppercase font-tech text-brand-cyan tracking-wider font-extrabold shadow-md">
                        <Flame className="w-3.5 h-3.5 animate-bounce" /> Hype Drop scheduled
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-grow flex flex-col gap-4">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-extrabold text-lg text-white group-hover:text-brand-pink transition-colors line-clamp-1">{product.title}</h3>
                        <span className="font-black text-brand-pink tracking-tight shrink-0">₹{product.price}</span>
                      </div>
                      <p className="text-xs text-white/50 font-light mt-1.5 line-clamp-2 leading-relaxed">{product.description}</p>
                    </div>

                    {/* Stock stats */}
                    <div className="flex justify-between items-center text-[10px] text-white/40 uppercase font-tech tracking-wider">
                      <span className={isLowStock ? 'text-brand-pink font-semibold' : ''}>
                        {isLowStock ? `⚠️ Only ${product.stock} units left` : '🟢 Stock in Vault'}
                      </span>
                      <span>Stock ID: {product.id}</span>
                    </div>

                    {/* Dynamic Selectors row */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                      <div>
                        <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Pick Size</label>
                        <select 
                          value={currentSize}
                          onChange={(e) => setSizeSelections(prev => ({ ...prev, [product.id]: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg bg-card border border-white/10 text-white text-xs focus:outline-none focus:border-brand-cyan transition-all"
                        >
                          {sizes.map((s: string) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Pick Color</label>
                        <select 
                          value={currentColor}
                          onChange={(e) => setColorSelections(prev => ({ ...prev, [product.id]: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg bg-card border border-white/10 text-white text-xs focus:outline-none focus:border-brand-cyan transition-all"
                        >
                          {colors.map((c: string) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Add to Cart button */}
                    <button 
                      onClick={() => addToCart(product)}
                      className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white text-white hover:text-black border border-white/10 hover:border-transparent text-xs font-bold transition-all uppercase tracking-widest mt-2"
                    >
                      Add To Cart drawer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= CUSTOM HOODIE QUOTE BUILDER SECTION ================= */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="glass p-8 sm:p-10 rounded-3xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/5 blur-2xl pointer-events-none" />
          
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-cyan/15 border border-brand-cyan/20 text-[9px] font-bold uppercase tracking-widest text-brand-cyan mb-3">
              <Sparkles className="w-3.5 h-3.5" /> No-code designer syndicate
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Custom Trip / Society Merch</h2>
            <p className="text-xs sm:text-sm text-white/50 mt-1 font-light">Planning a batch trip or launching custom hoodies for your hackathon? Submit specifications for a premium visual quote.</p>
          </div>

          {quoteSuccess ? (
            <div className="p-8 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 text-center flex flex-col items-center gap-3">
              <ShieldCheck className="w-10 h-10 text-brand-cyan mb-1" />
              <h4 className="font-bold text-white text-lg">Custom Quote Logged Successfully</h4>
              <p className="text-xs text-white/60">Our merchandise managers will review details and trigger custom design options directly to your Whatsapp.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitQuote} className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1.5">Apparel Selection</label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-white/10 text-white text-sm focus:outline-none focus:border-brand-cyan"
                >
                  <option value="Hoodies">Oversized Hoodies (420 GSM)</option>
                  <option value="Tees">Drop-Shoulder Tees (240 GSM)</option>
                  <option value="Caps">Vintage Snapbacks & Caps</option>
                  <option value="Varsity">Felt Varsity Jackets</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1.5">Estimated Quantity</label>
                <input 
                  type="number" 
                  min="20"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1.5">Trip details / Design Ideas</label>
                <textarea 
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="e.g. Need 40 Navy-Blue hoodies for our Himachal Autumn trip. Left chest: ByteClub logo. Back print: custom typography print 'Into the Clouds'..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1.5">Campus Email</label>
                <input 
                  type="email" 
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="name@campusthread.edu"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1.5">WhatsApp Number</label>
                <input 
                  type="text" 
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+91 9988776655"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
                  required
                />
              </div>

              <button 
                type="submit"
                className="sm:col-span-2 py-4 mt-2 rounded-xl bg-brand-cyan text-black font-extrabold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all"
              >
                <Send className="w-4 h-4 text-black" /> Submit Quote Request
              </button>
            </form>
          )}

        </div>
      </section>

      {/* ================= CART GLASS SLIDE-OUT DRAWER ================= */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass border-l border-white/10 h-full flex flex-col p-6 animate-fade-in relative">
            
            {/* Drawer Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-brand-pink" />
                <h3 className="text-xl font-extrabold text-white">Ecosystem Cart</h3>
              </div>
              <button 
                onClick={() => setCartOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:text-brand-pink text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center gap-3 text-center text-white/40">
                <ShoppingCart className="w-10 h-10 stroke-[1.5]" />
                <div>
                  <p className="font-bold text-sm text-white">Cart Vault Empty</p>
                  <p className="text-[10px] mt-0.5">Explore active hoodie and tees catalogs to secure identity drops.</p>
                </div>
              </div>
            ) : (
              <div className="flex-grow flex flex-col gap-4 overflow-y-auto pr-2">
                {cart.map((item, idx) => (
                  <div key={idx} className="glass p-4 rounded-xl border border-white/5 flex gap-4 items-center">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-14 h-14 rounded-lg object-cover border border-white/10 shrink-0" 
                    />
                    
                    <div className="flex-grow overflow-hidden text-left">
                      <h5 className="font-bold text-xs text-white truncate">{item.title}</h5>
                      <p className="text-[10px] text-white/40 uppercase font-tech tracking-wider mt-0.5">Size: {item.size} • Color: {item.color}</p>
                      <p className="text-xs font-bold text-brand-pink mt-1">₹{item.price}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => updateQuantity(idx, -1)}
                        className="p-1 rounded-md bg-white/5 border border-white/10 text-white hover:bg-white/10"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(idx, 1)}
                        className="p-1 rounded-md bg-white/5 border border-white/10 text-white hover:bg-white/10"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="pt-6 border-t border-white/5 mt-auto flex flex-col gap-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60 font-semibold">Subtotal</span>
                  <span className="text-xl font-black text-white tracking-tight">₹{calculateSubtotal()}</span>
                </div>
                
                <p className="text-[10px] text-white/40 text-left">Prices include simulated digital receipts and automated shipping tracking on profiles.</p>
                
                <button 
                  onClick={handleInitiateCheckout}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-brand-cyan via-brand-pink to-brand-purple text-black font-extrabold text-sm hover:opacity-90 active:scale-95 transition-all"
                >
                  <ShieldCheck className="w-5 h-5 text-black" /> Proceed to Simulated Checkout
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ================= HIGH-FIDELITY SIMULATED RAZORPAY CART CHECKOUT OVERLAY ================= */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#111322] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-float">
            
            {/* Modal header */}
            <div className="bg-[#1e2136] p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-brand-pink rounded flex items-center justify-center font-bold text-black text-xs">R</div>
                <div>
                  <h4 className="font-extrabold text-sm text-white tracking-tight">Razorpay Invoicing (Simulation)</h4>
                  <p className="text-[9px] text-white/40 tracking-wider">Securing CampusThread (Mock Sandbox)</p>
                </div>
              </div>
              <span className="text-base font-black text-brand-pink tracking-tight">₹{calculateSubtotal()}</span>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[500px]">
              
              {paymentStep === 'method' && (
                <div className="flex flex-col gap-4 text-left">
                  <h5 className="font-bold text-white text-sm">Review Cart Cart:</h5>
                  <div className="flex flex-col gap-2 max-h-36 overflow-y-auto mb-4 border-b border-white/5 pb-4 pr-1">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-white/60">
                        <span>{item.title} (Size: {item.size}) x{item.quantity}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-xs text-white/60">Select Simulated Authorized Verification Option:</p>
                  
                  <button 
                    onClick={handleAuthorizeCheckout}
                    className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left text-sm font-bold flex items-center justify-between hover:border-brand-pink/40 transition-all"
                  >
                    <span>Instant Simulated Payment Authentication</span>
                    <span className="text-xs font-mono text-brand-pink">Visa/UPI Bypass</span>
                  </button>
                </div>
              )}

              {paymentStep === 'processing' && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-brand-pink animate-spin" />
                  <div>
                    <p className="text-sm font-bold text-center text-white">Verifying Transaction</p>
                    <p className="text-[10px] text-center text-white/40 mt-1 font-mono">Securing cryptographic signatures...</p>
                  </div>
                </div>
              )}

              {paymentStep === 'invoice' && (
                <div className="flex flex-col gap-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-brand-neon/20 border border-brand-neon/30 flex items-center justify-center text-brand-neon mx-auto mb-1">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  
                  <div>
                    <h5 className="font-extrabold text-sm text-white">Payment Authorized!</h5>
                    <p className="text-[10px] text-white/40 mt-0.5">Receipt generated inside active user profiles</p>
                  </div>

                  {/* Dynamic invoice injection */}
                  <div 
                    className="text-left select-text max-h-56 overflow-y-auto pr-1"
                    dangerouslySetInnerHTML={{ __html: generatedInvoice }} 
                  />

                  <div className="flex gap-3">
                    <button 
                      onClick={() => { setShowCheckout(false); }}
                      className="w-full py-4.5 rounded-xl bg-white text-black text-xs font-black uppercase tracking-wider"
                    >
                      Return to Store
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

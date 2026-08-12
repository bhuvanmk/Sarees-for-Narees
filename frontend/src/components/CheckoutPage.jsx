import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Plus, MapPin, CreditCard, ShieldCheck } from 'lucide-react';
import Navbar from './Navbar';
import { api } from '../services/api';

// Dynamically load Razorpay script only when needed (avoids preload/tracking warnings on other pages)
let razorpayScriptPromise = null;
function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);
  if (razorpayScriptPromise) return razorpayScriptPromise;
  razorpayScriptPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => { razorpayScriptPromise = null; resolve(false); };
    document.body.appendChild(script);
  });
  return razorpayScriptPromise;
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // 'CARD', 'UPI', 'COD'
  
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [notification, setNotification] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null); // Triggers PostOrderReviewModal

  // New Address Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [addressType, setAddressType] = useState('Home');

  const navigate = useNavigate();

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    setLoading(true);
    const cartRes = await api.getCartItems();
    if (cartRes.ok && Array.isArray(cartRes.data)) {
      setCartItems(cartRes.data);
    }

    const addrRes = await api.getAddresses();
    if (addrRes.ok && Array.isArray(addrRes.data)) {
      setAddresses(addrRes.data);
      if (addrRes.data.length > 0) {
        const def = addrRes.data.find(a => a.isDefault) || addrRes.data[0];
        setSelectedAddressId(def.addressId);
      } else {
        setShowAddressForm(true);
      }
    }
    setLoading(false);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (addresses.length >= 5) {
      showNotification('Delete an existing address to add a new one (Limit: 5 saved addresses).', 'error');
      return;
    }

    const res = await api.addAddress({
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state: stateName,
      pincode,
      addressType
    });

    if (res.ok) {
      showNotification('Address saved successfully!');
      setShowAddressForm(false);
      loadCheckoutData();
    } else {
      showNotification(res.data.message || 'Failed to save address', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    const res = await api.deleteAddress(id);
    if (res.ok) {
      showNotification('Address deleted.');
      loadCheckoutData();
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
  const shippingFee = subtotal > 2999 || subtotal === 0 ? 0 : 250;
  const totalAmount = subtotal + shippingFee;

  const handleCompleteOrder = async () => {
    if (!selectedAddressId) {
      showNotification('Please select or add a delivery address.', 'error');
      return;
    }

    const addressObj = addresses.find(a => a.addressId === selectedAddressId);
    const addressSnapshot = `${addressObj.fullName}, ${addressObj.phone}\n${addressObj.addressLine1}, ${addressObj.addressLine2 || ''}\n${addressObj.city}, ${addressObj.state} - ${addressObj.pincode} (${addressObj.addressType})`;

    setProcessingPayment(true);

    if (paymentMethod === 'COD') {
      // Cash on Delivery direct order
      const checkoutRes = await api.createCodOrder(addressSnapshot);
      if (checkoutRes.ok) {
        showNotification('Order placed successfully with Cash on Delivery!', 'success');
        setCartItems([]);
        window.dispatchEvent(new CustomEvent('cart-updated'));
        setCompletedOrder(checkoutRes.data);
      } else {
        showNotification(checkoutRes.data.message || 'Order creation failed.', 'error');
      }
      setProcessingPayment(false);
      return;
    }

    // Razorpay (Card / UPI via Razorpay Checkout)
    try {
      // Dynamically load Razorpay script only when needed
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        showNotification('Payment gateway could not be loaded. Please check your internet connection and try again.', 'error');
        setProcessingPayment(false);
        return;
      }

      const orderRes = await api.createPaymentOrder(totalAmount);
      if (!orderRes.ok || !orderRes.data.id) {
        showNotification(orderRes.data.message || 'Failed to initialize payment gateway.', 'error');
        setProcessingPayment(false);
        return;
      }

      const rzpData = orderRes.data;

      const options = {
        key: rzpData.key,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: "Sarees For Naaris",
        description: "Pure Handloom Saree Order",
        image: "/brand_logo.png",
        order_id: rzpData.id,
        handler: async function (response) {
          const verifyRes = await api.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            address_snapshot: addressSnapshot,
            payment_method: paymentMethod
          });

          if (verifyRes.ok) {
            showNotification('Payment verified! Order placed successfully.', 'success');
            setCartItems([]);
            window.dispatchEvent(new CustomEvent('cart-updated'));
            setCompletedOrder(verifyRes.data);
          } else {
            showNotification(verifyRes.data.message || 'Payment verification failed.', 'error');
          }
        },

        modal: {
          ondismiss: function () {
            // User closed the Razorpay popup — not an error
            showNotification('Payment was cancelled. You can try again when ready.', 'error');
          }
        },
        prefill: {
          name: addressObj.fullName,
          contact: addressObj.phone,
          email: api.getUser()?.email || ''
        },
        theme: { color: "#70161E" }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        const errorDesc = response.error?.description || 'Transaction declined';
        const errorReason = response.error?.reason || '';
        // Only show notification for real failures, not user cancellations
        if (errorReason !== 'payment_cancelled') {
          showNotification('Payment failed: ' + errorDesc, 'error');
        }
      });
      rzp.open();
    } catch (err) {
      showNotification('Payment error: ' + err.message, 'error');
    } finally {
      setProcessingPayment(false);
    }
  };

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      {notification && (
        <div className={`toast-notification ${notification.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{notification.msg}</span>
        </div>
      )}

      <div className="cart-page-container">
        {completedOrder ? (
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '640px', margin: '2rem auto', border: '1.5px solid #D4AF37', background: '#FFFFFF', borderRadius: '20px', boxShadow: '0 10px 30px rgba(212, 175, 55, 0.15)' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto' }}>
              <CheckCircle size={42} />
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', color: '#2D251E', fontSize: '1.8rem', marginBottom: '0.5rem' }}>Order Placed Successfully!</h1>
            <p style={{ color: '#786C60', fontSize: '1rem', marginBottom: '1.5rem' }}>Thank you for shopping with Sarees For Naaris. Your handloom saree order is confirmed!</p>

            <div style={{ background: '#FAF7F2', padding: '1.2rem 1.5rem', borderRadius: '12px', textAlign: 'left', marginBottom: '1.8rem', border: '1px solid #EFE6D8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: '700', color: '#2D251E' }}>
                <span>Order ID: #{completedOrder.orderId || completedOrder.id}</span>
                <span style={{ color: '#B48811' }}>Status: {completedOrder.status || 'CONFIRMED'}</span>
              </div>
              {completedOrder.totalAmount && (
                <div style={{ fontSize: '0.95rem', color: '#4A3B32', marginBottom: '0.5rem' }}>
                  <strong>Total Paid:</strong> ₹{Number(completedOrder.totalAmount).toLocaleString('en-IN')}
                </div>
              )}
              {completedOrder.addressSnapshot && (
                <div style={{ fontSize: '0.88rem', color: '#66594C', whiteSpace: 'pre-line', marginTop: '0.5rem', borderTop: '1px dashed #E5DBCB', paddingTop: '0.5rem' }}>
                  <strong>Delivery Address:</strong><br />
                  {completedOrder.addressSnapshot}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                className="btn-gold" 
                style={{ padding: '0.8rem 1.8rem', width: 'auto' }}
                onClick={() => navigate('/orders')}
              >
                📦 View My Orders
              </button>
              <button 
                className="btn-hero-secondary" 
                style={{ padding: '0.8rem 1.8rem', width: 'auto' }}
                onClick={() => navigate('/products')}
              >
                🛍️ Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="page-title">Checkout & Payment</h1>
            {loading ? (
              <div className="loading-spinner-wrapper">
                <div className="spinner"></div>
                <p>Loading address and payment options...</p>
              </div>
            ) : (
              <div className="cart-content-grid">

            {/* Step 1 & Step 2 Column */}
            <div className="cart-items-column">
              {/* Step 1: Address Selection */}
              <div className="glass-panel" style={{ padding: '1.8rem', marginBottom: '2rem', border: '1px solid var(--border-color)', background: '#FFFFFF' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-accent)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={20} /> Step 1: Select Delivery Address
                </h3>

                {addresses.length > 0 && !showAddressForm && (
                  <div className="address-list-grid" style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                    {addresses.map(addr => (
                      <div 
                        key={addr.addressId} 
                        style={{
                          padding: '1rem',
                          borderRadius: '12px',
                          border: selectedAddressId === addr.addressId ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                          background: selectedAddressId === addr.addressId ? 'rgba(200, 155, 60, 0.08)' : '#FFFFFF',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(45, 36, 20, 0.04)'
                        }}
                        onClick={() => setSelectedAddressId(addr.addressId)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '0.98rem' }}>{addr.fullName} ({addr.addressType})</strong>
                          <span style={{ fontSize: '0.78rem', background: 'rgba(200, 155, 60, 0.15)', color: 'var(--color-primary-hover)', fontWeight: '600', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                            {addr.phone}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: '0.2rem 0' }}>
                          {addr.addressLine1}, {addr.addressLine2 ? `${addr.addressLine2}, ` : ''}{addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <button 
                          style={{ background: 'none', border: 'none', color: 'var(--error)', fontSize: '0.8rem', fontWeight: '600', marginTop: '0.4rem', cursor: 'pointer', padding: 0 }}
                          onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr.addressId); }}
                        >
                          Delete Address
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {!showAddressForm ? (
                  <button 
                    className="btn-gold" 
                    style={{ background: 'transparent', border: '1px dashed var(--color-primary)', color: 'var(--color-primary-hover)' }}
                    onClick={() => setShowAddressForm(true)}
                  >
                    <Plus size={16} /> Add New Delivery Address
                  </button>
                ) : (
                  <form onSubmit={handleAddAddress} style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <input type="text" placeholder="Full Name" value={fullName} onChange={(e)=>setFullName(e.target.value)} required className="form-input" />
                      <input type="tel" placeholder="Mobile Phone" value={phone} onChange={(e)=>setPhone(e.target.value)} required className="form-input" />
                    </div>
                    <input type="text" placeholder="Address Line 1" value={addressLine1} onChange={(e)=>setAddressLine1(e.target.value)} required className="form-input" />
                    <input type="text" placeholder="Address Line 2 (Optional)" value={addressLine2} onChange={(e)=>setAddressLine2(e.target.value)} className="form-input" />
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <input type="text" placeholder="City" value={city} onChange={(e)=>setCity(e.target.value)} required className="form-input" />
                      <input type="text" placeholder="State" value={stateName} onChange={(e)=>setStateName(e.target.value)} required className="form-input" />
                      <input type="text" placeholder="PIN Code" value={pincode} onChange={(e)=>setPincode(e.target.value)} required className="form-input" />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <select value={addressType} onChange={(e)=>setAddressType(e.target.value)} className="form-select" style={{ maxWidth: '150px' }}>
                        <option value="Home">Home</option>
                        <option value="Work">Work</option>
                        <option value="Other">Other</option>
                      </select>
                      <button type="submit" className="btn-gold" style={{ width: 'auto', padding: '0.6rem 1.5rem' }}>Save & Select Address</button>
                      {addresses.length > 0 && <button type="button" className="btn-hero-secondary" onClick={()=>setShowAddressForm(false)}>Cancel</button>}
                    </div>
                  </form>
                )}
              </div>

              {/* Step 2: Payment Method Selection */}
              <div className="glass-panel" style={{ padding: '1.8rem', border: '1px solid var(--border-color)', background: '#FFFFFF' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-accent)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CreditCard size={20} /> Step 2: Select Payment Method
                </h3>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  <label style={{ padding: '1.1rem', borderRadius: '10px', border: paymentMethod === 'CARD' ? '2px solid var(--color-primary)' : '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', background: paymentMethod === 'CARD' ? 'rgba(200, 155, 60, 0.08)' : '#FFFFFF' }}>
                    <input type="radio" name="payment" checked={paymentMethod === 'CARD'} onChange={()=>setPaymentMethod('CARD')} />
                    <div>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.96rem' }}>Credit / Debit Card (via Razorpay)</strong>
                      <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>Visa, Mastercard, RuPay, Maestro</p>
                    </div>
                  </label>

                  <label style={{ padding: '1.1rem', borderRadius: '10px', border: paymentMethod === 'UPI' ? '2px solid var(--color-primary)' : '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', background: paymentMethod === 'UPI' ? 'rgba(200, 155, 60, 0.08)' : '#FFFFFF' }}>
                    <input type="radio" name="payment" checked={paymentMethod === 'UPI'} onChange={()=>setPaymentMethod('UPI')} />
                    <div>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.96rem' }}>UPI (Google Pay, PhonePe, Paytm, BHIM)</strong>
                      <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>Instant UPI QR code or Intent collect via Razorpay</p>
                    </div>
                  </label>

                  <label style={{ padding: '1.1rem', borderRadius: '10px', border: paymentMethod === 'COD' ? '2px solid var(--color-primary)' : '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', background: paymentMethod === 'COD' ? 'rgba(200, 155, 60, 0.08)' : '#FFFFFF' }}>
                    <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={()=>setPaymentMethod('COD')} />
                    <div>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.96rem' }}>Cash on Delivery (COD)</strong>
                      <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>Pay cash upon saree delivery at your doorstep</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Sidebar Summary & Final Place Order Button */}
            <div className="order-summary-sidebar">
              <h3 className="summary-title">Order Summary ({cartItems.length} Items)</h3>
              <div className="summary-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
              <div className="summary-row"><span>Express Shipping</span><span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span></div>
              <hr className="summary-divider" />
              <div className="summary-row total-row"><span>Total Payable</span><span>₹{totalAmount.toLocaleString('en-IN')}</span></div>

              <button className="btn-gold checkout-primary-btn" onClick={handleCompleteOrder} disabled={processingPayment || !selectedAddressId}>
                {processingPayment ? <span className="spinner"></span> : `Confirm Order (₹${totalAmount.toLocaleString('en-IN')})`}
              </button>

              <div className="trust-badge-box">
                <ShieldCheck size={20} color="#D4AF37" />
                <span>100% Encrypted & Authenticated Order</span>
              </div>
            </div>
          </div>
        )}
      </>
    )}
  </div>



      {completedOrder && (
        <PostOrderReviewModal
          order={completedOrder}
          onClose={() => {
            setCompletedOrder(null);
            navigate('/orders');
          }}
          onSubmitSuccess={() => {
            setCompletedOrder(null);
            navigate('/orders');
          }}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, Check, Clock, Truck, Home, Star, Printer, FileText } from 'lucide-react';
import Navbar from './Navbar';
import Toast from './Toast';
import PostOrderReviewModal from './PostOrderReviewModal';
import PrintableInvoice from './PrintableInvoice';
import { api } from '../services/api';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [editingAddressOrderId, setEditingAddressOrderId] = useState(null);
  const [newAddressText, setNewAddressText] = useState('');
  const [reviewingOrder, setReviewingOrder] = useState(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [notification, setNotification] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate('/login');
      return;
    }
    setUser(api.getUser());
    loadOrders();
  }, [navigate]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await api.getMyOrders();
      if (res.ok && Array.isArray(res.data)) {
        setOrders(res.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Error loading orders:", err);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateAddress = async (orderId) => {
    if (!newAddressText.trim()) return;
    const res = await api.updateOrderAddress(orderId, newAddressText);
    if (res.ok) {
      showNotification('Delivery address updated successfully!');
      setEditingAddressOrderId(null);
      setNewAddressText('');
      loadOrders();
    } else {
      showNotification(res.data.message || 'Could not update address.', 'error');
    }
  };

  const handleLogout = async () => {
    await api.logout();
    navigate('/login');
  };

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
  };

  // 4-Stage Stepper mapping
  const stages = [
    { key: 'Order Placed', label: 'Order Placed', icon: Clock },
    { key: 'In Transit', label: 'In Transit', icon: Package },
    { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'Delivered', label: 'Delivered', icon: Home }
  ];

  const getStageIndex = (statusStr) => {
    if (!statusStr) return 0;
    const lower = statusStr.toLowerCase();
    if (lower.includes('delivered')) return 3;
    if (lower.includes('out for delivery')) return 2;
    if (lower.includes('transit') || lower.includes('shipped')) return 1;
    return 0; // Default Order Placed / Pending / Confirmed
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  if (!user) return null;

  return (
    <div className="page-wrapper page-fade-in">
      <Navbar />

      {/* Toast Notification */}
      <Toast notification={notification} onClose={() => setNotification(null)} />

      <div className="cart-page-container" style={{ maxWidth: '1100px', margin: '2rem auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 className="page-title" style={{ marginBottom: '0.2rem' }}>My Account & Order History</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Logged in as <strong>{user.username}</strong> ({user.email})</p>
          </div>
          <button onClick={handleLogout} className="btn-hero-secondary" style={{ width: 'auto', padding: '0.5rem 1.2rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* My Orders Section with 4-Stage Stepper */}
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem', border: '1px solid var(--border-color)', background: '#FFFFFF' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-accent)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Package size={22} /> My Orders ({orders.length})
          </h2>

          {loadingOrders ? (
            <div className="loading-spinner-wrapper"><div className="spinner"></div></div>
          ) : orders.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>You haven't placed any saree orders yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '2rem' }}>
              {orders.map(ord => {
                const currentIdx = getStageIndex(ord.status);
                const canEditAddress = currentIdx === 0;
                const isDelivered = (ord.status || '').toUpperCase() === 'DELIVERED' || currentIdx === 3;

                // Build timestamp map for history records
                const historyMap = {};
                if (Array.isArray(ord.statusHistory)) {
                  ord.statusHistory.forEach(h => {
                    const idx = getStageIndex(h.status);
                    if (!historyMap[idx]) historyMap[idx] = h.changedAt;
                  });
                }
                // Fallback for stage 0 if missing
                if (!historyMap[0] && ord.createdAt) historyMap[0] = ord.createdAt;

                const progressPct = (currentIdx / 3) * 100;

                const isOutOfDeliveryOrDelivered = currentIdx >= 2;

                return (
                  <div key={ord.orderId} style={{ background: '#FFFDF9', padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-color)', boxShadow: '0 4px 16px rgba(45,36,20,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
                      <div>
                        <strong style={{ color: 'var(--color-accent)', fontSize: '1.1rem', fontWeight: 700 }}>Order #{ord.orderId}</strong>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '1rem', fontWeight: 600 }}>Total: ₹{Number(ord.totalAmount).toLocaleString('en-IN')}</span>
                      </div>
                      <span className="status-badge shipped" style={{ fontSize: '0.82rem', padding: '0.3rem 0.8rem' }}>Status: {ord.status || 'Order Placed'}</span>
                    </div>

                    {/* 4-Stage Visual Stepper Container with Progress Bar */}
                    <div style={{ margin: '2.5rem 0 2rem', position: 'relative' }}>
                      {/* Background Line */}
                      <div style={{ position: 'absolute', top: '20px', left: '10%', right: '10%', height: '3px', background: 'var(--border-color)', zIndex: 1 }} />
                      
                      {/* Filled Progress Line */}
                      <div style={{ position: 'absolute', top: '20px', left: '10%', width: `${progressPct * 0.8}%`, height: '3px', background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-hover))', zIndex: 1, transition: 'width 0.5s ease' }} />

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
                        {stages.map((st, i) => {
                          const isCompleted = i <= currentIdx;
                          const isCurrent = i === currentIdx;
                          const Icon = st.icon;
                          const timestamp = historyMap[i];

                          return (
                            <div key={st.key} style={{ flex: 1, textAlign: 'center' }}>
                              <div style={{
                                width: '42px', height: '42px', borderRadius: '50%', margin: '0 auto 0.6rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: isCompleted ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))' : '#FFFFFF',
                                border: isCompleted ? 'none' : '2px solid var(--border-color)',
                                color: isCompleted ? '#FFFFFF' : 'var(--text-secondary)',
                                boxShadow: isCurrent ? '0 0 16px rgba(200, 155, 60, 0.55)' : isCompleted ? '0 2px 8px rgba(200, 155, 60, 0.25)' : 'none',
                                transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                                transition: 'all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)'
                              }}>
                                {isCompleted ? <Check size={20} /> : <Icon size={18} />}
                              </div>

                              <div style={{ fontSize: '0.8rem', color: isCompleted ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isCompleted ? '700' : '500' }}>
                                {st.label}
                              </div>

                              {timestamp && (
                                <div style={{ fontSize: '0.72rem', color: 'var(--color-primary-hover)', fontWeight: '600', marginTop: '0.2rem' }}>
                                  {formatTimestamp(timestamp)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Ordered Items List */}
                    {ord.items && ord.items.length > 0 && (
                      <div style={{ marginTop: '1rem', background: '#FFFFFF', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--color-accent)', display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>Items Ordered:</strong>
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                          {ord.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                              <span>{item.product?.name || `Product #${item.product?.id || ''}`} × {item.quantity}</span>
                              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>₹{Number(item.totalPrice || (item.pricePerUnit * item.quantity)).toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Delivery Address & Snapshot */}
                    <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '8px', marginTop: '1rem', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--color-accent)', fontWeight: 700 }}>Delivery Address:</strong>
                        {canEditAddress && editingAddressOrderId !== ord.orderId && (
                          <button 
                            className="btn-remove-link" 
                            style={{ fontSize: '0.75rem', color: 'var(--color-primary-hover)', background: 'rgba(200,155,60,0.12)', borderColor: 'var(--color-primary)', borderRadius: '6px', padding: '0.3rem 0.6rem', fontWeight: '600' }}
                            onClick={() => { setEditingAddressOrderId(ord.orderId); setNewAddressText(ord.addressSnapshot || ''); }}
                          >
                            Edit Address
                          </button>
                        )}
                        {!canEditAddress && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            Address locked (Order in transit)
                          </span>
                        )}
                      </div>

                      {editingAddressOrderId === ord.orderId ? (
                        <div style={{ marginTop: '0.5rem' }}>
                          <textarea 
                            value={newAddressText} 
                            onChange={(e) => setNewAddressText(e.target.value)} 
                            className="filter-input" 
                            rows="3" 
                            style={{ fontSize: '0.85rem', marginBottom: '0.5rem', background: 'var(--bg-primary)' }} 
                          />
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn-gold" style={{ width: 'auto', padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => handleUpdateAddress(ord.orderId)}>Save Address</button>
                            <button className="btn-hero-secondary" style={{ width: 'auto', padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => setEditingAddressOrderId(null)}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'pre-line', marginTop: '0.4rem' }}>
                          {ord.addressSnapshot || 'Standard Registered User Address'}
                        </p>
                      )}
                    </div>

                    {/* Order Actions: Print Receipt & Rate & Review */}
                    <div style={{ marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '0.8rem', alignItems: 'center' }}>
                      {/* Print Receipt / Invoice (Enabled after Out For Delivery) */}
                      {isOutOfDeliveryOrDelivered ? (
                        <button
                          className="btn-hero-secondary"
                          style={{ width: 'auto', padding: '0.55rem 1.2rem', fontSize: '0.85rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px', border: '1px solid var(--color-primary)', color: 'var(--color-accent)' }}
                          onClick={() => setSelectedInvoiceOrder(ord)}
                        >
                          <Printer size={16} /> Print Receipt / Invoice
                        </button>
                      ) : (
                        <div style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#F8F5EE', padding: '0.5rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                          <FileText size={14} /> Invoice available after out for delivery
                        </div>
                      )}

                      {/* Delivery-Gated Review Action */}
                      {isDelivered ? (
                        <button
                          className="btn-gold"
                          style={{ width: 'auto', padding: '0.55rem 1.3rem', fontSize: '0.85rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px' }}
                          onClick={() => setReviewingOrder(ord)}
                        >
                          <Star size={15} fill="#D4AF37" color="#D4AF37" /> Rate & Review Delivered Items
                        </button>
                      ) : (
                        <div style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#F8F5EE', padding: '0.5rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                          <Clock size={14} /> Review enabled after delivery
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {reviewingOrder && (
        <PostOrderReviewModal
          order={reviewingOrder}
          onClose={() => setReviewingOrder(null)}
          onSubmitSuccess={() => {
            setReviewingOrder(null);
            setNotification({ msg: 'Review submitted successfully!', type: 'success' });
          }}
          onSubmitted={() => {
            setReviewingOrder(null);
            setNotification({ msg: 'Review submitted successfully!', type: 'success' });
          }}
        />
      )}

      {selectedInvoiceOrder && (
        <PrintableInvoice
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
}

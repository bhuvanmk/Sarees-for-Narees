import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import './AuraChatWidget.css';

const QUICK_PROMPTS = [
  "✨ Banarasi sarees under ₹5000",
  "📦 Where is my order status?",
  "🌿 Silk vs Cotton care instructions",
  "👑 Show me grand wedding sarees"
];

export default function AuraChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      role: 'assistant',
      content: "Namaste! I am **Aura**, your AI shopping assistant for *Sarees For Naris*. How can I help you discover handloom sarees or check your order today?",
      suggestedProducts: []
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
    }
  }, [messages, isOpen]);

  const getPageContext = () => {
    const path = location.pathname;
    if (path.startsWith('/product/')) {
      const parts = path.split('/');
      return `User is viewing Product Page ID #${parts[parts.length - 1]}`;
    } else if (path === '/products') {
      return 'User is browsing Saree Catalog';
    } else if (path === '/cart') {
      return 'User is inspecting Shopping Cart';
    } else if (path === '/checkout') {
      return 'User is on Checkout Page';
    } else if (path === '/profile' || path === '/my-orders') {
      return 'User is viewing My Orders / Profile';
    }
    return `User is on page: ${path}`;
  };

  const handleSendMessage = async (textToSend = null) => {
    const msgText = (textToSend || inputMsg).trim();
    if (!msgText || loading) return;

    const userMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: msgText
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    if (!textToSend) {
      setInputMsg('');
      const inputEl = document.querySelector('.aura-chat-input');
      if (inputEl) inputEl.style.height = 'auto';
    }
    setLoading(true);

    // Format history for backend API
    const historyPayload = updatedMessages
      .slice(-6)
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await api.auraChat(msgText, historyPayload, getPageContext());
      
      if (res.ok && res.data) {
        const assistantMessage = {
          id: 'aura-' + Date.now(),
          role: 'assistant',
          content: res.data.reply || "I am here to assist you with sarees and orders!",
          suggestedProducts: res.data.suggestedProducts || [],
          requiresLogin: res.data.requiresLogin || false,
          showOrdersButton: res.data.showOrdersButton || false
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: 'err-' + Date.now(),
            role: 'assistant',
            content: "I am having trouble connecting right now. Please try again or browse our saree collections!",
            suggestedProducts: []
          }
        ]);
      }
    } catch (err) {
      console.error('Aura Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content: "I ran into an unexpected connection issue. Please try again in a few seconds!",
          suggestedProducts: []
        }
      ]);
    } finally {
      setLoading(false);
      if (!isOpen) setHasUnread(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    if (window.innerWidth < 640) {
      setIsOpen(false);
    }
  };

  return (
    <div className="aura-widget-container">
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`aura-fab-button ${isOpen ? 'active' : ''}`}
        aria-label="Open Aura AI Shopping Assistant"
      >
        <div className="aura-fab-glow"></div>
        <div className="aura-fab-icon">
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <span className="aura-sparkle-symbol">✨</span>
          )}
        </div>
        {!isOpen && <span className="aura-fab-label">Ask Aura</span>}
        {hasUnread && !isOpen && <span className="aura-unread-dot"></span>}
      </button>

      {/* Chat Drawer Window */}
      {isOpen && (
        <div className="aura-chat-modal">
          {/* Header */}
          <div className="aura-chat-header">
            <div className="aura-header-info">
              <div className="aura-avatar">✨</div>
              <div>
                <h3 className="aura-header-title">Aura <span className="aura-badge">AI Assistant</span></h3>
                <p className="aura-header-subtitle">Sarees For Naris Shopping Guide</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="aura-close-btn"
              aria-label="Close Chat"
            >
              &times;
            </button>
          </div>

          {/* Messages Body */}
          <div className="aura-messages-body">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`aura-message-row ${msg.role === 'user' ? 'aura-user-row' : 'aura-assistant-row'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="aura-msg-avatar">✨</div>
                )}
                <div className="aura-msg-content-wrapper">
                  <div className={`aura-msg-bubble ${msg.role === 'user' ? 'aura-user-bubble' : 'aura-assistant-bubble'}`}>
                    <p className="aura-msg-text">{msg.content}</p>
                    
                    {/* Prompt for login if order tracking requires auth */}
                    {msg.requiresLogin && (
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/login');
                        }}
                        className="aura-login-btn"
                      >
                        🔒 Log In to View Orders
                      </button>
                    )}

                    {/* Direct action button to open My Orders page */}
                    {msg.showOrdersButton && (
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/orders');
                        }}
                        className="aura-orders-link-btn"
                      >
                        📦 Go to My Orders Page
                      </button>
                    )}

                  </div>

                  {/* Suggested Products Cards */}
                  {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                    <div className="aura-products-carousel">
                      <p className="aura-suggested-label">Recommended Sarees:</p>
                      <div className="aura-products-list">
                        {msg.suggestedProducts.map((p) => (
                          <div
                            key={p.productId}
                            onClick={() => handleProductClick(p.productId)}
                            className="aura-product-card"
                          >
                            <img
                              src={p.imageUrl || '/placeholder.jpg'}
                              alt={p.name}
                              className="aura-product-img"
                              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300'; }}
                            />
                            <div className="aura-product-details">
                              <h4 className="aura-product-name">{p.name}</h4>
                              <p className="aura-product-category">{p.category || 'Saree'}</p>
                              <div className="aura-product-footer">
                                <span className="aura-product-price">₹{p.price}</span>
                                <span className={`aura-stock-badge ${p.inStock ? 'in-stock' : 'out-stock'}`}>
                                  {p.inStock ? 'In Stock' : 'Sold Out'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking / Loading indicator */}
            {loading && (
              <div className="aura-message-row aura-assistant-row">
                <div className="aura-msg-avatar">✨</div>
                <div className="aura-msg-bubble aura-assistant-bubble aura-thinking">
                  <div className="aura-dots">
                    <span></span><span></span><span></span>
                  </div>
                  <span className="aura-thinking-text">Aura is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="aura-quick-prompts">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
                className="aura-chip"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="aura-chat-footer">
            <textarea
              value={inputMsg}
              onChange={(e) => {
                setInputMsg(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask Aura about sarees, fabrics, order status..."
              rows={1}
              className="aura-chat-input"
              disabled={loading}
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputMsg.trim()}
              className="aura-send-btn"
              aria-label="Send Message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

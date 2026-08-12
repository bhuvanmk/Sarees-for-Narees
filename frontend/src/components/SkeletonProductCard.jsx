import React from 'react';

export default function SkeletonProductCard() {
  return (
    <div className="product-card skeleton-card" style={{ cursor: 'wait' }}>
      <div 
        className="product-img-wrapper shimmer" 
        style={{ height: '300px', background: '#EAE5DD', borderRadius: '16px 16px 0 0' }} 
      />

      <div className="product-body" style={{ padding: '1.2rem' }}>
        <div 
          className="shimmer" 
          style={{ height: '20px', width: '80%', background: '#EAE5DD', borderRadius: '4px', marginBottom: '0.8rem' }} 
        />
        
        <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.8rem' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="shimmer" style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#EAE5DD' }} />
          ))}
        </div>

        <div 
          className="shimmer" 
          style={{ height: '14px', width: '100%', background: '#EAE5DD', borderRadius: '4px', marginBottom: '0.4rem' }} 
        />
        <div 
          className="shimmer" 
          style={{ height: '14px', width: '60%', background: '#EAE5DD', borderRadius: '4px', marginBottom: '1.2rem' }} 
        />

        <div className="product-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="shimmer" style={{ height: '24px', width: '70px', background: '#EAE5DD', borderRadius: '6px' }} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div className="shimmer" style={{ height: '36px', width: '65px', background: '#EAE5DD', borderRadius: '8px' }} />
            <div className="shimmer" style={{ height: '36px', width: '80px', background: '#EAE5DD', borderRadius: '8px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

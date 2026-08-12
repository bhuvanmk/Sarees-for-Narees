# Sarees For Naaris - Frontend Engineering Interview Q&A (50 Questions)

A comprehensive guide containing 50 technical interview questions & detailed answers based on the **React 18, Vite, React Router 6, Vanilla CSS3 Design System, Context/State Management, and REST Integration** implementation of **Sarees For Naaris**.

---

## Table of Contents
1. [React 18 Core Architecture & JSX (Q1 – Q10)](#1-react-18-core-architecture--jsx)
2. [React Hooks & Custom Hooks (Q11 – Q20)](#2-react-hooks--custom-hooks)
3. [React Router v6 & Navigation (Q21 – Q27)](#3-react-router-v6--navigation)
4. [State Management & Data Fetching (Q28 – Q35)](#4-state-management--data-fetching)
5. [CSS3 Design System & UI/UX Best Practices (Q36 – Q43)](#5-css3-design-system--uiux-best-practices)
6. [Performance Optimization & Web Security (Q44 – Q50)](#6-performance-optimization--web-security)

---

## 1. React 18 Core Architecture & JSX

### Q1: What core technologies power the Sarees For Naaris frontend web application?
**Answer:**
- **React 18**: Modern functional component architecture with Concurrent Rendering.
- **Vite 8**: Next-generation frontend build tool providing Lightning HMR (Hot Module Replacement) and ESbuild module bundling.
- **React Router 6**: Client-side routing and navigation.
- **Lucide React**: Modern SVG icon component library.
- **Vanilla CSS3**: Tailored luxury Ivory & Gold design system without external framework overhead (Tailwind/Bootstrap).

---

### Q2: What is the Virtual DOM and how does React 18 Reconciliation work?
**Answer:**
The Virtual DOM (VDOM) is a lightweight in-memory JavaScript object representation of the real DOM elements.
When component state changes (e.g., toggling a wishlist heart icon):
1. React creates a new Virtual DOM tree.
2. The **Diffing Algorithm** compares the new VDOM with the previous VDOM tree.
3. React calculates the minimal set of real DOM operations required (Reconciliation).
4. In React 18, Fiber reconciler updates the real browser DOM in batch renders for peak performance.

---

### Q3: What is JSX and how does Vite transpile it?
**Answer:**
JSX (JavaScript XML) is a syntax extension for JavaScript that allows writing HTML-like structures directly inside JavaScript files.
Vite uses **Esbuild** (and Babel/SWC plugins) during development to transpile JSX:
```jsx
// JSX Code:
<h1 className="detail-title">{product.name}</h1>

// Transpiled JS Code:
React.createElement('h1', { className: 'detail-title' }, product.name);
```

---

### Q4: Why are functional components preferred over class components in modern React applications?
**Answer:**
- **Simplicity**: Cleaner, concise code without `this` binding issues.
- **React Hooks**: Enables stateful logic reuse, side effect handling (`useEffect`), and memoization (`useCallback`) without class inheritance overhead.
- **Performance & Tree Shaking**: Better optimization by modern bundlers like Vite/Rollup.

---

### Q5: What is component composition and how is it used in `ProductCard`?
**Answer:**
Component composition is a pattern where smaller, reusable UI components are combined to build complex views.
In Sarees For Naaris, `ProductCard` accepts props (`product`, `isWishlisted`, `onWishlistToggle`, `onAddToCart`, `onBuyNow`) and encapsulates image display, star rating calculation, price formatting, and interactive action buttons:
```jsx
<ProductCard 
  product={product} 
  isWishlisted={wishlistIds.has(product.productId)}
  onWishlistToggle={handleToggleWishlist}
/>
```

---

### Q6: What are `props` vs `state` in React?
**Answer:**
- **Props (Properties)**: Immutable read-only inputs passed down from parent to child components (e.g., `cartCount` passed to `<Navbar />`).
- **State**: Mutable component-local data that triggers re-renders when updated via setter functions (e.g., `const [cartCount, setCartCount] = useState(0)`).

---

### Q7: Why is the `key` prop essential when rendering lists like product grids?
**Answer:**
When mapping over arrays in JSX:
```jsx
{products.map((product) => (
  <ProductCard key={product.productId} product={product} />
))}
```
The `key` prop gives React a unique identity per element. It allows React's diffing engine to track added, updated, or re-ordered items without re-rendering unchanged elements in the DOM.

---

### Q8: What is Fragment (`<React.Fragment>` or `<>...</>`) and why is it used?
**Answer:**
React components must return a single root element. A Fragment lets you group multiple elements without adding unnecessary wrapper DOM nodes (like extra `<div>` elements) that could alter CSS flex/grid layout inheritance:
```jsx
{product.category && (
  <>
    <span onClick={() => navigate(`/products?cat=${product.category.categoryName}`)}>
      {product.category.categoryName}
    </span>
    {' > '}
  </>
)}
```

---

### Q9: How does synthetic event handling work in React (e.g., `e.stopPropagation()`)?
**Answer:**
React wraps native browser events in a cross-browser `SyntheticEvent` wrapper.
In `ProductCard.jsx`, when a user clicks the floating Wishlist Heart button inside a clickable product card:
```jsx
const handleWishlistClick = (e) => {
  e.stopPropagation(); // Prevents card parent onClick (navigate to detail page) from firing
  onWishlistToggle(product);
};
```

---

### Q10: How is entry point mounting configured in `main.jsx`?
**Answer:**
Using React 18's `createRoot` API:
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```
`<React.StrictMode>` performs extra checks and warnings in development mode.

---

## 2. React Hooks & Custom Hooks

### Q11: What is the `useState` hook and how does asynchronous state updating work?
**Answer:**
`useState` declares a state variable in functional components:
```jsx
const [wishlistIds, setWishlistIds] = useState(new Set());
```
State updates in React are asynchronous and batched. Passing a updater function guarantees access to the latest state value:
```jsx
setWishlistIds(prev => new Set(prev).add(productId));
```

---

### Q12: How does `useEffect` manage component lifecycles in `ProductDetailPage.jsx`?
**Answer:**
`useEffect` handles side effects (data fetching, DOM scrolling, event listeners).
```jsx
useEffect(() => {
  window.scrollTo(0, 0);
  loadProductDetails();
  loadWishlistAndCart();
  fetchReviews();
}, [id, loadProductDetails, loadWishlistAndCart]);
```
- **Empty dependency array `[]`**: Runs once on mount (similar to `componentDidMount`).
- **Dependencies array `[id]`**: Re-runs whenever `id` URL parameter changes.
- **Return Cleanup Function**: Returned function executes on unmount or before dependency re-evaluation.

---

### Q13: What is the purpose of `useCallback` and how does it prevent unnecessary re-renders?
**Answer:**
`useCallback` returns a memoized version of a callback function that only changes if one of its dependencies changes:
```jsx
const loadProductDetails = useCallback(async () => {
  setLoading(true);
  const res = await api.getProductById(id);
  if (res.ok) setProduct(res.data);
  setLoading(false);
}, [id]);
```
This prevents `loadProductDetails` from being re-created on every component render, keeping `useEffect` dependency arrays stable.

---

### Q14: How does the custom hook `useScrollReveal.js` utilize `useRef` and `IntersectionObserver`?
**Answer:**
`useScrollReveal` attaches a container ref and registers `IntersectionObserver` elements:
```jsx
export function useScrollReveal({ threshold = 0.15 } = {}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold });

    // Observe children with reveal classes
    const elements = container.querySelectorAll('.reveal-fade-up, .reveal-stagger-item');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [threshold]);

  return containerRef;
}
```

---

### Q15: What is `useRef` and how does it differ from `useState`?
**Answer:**
- `useRef` returns a mutable ref object (`ref.current`) that persists across component renders **without triggering a re-render** when mutated.
- Used in `ProductDetailPage` to reference the horizontal review scroll container (`carouselRef`) for DOM manipulation:
```jsx
const carouselRef = useRef(null);
carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
```

---

### Q16: Explain Rules of Hooks in React.
**Answer:**
1. **Call Hooks only at the top level**: Do not call hooks inside loops, conditions, or nested functions.
2. **Call Hooks only from React functional components** or custom Hooks.
This guarantees that React calls hooks in the exact same order on every render pass.

---

### Q17: How is image zoom functionality implemented using mouse event coordinates in `ProductDetailPage.jsx`?
**Answer:**
```jsx
const handleMouseMove = (e) => {
  const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - left) / width) * 100;
  const y = ((e.clientY - top) / height) * 100;
  setZoomPos({ x, y });
};
```
The resulting `zoomPos` coordinates dynamically update the `backgroundPosition` CSS property of a zoom lens overlay.

---

### Q18: What is the `useMemo` hook and when should it be used?
**Answer:**
`useMemo` caches the calculated result of an expensive computation across renders:
```jsx
const filteredTrendProducts = useMemo(() => {
  return products.filter(p => p.category?.name.toLowerCase().includes(activeTab.toLowerCase()));
}, [products, activeTab]);
```
It avoids re-running filter calculations on every render unless `products` or `activeTab` changes.

---

### Q19: How are custom hooks structured for reusability across pages?
**Answer:**
Custom hooks are pure JavaScript functions prefixed with `use` that can call other React hooks. They encapsulate standalone UI or business logic (e.g., `useScrollReveal`, `useAuth`, `useWindowSize`), returning reactive values or refs.

---

### Q20: How are memory leaks prevented when using timer `setTimeout` in components?
**Answer:**
In `Toast.jsx` or notification handlers, timers are cleaned up during effect teardown or before re-triggering:
```jsx
useEffect(() => {
  if (notification) {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer); // Prevents executing setNotification on unmounted component
  }
}, [notification, onClose]);
```

---

## 3. React Router v6 & Navigation

### Q21: How is client-side routing configured using `BrowserRouter` and `Routes` in `App.jsx`?
**Answer:**
```jsx
<Router>
  <Routes>
    <Route path="/" element={<CustomerHome />} />
    <Route path="/products" element={<ProductsPage />} />
    <Route path="/product/:id" element={<ProductDetailPage />} />
    <Route path="/admin" element={<AdminLogin />} />
    <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
  </Routes>
</Router>
```
`BrowserRouter` uses standard HTML5 `history.pushState` API to keep UI synchronized with the URL without page reloads.

---

### Q22: How do dynamic route parameters work with `useParams`?
**Answer:**
In route definition: `<Route path="/product/:id" element={<ProductDetailPage />} />`
In `ProductDetailPage.jsx`:
```jsx
const { id } = useParams(); // Retrieves value of :id parameter from URL /product/4
```

---

### Q23: How is programmatic navigation executed with `useNavigate`?
**Answer:**
```jsx
const navigate = useNavigate();

// Examples:
navigate('/checkout'); // Push new URL onto stack
navigate(-1); // Go back in browser history
navigate('/products?search=traditional', { replace: true });
```

---

### Q24: How are URL Query Search Parameters parsed using `useSearchParams` in `ProductsPage.jsx`?
**Answer:**
`useSearchParams` reads and updates current URL query strings:
```jsx
const [searchParams, setSearchParams] = useSearchParams();

const searchQuery = searchParams.get('search') || '';
const categoryFilter = searchParams.get('category') || '';

// Update params dynamically:
setSearchParams({ search: 'banarasi', min_price: '5000' });
```

---

### Q25: What is a Protected Route component (`ProtectedRoute.jsx`)?
**Answer:**
`ProtectedRoute` acts as a wrapper around routes that require user authentication:
```jsx
export default function ProtectedRoute({ children }) {
  if (!api.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
```
If an unauthenticated user navigates to `/cart` or `/checkout`, they are automatically redirected to `/login`.

---

### Q26: How does Role-Based Route Guard (`RoleRoute.jsx`) restrict seller/admin routes?
**Answer:**
```jsx
export default function RoleRoute({ children, allowedRoles }) {
  const user = api.getUser();
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
```

---

### Q27: How is scroll position reset upon route change?
**Answer:**
By invoking `window.scrollTo(0, 0)` inside `useEffect` with URL parameters as dependencies (`[id]`), ensuring that whenever the user navigates between product pages, the browser scrolls to the top immediately.

---

## 4. State Management & Data Fetching

### Q28: How does the application execute REST API communications via `api.js` service?
**Answer:**
`api.js` encapsulates standard HTTP operations via the browser `fetch` API:
- Appends `Content-Type: application/json`.
- Dynamically injects `Authorization: Bearer <accessToken>` header from `localStorage`.
- Includes interceptor logic to catch `401 Unauthorized` responses and attempt automatic token refresh at `/api/auth/refresh`.

---

### Q29: How is guest action persistence implemented across login redirects?
**Answer:**
When a guest clicks **Add to Cart** or **Buy Now**:
```jsx
if (!api.isAuthenticated()) {
  sessionStorage.setItem('pendingGuestAction', JSON.stringify({
    type: 'ADD_TO_CART',
    productId: product.productId,
    quantity: 1
  }));
  navigate('/login');
  return;
}
```
Upon successful login inside `Login.jsx`, the pending guest action is parsed from `sessionStorage` and automatically executed before redirecting to the target page.

---

### Q30: How is Wishlist state synchronized across components?
**Answer:**
Wishlist IDs are loaded into a ES6 `Set` data structure:
```jsx
const [wishlistIds, setWishlistIds] = useState(new Set());
```
Using a `Set` provides $O(1)$ constant time lookup performance when evaluating `wishlistIds.has(product.productId)` inside product grids.

---

### Q31: How is Cart Badge Count updated globally in `<Navbar />`?
**Answer:**
The parent component (`CustomerHome` / `ProductDetailPage`) maintains `cartCount` state and passes it down as a prop to `<Navbar cartCount={cartCount} />`. When items are added, `setCartCount(prev => prev + qty)` updates the badge instantaneously.

---

### Q32: How are loading spinners and skeleton loaders handled during async requests?
**Answer:**
Components maintain a boolean `loading` state:
```jsx
if (loading) {
  return <NaarisBrandLoader />;
}
```
`NaarisBrandLoader.jsx` renders a luxury SVG animation while backend REST calls fulfill.

---

### Q33: How does Toast Notification state management work in `CustomerHome.jsx`?
**Answer:**
```jsx
const [notification, setNotification] = useState(null);

const showNotification = (msg, type = 'success') => {
  setNotification({ msg, type });
  setTimeout(() => setNotification(null), 3000);
};

// Render:
<Toast notification={notification} onClose={() => setNotification(null)} />
```

---

### Q34: What is the difference between `localStorage` and `sessionStorage` in web browsers?
**Answer:**
- **`localStorage`**: Persists data across browser sessions and tab closes (used for JWT Access/Refresh tokens and User metadata).
- **`sessionStorage`**: Cleared automatically when the browser tab/window is closed (used for transient data like `pendingGuestAction`).

---

### Q35: How is client-side form validation managed in `Register.jsx` and `Login.jsx`?
**Answer:**
Form fields are bound to local component state (Controlled Components). On submission, validation rules evaluate before firing API calls:
```jsx
if (!email.includes('@')) {
  setNotification({ msg: 'Please enter a valid email', type: 'error' });
  return;
}
```

---

## 5. CSS3 Design System & UI/UX Best Practices

### Q36: Describe the Luxury Ivory & Gold Design System theme used in Sarees For Naaris.
**Answer:**
Built with Vanilla CSS3 custom variables defined in `:root` (`index.css`):
- `--bg-primary`: `#FFFDF9` (Ivory Warm Background)
- `--text-primary`: `#120306` (Deep Charcoal Black)
- `--color-primary`: `#D4AF37` (Royal Gold)
- `--color-accent`: `#7B1E3A` (Rich Wine Burgundy)
- `--font-serif`: `'Cinzel', 'Playfair Display', serif`
- `--font-sans`: `'Plus Jakarta Sans', sans-serif`

---

### Q37: What is Glassmorphism and how is it implemented in modern UI components?
**Answer:**
Glassmorphism creates a frosted-glass overlay effect using CSS `backdrop-filter`:
```css
.glass-panel {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(212, 175, 55, 0.3);
  box-shadow: 0 8px 32px rgba(45, 36, 20, 0.08);
}
```

---

### Q38: How is Responsive Web Design achieved without UI frameworks?
**Answer:**
Using modern CSS Grid, Flexbox, and Media Queries:
```css
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 2rem;
}

@media (max-width: 768px) {
  .product-detail-container {
    grid-template-columns: 1fr;
  }
}
```

---

### Q39: How do keyframe CSS animations improve micro-interactions?
**Answer:**
Keyframe animations provide immediate visual feedback during user actions.
Example: Floating badges and wishlist heart pulse animation (`@keyframes heartPulse`):
```css
@keyframes heartPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.28); }
  100% { transform: scale(1); }
}
.wishlist-btn.active {
  animation: heartPulse 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

---

### Q40: What is `object-fit: cover` and `object-position` in image rendering?
**Answer:**
- `object-fit: cover`: Ensures product saree images fill container dimensions without altering aspect ratio or stretching.
- `object-position: 50% 15%`: Pinpoints image crop focus onto the pallu/model face area.

---

### Q41: How are custom CSS variables (`var(...)`) leveraged for theming?
**Answer:**
CSS variables allow defining global tokens at the root level that automatically propagate theme updates across all components:
```css
:root {
  --color-primary: #D4AF37;
}

.btn-gold {
  background: var(--color-primary);
}
```

---

### Q42: What is `prefers-reduced-motion` and why is it important for accessibility?
**Answer:**
It respects user operating system settings for motion sensitivity by disabling heavy auto-scroll or levitation keyframe animations:
```css
@media (prefers-reduced-motion: reduce) {
  .hero-showcase-container {
    animation: none;
  }
}
```

---

### Q43: How is typography hierarchy structured across pages?
**Answer:**
- `<h1>`: Page Hero Title (`font-family: var(--font-serif)`, `font-size: 2.8rem`).
- `<h2>`: Section Headings ("Shop By Category", "Featured Handloomed Sarees").
- `<h3>`: Component Titles (Product Name, Category Card Name).
- `p` / `span`: Body text and metadata (`font-family: var(--font-sans)`).

---

## 6. Performance Optimization & Web Security

### Q44: What is Lazy Loading (`loading="lazy"`) for images?
**Answer:**
`loading="lazy"` instructs the browser to defer fetching product images until they approach the viewport boundary during scrolling, significantly improving initial page load time and performance scores.

---

### Q45: How is code splitting and route lazy loading implemented in React?
**Answer:**
Using `React.lazy()` and `<Suspense>`:
```jsx
const ProductDetailPage = React.lazy(() => import('./components/ProductDetailPage'));

<Suspense fallback={<NaarisBrandLoader />}>
  <Routes>
    <Route path="/product/:id" element={<ProductDetailPage />} />
  </Routes>
</Suspense>
```
This splits JS bundles into smaller chunks loaded on-demand per route.

---

### Q46: How does Vite build optimization work during production builds?
**Answer:**
When running `npm run build` (`vite build`):
1. Rollup tree-shakes unused JavaScript exports.
2. Minifies JS and CSS assets.
3. Generates hashed asset filenames (`index-BK6a_SR9.js`) for aggressive browser HTTP caching.

---

### Q47: How does React prevent Cross-Site Scripting (XSS) attacks?
**Answer:**
React automatically escapes values embedded in JSX string interpolations `{product.name}` before rendering them to DOM nodes. It converts HTML characters (`<`, `>`, `&`, `"`) into safe string entities, preventing malicious script injection.

---

### Q48: What is the purpose of `rel="noreferrer"` on external links?
**Answer:**
When rendering external customer review photo links in `<a>` tags with `target="_blank"`:
```jsx
<a href={photoUrl} target="_blank" rel="noreferrer">
```
`rel="noreferrer"` prevents security vulnerabilities (Tabnabbing) by ensuring the newly opened tab cannot access `window.opener`.

---

### Q49: How can memory leaks be identified and eliminated in React applications?
**Answer:**
1. **Unsubscribing listeners**: Cleaning up window resize or scroll event listeners inside `useEffect` return blocks.
2. **Canceling Async tasks**: Aborting pending `fetch` requests with `AbortController` if the component unmounts before response returns.
3. **React DevTools Profiler**: Inspecting component render frequencies and memory allocations.

---

### Q50: How is the production build served locally and deployed?
**Answer:**
- **Local Validation**: Execute `npm run build` followed by `npm run preview` to test production assets locally on `http://localhost:4173`.
- **Deployment**: Static output directory `dist/` can be deployed directly to CDNs like Vercel, Netlify, Cloudflare Pages, or AWS S3 + CloudFront.

---
*End of Frontend Technical Interview Guide (50 Questions)*

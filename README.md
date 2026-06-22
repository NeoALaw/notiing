# Kinetic Edge — Three.js/WebGL Sports Accessories Site

An original Awwwards-style immersive sports accessories storefront concept inspired by cinematic WebGL sites like Lusion, but with a unique sports-commerce direction.

## Included

- Full-screen Three.js/WebGL scene
- Procedural 3D sports accessory objects
- Cursor parallax and magnetic hover effects
- Scroll-driven camera motion
- Animated loader
- Mobile-responsive layout
- Product hover color changes
- Premium dark editorial UI
- Menu overlay
- Landing sections for hero, drop, motion lab, accessories, and signup

## How to run

Because the site uses ES modules from a CDN, run it through a local server instead of opening the file directly.

### Option 1: VS Code
Use the Live Server extension and open `index.html`.

### Option 2: Python server
```bash
cd kinetic-edge-webgl-site
python -m http.server 8080
```
Open:
```text
http://localhost:8080
```

## Files

- `index.html` — page structure
- `styles.css` — full responsive UI styling
- `app.js` — Three.js/WebGL scene and interactions

## Next production upgrades

- Replace procedural 3D objects with optimized GLB product models
- Add ecommerce cart and product detail pages
- Integrate CMS / Shopify / WooCommerce backend
- Add compressed textures and preloading
- Add performance fallback for low-end devices

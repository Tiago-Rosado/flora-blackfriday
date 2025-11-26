# Node Animation

A smooth, animated node network visualization that starts from a single center node and expands across the screen.

## Features

- ✅ Animated expansion from center node
- ✅ Random but evenly spaced node distribution (no overlaps)
- ✅ Connectors between nearby nodes
- ✅ Black canvas with dot grid background
- ✅ Smooth easing animations
- ✅ Customizable node and connector assets

## Setup

1. **Add your node image asset:**
   - Open `animation.js`
   - Find the `assets` object in the constructor (around line 13)
   - Update `nodeImage` with your node image path:
     ```javascript
     this.assets = {
         nodeImage: 'path/to/your/node.png', // Your node image
         connectorImage: null, // Optional: connector image
     };
     ```

2. **Optional - Add connector image:**
   - If you have a custom connector image, set it in the `assets` object:
     ```javascript
     connectorImage: 'path/to/your/connector.png',
     ```
   - If left as `null`, simple lines will be used as connectors

3. **Open `index.html` in a browser**

## Customization

You can customize the animation by modifying the `config` object in `animation.js`:

```javascript
this.config = {
    nodeCount: 50,              // Number of nodes
    minDistance: 80,              // Minimum spacing between nodes
    maxConnectionDistance: 200,   // Max distance for connections
    nodeSize: 20,                 // Base node size (pixels)
    nodeSizeVariation: 0.3,       // Size variation (0-1)
    animationDuration: 3000,      // Animation time (ms)
    gridSpacing: 20,              // Grid dot spacing
    gridDotSize: 1.5,             // Grid dot size
    connectionLineWidth: 1,       // Connector line width
    connectionOpacity: 0.2,      // Connector opacity (0-1)
};
```

## Controls

- **Click anywhere** to restart the animation

## How It Works

1. **Node Generation**: Uses Poisson disc sampling to generate evenly spaced, non-overlapping node positions
2. **Animation**: Nodes start at the center and animate to their target positions with smooth easing
3. **Connections**: Nodes within `maxConnectionDistance` are automatically connected
4. **Staggered Appearance**: Nodes appear sequentially with a slight delay for a cascading effect

## Browser Support

Works in all modern browsers that support:
- HTML5 Canvas
- ES6 Classes
- Async/Await


class NodeAnimation {
    constructor() {
        this.canvas = document.getElementById('canvas');
        if (!this.canvas) {
            console.error('Canvas element not found');
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Could not get 2d context from canvas');
            return;
        }
        this.nodes = [];
        this.loadedImages = [];
        this.centerNodeIndex = null;
        this.connectorImage = null;
        this.connections = []; // Array of connections between adjacent nodes
        
        // Configuration - will be adjusted based on number of images
        this.baseNodeSize = 120; // Base size, will be adjusted if needed
        this.config = {
            nodeSize: 120, // Size of each node/image (will be adjusted if needed)
            minDistance: 200, // Minimum distance between node centers (calculated: (nodeSize/2 + overlapPadding) * 2)
            overlapPadding: 40, // Extra padding to ensure no visual overlap
            animationDuration: 1500, // Total animation duration: 2 seconds (faster)
            centerNodeDelay: 0, // Center node starts immediately
            otherNodesStartDelay: 0, // Other nodes start appearing after 50ms (split second)
            borderRadius: 12, // Border radius for rounded corners
            maxNodes: 1000, // Maximum number of nodes to place (allows for more density with image reuse)
            connectorMaxDistance: 150, // Maximum distance to connect adjacent nodes
            connectorSize: 30, // Size of connector image
            maxUsesPerImage: 2, // Each image must be used exactly 2 times
        };
        
        this.animationProgress = 0;
        this.isAnimating = false;
        this.startTime = null;
        this.imagesLoaded = false;
        this.isRecording = false;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.recordingLoops = 3; // Number of times to loop the animation in the recording
        this.recordingLoopCount = 0;
        
        this.loadAllImages().then(() => {
            this.imagesLoaded = true;
            if (this.loadedImages.length > 0) {
                this.loadConnectorImage().then(() => {
                    this.init();
                });
            } else {
                console.error('No images loaded successfully');
            }
        }).catch((error) => {
            console.error('Error loading images:', error);
        });
    }
    
    // Get all image files from the directory
    getAllImageFiles() {
        const imageFiles = [
            'FLORA-Untitled-0127b230.png',
            'FLORA-Untitled-047a540e.jpg',
            'FLORA-Untitled-05af8091.png',
            'FLORA-Untitled-066cffe1.jpeg',
            'FLORA-Untitled-0687d42e.jpg',
            'FLORA-Untitled-07a3d5c6.png',
            'FLORA-Untitled-086a39ef.png',
            'FLORA-Untitled-0abcb536.png',
            'FLORA-Untitled-0d7b30a3.png',
            'FLORA-Untitled-0e60c83f.png',
            'FLORA-Untitled-12dace8c.png',
            'FLORA-Untitled-137066f4.jpeg',
            'FLORA-Untitled-1498abbe.png',
            'FLORA-Untitled-15b61552.png',
            'FLORA-Untitled-2689c254.jpeg',
            'FLORA-Untitled-27272b92.jpeg',
            'FLORA-Untitled-2a6570fc.png',
            'FLORA-Untitled-2b0aad8b.png',
            'FLORA-Untitled-3047fbba.jpeg',
            'FLORA-Untitled-3251065e.png',
            'FLORA-Untitled-34609c9b.png',
            'FLORA-Untitled-35a70e8b.png',
            'FLORA-Untitled-3ff9c77b.png',
            'FLORA-Untitled-41a38e62.webp',
            'FLORA-Untitled-41f6efda.jpg',
            'FLORA-Untitled-426e40f9.png',
            'FLORA-Untitled-43f6e979.jpg',
            'FLORA-Untitled-4f831443.png',
            'FLORA-Untitled-509b8f96.png',
            'FLORA-Untitled-523e9771.png',
            'FLORA-Untitled-5279e6ab.png',
            'FLORA-Untitled-55445352.png',
            'FLORA-Untitled-5c776793.png',
            'FLORA-Untitled-5d42588b.jpg',
            'FLORA-Untitled-5ee80d48.png',
            'FLORA-Untitled-5f39921c.jpeg',
            'FLORA-Untitled-62d91029.png',
            'FLORA-Untitled-65c9fc7a.png',
            'FLORA-Untitled-6a3ae07f.jpg',
            'FLORA-Untitled-6d34d387.JPG',
            'FLORA-Untitled-6dacd072.png',
            'FLORA-Untitled-6df785d7.png',
            'FLORA-Untitled-6f817f0e.png',
            'FLORA-Untitled-724aba5d.png',
            'FLORA-Untitled-72b187f8.png',
            'FLORA-Untitled-7c63149a.png',
            'FLORA-Untitled-7cea5f6e.jpg',
            'FLORA-Untitled-7ed6fde3.png',
            'FLORA-Untitled-7f336856.png',
            'FLORA-Untitled-7f877f46.png',
            'FLORA-Untitled-81d3f551.jpg',
            'FLORA-Untitled-82c4d749.png',
            'FLORA-Untitled-835015eb.png',
            'FLORA-Untitled-8a61c358.png',
            'FLORA-Untitled-8aa17cba.png',
            'FLORA-Untitled-8cab1953.png',
            'FLORA-Untitled-8d26fb79.png',
            'FLORA-Untitled-8f843782.JPG',
            'FLORA-Untitled-912d6b70.png',
            'FLORA-Untitled-91730106.png',
            'FLORA-Untitled-958aa4df.png',
            'FLORA-Untitled-97838c00.jpeg',
            'FLORA-Untitled-98de929b.png',
            'FLORA-Untitled-99f0e7e7.jpg',
            'FLORA-Untitled-9b39b699.png',
            'FLORA-Untitled-9f880920.png',
            'FLORA-Untitled-a08dd859.png',
            'FLORA-Untitled-a09cd3e3.png',
            'FLORA-Untitled-a19f9d10.png',
            'FLORA-Untitled-a5216b56.jpeg',
            'FLORA-Untitled-a67b4535.png',
            'FLORA-Untitled-a8d5ead4.png',
            'FLORA-Untitled-ae9fc5d3.JPG',
            'FLORA-Untitled-af5b1705.JPG',
            'FLORA-Untitled-b0cc59eb.png',
            'FLORA-Untitled-b7a657d5.jpg',
            'FLORA-Untitled-bd2483f8.jpg',
            'FLORA-Untitled-be63e1ce.png',
            'FLORA-Untitled-c26b3f9a.jpg',
            'FLORA-Untitled-c899b607.jpg',
            'FLORA-Untitled-ccc2826d.jpeg',
            'FLORA-Untitled-cdb1273a.png',
            'FLORA-Untitled-cfa8bdd5.jpg',
            'FLORA-Untitled-d29209e7.jpeg',
            'FLORA-Untitled-d3783730.jpg',
            'FLORA-Untitled-d74c24b3.png',
            'FLORA-Untitled-d9bbf4ef.JPG',
            'FLORA-Untitled-d9ee56bb.png',
            'FLORA-Untitled-defc0bb4.png',
            'FLORA-Untitled-dfbba3ae.png',
            'FLORA-Untitled-e0117932.png',
            'FLORA-Untitled-e0ab32ed.png',
            'FLORA-Untitled-e0cf8c90.JPG',
            'FLORA-Untitled-e19fa0fa.jpg',
            'FLORA-Untitled-e3c8bf21.jpg',
            'FLORA-Untitled-e3e9b270.png',
            'FLORA-Untitled-e6c10df1.png',
            'FLORA-Untitled-e7bd5503.png',
            'FLORA-Untitled-e8d4a161.jpeg',
            'FLORA-Untitled-eb54bda2.png',
            'FLORA-Untitled-ed44d25f.png',
            'FLORA-Untitled-ed98d4cf.png',
            'FLORA-Untitled-f4737e96.png',
            'FLORA-Untitled-f8d20e48.png',
            'FLORA-Untitled-f911498b.jpeg',
            'FLORA-Untitled-faef98fa.jpg',
            'FLORA-Untitled-fed197b8.JPG',
            'FLORA-Untitled-ffe162dd.jpg',
        ];
        
        return imageFiles;
    }
    
    // Resize image to optimize performance
    resizeImage(img, maxSize) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
            if (width > maxSize) {
                height = (height / width) * maxSize;
                width = maxSize;
            }
        } else {
            if (height > maxSize) {
                width = (width / height) * maxSize;
                height = maxSize;
            }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        return canvas;
    }
    
    // Load all image files and optimize them
    async loadAllImages() {
        const imageFiles = this.getAllImageFiles();
        const maxImageSize = 200; // Max dimension for optimized images
        
        const loadImage = (src) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    // Resize image to reduce memory and improve performance
                    // const resized = this.resizeImage(img, maxImageSize);
                    resolve(resized);
                };
                img.onerror = () => {
                    console.warn(`Failed to load image: ${src}`);
                    resolve(null);
                };
                img.src = src;
            });
        };
        
        const loadPromises = imageFiles.map(file => loadImage(file));
        const images = await Promise.all(loadPromises);
        
        // Filter out failed loads
        this.loadedImages = images.filter(img => img !== null);
        console.log(`Loaded and optimized ${this.loadedImages.length} images`);
    }
    
    // Load connector image
    async loadConnectorImage() {
        return new Promise((resolve) => {
            const connectorPath = 'FLORA-Untitled-0e60c83f.png'; // Connector image
            
            const img = new Image();
            img.onload = () => {
                this.connectorImage = img;
                console.log('Connector image loaded');
                resolve();
            };
            img.onerror = () => {
                console.warn(`Failed to load connector image: ${connectorPath}. Connectors will not be displayed.`);
                this.connectorImage = null;
                resolve(); // Continue even if connector fails to load
            };
            img.src = connectorPath;
        });
    }
    
    init() {
        this.resize();
        window.addEventListener('resize', () => {
            this.resize();
            if (this.imagesLoaded) {
                this.generateNodePositions();
            }
        });
        if (this.imagesLoaded && this.loadedImages.length > 0) {
            this.generateNodePositions();
            this.animate();
        }
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        
        // Reset node size to base before recalculating
        if (this.loadedImages.length > 0) {
            this.config.nodeSize = this.baseNodeSize;
            this.config.minDistance = this.baseNodeSize + this.config.overlapPadding;
            this.config.connectorMaxDistance = this.config.minDistance * 1.1;
        }
    }
    
    // Calculate optimal node size based on number of images
    calculateOptimalNodeSize() {
        const numImages = this.loadedImages.length;
        // We need at least all images once, and can use up to 2x each = max 2 * numImages nodes
        const minNodesNeeded = numImages * this.config.maxUsesPerImage;
        
        // Reset to base size first
        this.config.nodeSize = this.baseNodeSize;
        // Calculate proper minDistance: (nodeSize/2 + overlapPadding) * 2
        const calculatedMinDist = (this.baseNodeSize / 2 + this.config.overlapPadding) * 2;
        this.config.minDistance = Math.max(this.config.minDistance, calculatedMinDist);
        
        // Estimate how many nodes can fit on screen
        // Rough estimate: canvas area / (minDistance^2 * some packing factor)
        const packingFactor = 0.7; // Accounts for Poisson disc sampling efficiency
        const availableArea = (this.canvas.width - 100) * (this.canvas.height - 100);
        const nodeArea = this.config.minDistance * this.config.minDistance;
        const estimatedCapacity = Math.floor((availableArea / nodeArea) * packingFactor);
        
        // If we can't fit minimum nodes even at current size, reduce node size
        if (estimatedCapacity < minNodesNeeded) {
            // Calculate scale factor needed
            const scaleFactor = Math.sqrt(estimatedCapacity / minNodesNeeded) * 0.9; // 0.9 for safety margin
            const newSize = Math.max(80, Math.floor(this.baseNodeSize * scaleFactor));
            const newMinDistance = newSize + this.config.overlapPadding;
            
            console.log(`Reducing node size from ${this.baseNodeSize} to ${newSize} to fit all images`);
            this.config.nodeSize = newSize;
            this.config.minDistance = newMinDistance;
            this.config.connectorMaxDistance = newMinDistance * 1.1; // Adjust connector distance too
        } else {
            // Use base connector distance if not resizing
            this.config.connectorMaxDistance = this.config.minDistance * 1.1;
        }
        
        // Set maxNodes to allow for denser packing (can exceed minNodesNeeded with image reuse)
        // Use the larger of: minNodesNeeded or estimatedCapacity (up to config.maxNodes)
        this.config.maxNodes = Math.min(this.config.maxNodes, Math.max(minNodesNeeded, estimatedCapacity));
    }
    
    // Generate random node positions using Poisson disc sampling
    generateNodePositions() {
        this.nodes = [];
        
        if (this.loadedImages.length === 0) return;
        
        // Calculate optimal node size
        this.calculateOptimalNodeSize();
        
        // Track image usage: Map<image, count>
        const imageUsageCount = new Map();
        this.loadedImages.forEach((img) => {
            imageUsageCount.set(img, 0);
        });
        
        // Track which images still need to be used at least once
        const imagesNeedingFirstUse = new Set(this.loadedImages);
        
        // Pick a random image for the center node
        this.centerNodeIndex = Math.floor(Math.random() * this.loadedImages.length);
        const centerImage = this.loadedImages[this.centerNodeIndex];
        imageUsageCount.set(centerImage, 1);
        imagesNeedingFirstUse.delete(centerImage);
        
        // Create center node (also starts at center, but stays there)
        const centerNode = {
            startX: this.centerX,
            startY: this.centerY,
            x: this.centerX,
            y: this.centerY,
            targetX: this.centerX,
            targetY: this.centerY,
            size: this.config.nodeSize,
            image: centerImage,
            isCenter: true,
            delay: this.config.centerNodeDelay
        };
        this.nodes.push(centerNode);
        
        // Generate random positions for other nodes using Poisson disc sampling
        // Allow images to be reused by cycling through all images
        const activeList = [0]; // Start with center node
        const gridSize = this.config.minDistance / Math.sqrt(2);
        const cols = Math.ceil(this.canvas.width / gridSize);
        const rows = Math.ceil(this.canvas.height / gridSize);
        const grid = Array(rows).fill(null).map(() => Array(cols).fill(null));
        
        // Helper to get grid coordinates
        const getGridPos = (x, y) => ({
            col: Math.floor(x / gridSize),
            row: Math.floor(y / gridSize)
        });
        
        // Helper to check if position is valid (ensures no overlap)
        const isValidPosition = (x, y) => {
            // Keep nodes away from edges with extra margin
            const margin = this.config.nodeSize / 2 + this.config.overlapPadding;
            if (x < margin || x >= this.canvas.width - margin || 
                y < margin || y >= this.canvas.height - margin) {
                return false;
            }
            
            // Check against ALL existing nodes to ensure no overlap
            // Use strict distance check to prevent any visual overlap
            for (let i = 0; i < this.nodes.length; i++) {
                const existingNode = this.nodes[i];
                const dx = x - existingNode.targetX;
                const dy = y - existingNode.targetY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Calculate required distance: ensure edges never get closer than overlapPadding
                // nodeSize is the max dimension, so we need nodeSize + overlapPadding*2 between centers
                const halfNodeSize = this.config.nodeSize / 2;
                const edgeToEdgePadding = this.config.overlapPadding;
                const calculatedMinDistance = (halfNodeSize + edgeToEdgePadding) * 2;
                
                // Use the larger of configured minDistance or calculated minimum to ensure no overlap
                const requiredDistance = Math.max(this.config.minDistance, calculatedMinDistance);
                
                if (distance < requiredDistance) {
                    return false;
                }
            }
            
            return true;
        };
        
        // Generate random position around a point
        const generateRandomPosition = (centerX, centerY) => {
            const angle = Math.random() * Math.PI * 2;
            // Use a larger radius to ensure proper spacing - use minDistance as minimum
            const minRadius = this.config.minDistance;
            const radius = minRadius + Math.random() * (this.config.minDistance * 0.5);
            return {
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
            };
        };
        
        // Helper to check if an image is used by nearby nodes (stricter check)
        const hasNearbyDuplicateImage = (x, y, imageToCheck) => {
            // Check a larger radius to ensure no same images are adjacent
            const checkRadius = this.config.minDistance * 1.5; // Check well beyond minDistance
            
            for (let i = 0; i < this.nodes.length; i++) {
                const existingNode = this.nodes[i];
                const dx = x - existingNode.targetX;
                const dy = y - existingNode.targetY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // If node is nearby and has the same image, return true
                if (distance < checkRadius && existingNode.image === imageToCheck) {
                    return true;
                }
            }
            return false;
        };
        
        // Helper to select an image that's not used by nearby nodes and respects usage limits
        // Goal: Use each image exactly 2 times, never place same image next to each other
        const selectImageForPosition = (x, y) => {
            // Priority 1: Images that haven't been used yet (must use all images at least once)
            // But only if they're not nearby duplicates
            if (imagesNeedingFirstUse.size > 0) {
                const unusedImagesWithNearbyCheck = Array.from(imagesNeedingFirstUse).filter(img => 
                    !hasNearbyDuplicateImage(x, y, img)
                );
                
                if (unusedImagesWithNearbyCheck.length > 0) {
                    return unusedImagesWithNearbyCheck[Math.floor(Math.random() * unusedImagesWithNearbyCheck.length)];
                }
            }
            
            // Priority 2: Images that have been used once (need to be used a second time)
            // But only if they're not nearby duplicates
            const onceUsedImages = [];
            for (let i = 0; i < this.loadedImages.length; i++) {
                const img = this.loadedImages[i];
                const usageCount = imageUsageCount.get(img) || 0;
                if (usageCount === 1 && usageCount < this.config.maxUsesPerImage) {
                    if (!hasNearbyDuplicateImage(x, y, img)) {
                        onceUsedImages.push(img);
                    }
                }
            }
            
            if (onceUsedImages.length > 0) {
                return onceUsedImages[Math.floor(Math.random() * onceUsedImages.length)];
            }
            
            // If we still have unused images but they're all nearby duplicates, 
            // we need to find a position that works, but for now skip this position
            // This will be handled by the placement loop continuing to try
            
            // Last resort: if all images are used once but we need to use them twice,
            // and none can be placed here due to nearby duplicates, we'll need to try a different position
            // Return null to indicate we can't place an image here
            return null;
        };
        
        // Generate positions for nodes (allowing image reuse)
        let nodeCount = 1; // Start with center node
        let attempts = 0;
        const maxAttempts = 200; // Increased attempts per position for denser packing
        
        // Continue placing nodes until all images are used exactly 2 times
        const targetNodes = this.loadedImages.length * this.config.maxUsesPerImage; // Exactly 2x per image
        
        while (activeList.length > 0 && nodeCount < targetNodes && attempts < 300000) {
            attempts++;
            
            // If we haven't used all images twice yet, prioritize continuing
            if (imagesNeedingFirstUse.size > 0 || Array.from(imageUsageCount.values()).some(count => count < 2)) {
                // If active list is empty but we still need to place more nodes, restart from existing nodes
                if (activeList.length === 0) {
                    activeList = Array.from({length: Math.min(this.nodes.length, 20)}, (_, i) => 
                        Math.floor(Math.random() * this.nodes.length)
                    );
                }
            }
            
            if (activeList.length === 0) break;
            
            const activeIndex = Math.floor(Math.random() * activeList.length);
            const activeNodeIndex = activeList[activeIndex];
            const activeNode = this.nodes[activeNodeIndex];
            
            let found = false;
            for (let i = 0; i < maxAttempts; i++) {
                const pos = generateRandomPosition(activeNode.targetX, activeNode.targetY);
                
                if (isValidPosition(pos.x, pos.y)) {
                    // Select an image that's not used by nearby nodes and respects usage limits
                    const selectedImage = selectImageForPosition(pos.x, pos.y);
                    
                    // If no image can be selected (all nearby duplicates), skip this position
                    if (!selectedImage) {
                        continue;
                    }
                    
                    // Update usage count
                    const currentCount = imageUsageCount.get(selectedImage) || 0;
                    imageUsageCount.set(selectedImage, currentCount + 1);
                    
                    // Remove from images needing first use if this is the first use
                    if (imagesNeedingFirstUse.has(selectedImage)) {
                        imagesNeedingFirstUse.delete(selectedImage);
                    }
                    
                    const newNode = {
                        startX: this.centerX, // Start at center
                        startY: this.centerY,
                        x: this.centerX, // Current position (starts at center)
                        y: this.centerY,
                        targetX: pos.x, // Target position
                        targetY: pos.y,
                        size: this.config.nodeSize,
                        image: selectedImage,
                        isCenter: false,
                        delay: this.config.otherNodesStartDelay + ((nodeCount - 1) * 15) // Stagger other nodes
                    };
                    
                    this.nodes.push(newNode);
                    const gridPos = getGridPos(pos.x, pos.y);
                    grid[gridPos.row][gridPos.col] = this.nodes.length - 1;
                    activeList.push(this.nodes.length - 1);
                    nodeCount++;
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                activeList.splice(activeIndex, 1);
            }
        }
        
        // Log image usage statistics
        const usageStats = {};
        imageUsageCount.forEach((count, img) => {
            usageStats[count] = (usageStats[count] || 0) + 1;
        });
        console.log(`Generated ${this.nodes.length} nodes using ${this.loadedImages.length} unique images`);
        console.log(`Image usage: ${usageStats[1] || 0} used once, ${usageStats[2] || 0} used twice`);
        
        // Check if all images were used exactly twice
        const allUsedTwice = Array.from(imageUsageCount.values()).every(count => count === 2);
        if (allUsedTwice) {
            console.log(`✓ All ${this.loadedImages.length} images have been used exactly 2 times`);
        } else {
            const notUsedTwice = Array.from(imageUsageCount.entries()).filter(([img, count]) => count !== 2);
            console.warn(`Warning: ${notUsedTwice.length} images were not used exactly 2 times:`);
            notUsedTwice.forEach(([img, count]) => {
                console.warn(`  - Used ${count} times`);
            });
        }
        
        // Generate connections between adjacent nodes
        this.generateConnections();
    }
    
    // Generate connections between adjacent nodes
    generateConnections() {
        this.connections = [];
        
        // Sort nodes by x position to find horizontal neighbors
        const sortedNodes = this.nodes.map((node, index) => ({ node, index }))
            .sort((a, b) => a.node.targetX - b.node.targetX);
        
        for (let i = 0; i < sortedNodes.length; i++) {
            const currentNode = sortedNodes[i];
            
            // Look for nodes to the right (within max distance)
            for (let j = i + 1; j < sortedNodes.length; j++) {
                const otherNode = sortedNodes[j];
                
                const dx = otherNode.node.targetX - currentNode.node.targetX;
                const dy = otherNode.node.targetY - currentNode.node.targetY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Connect if within max distance and primarily horizontal
                if (distance <= this.config.connectorMaxDistance && Math.abs(dx) > Math.abs(dy)) {
                    this.connections.push({
                        node1Index: currentNode.index,
                        node2Index: otherNode.index,
                        side: 'right' // Connector on right side of node1, left side of node2
                    });
                    
                    // Only connect to the nearest right neighbor to avoid too many connections
                    break;
                }
            }
            
            // Look for nodes to the left (within max distance)
            for (let j = i - 1; j >= 0; j--) {
                const otherNode = sortedNodes[j];
                
                const dx = currentNode.node.targetX - otherNode.node.targetX;
                const dy = currentNode.node.targetY - otherNode.node.targetY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Connect if within max distance and primarily horizontal
                if (distance <= this.config.connectorMaxDistance && Math.abs(dx) > Math.abs(dy)) {
                    // Check if connection doesn't already exist
                    const exists = this.connections.some(conn => 
                        (conn.node1Index === otherNode.index && conn.node2Index === currentNode.index) ||
                        (conn.node1Index === currentNode.index && conn.node2Index === otherNode.index)
                    );
                    
                    if (!exists) {
                        this.connections.push({
                            node1Index: otherNode.index,
                            node2Index: currentNode.index,
                            side: 'right' // Connector on right side of node1, left side of node2
                        });
                    }
                    
                    // Only connect to the nearest left neighbor
                    break;
                }
            }
        }
        
        console.log(`Generated ${this.connections.length} connections between nodes`);
    }
    
    // Draw connectors between adjacent nodes
    drawConnectors() {
        if (!this.connectorImage || this.connections.length === 0 || !this.startTime) return;
        
        const currentTime = Date.now() - this.startTime;
        
        this.connections.forEach((connection) => {
            const node1 = this.nodes[connection.node1Index];
            const node2 = this.nodes[connection.node2Index];
            
            if (!node1 || !node2) return;
            
            // Calculate current positions of both nodes
            const node1StartTime = node1.delay;
            const node1Elapsed = Math.max(0, currentTime - node1StartTime);
            let node1Duration;
            if (node1.isCenter) {
                node1Duration = this.config.animationDuration * 0.4;
            } else {
                const remainingTime = this.config.animationDuration - this.config.otherNodesStartDelay;
                node1Duration = remainingTime * 0.8;
            }
            const node1Progress = Math.min(1, node1Elapsed / node1Duration);
            const node1Eased = this.easeOutCubic(node1Progress);
            
            const node2StartTime = node2.delay;
            const node2Elapsed = Math.max(0, currentTime - node2StartTime);
            let node2Duration;
            if (node2.isCenter) {
                node2Duration = this.config.animationDuration * 0.4;
            } else {
                const remainingTime = this.config.animationDuration - this.config.otherNodesStartDelay;
                node2Duration = remainingTime * 0.8;
            }
            const node2Progress = Math.min(1, node2Elapsed / node2Duration);
            const node2Eased = this.easeOutCubic(node2Progress);
            
            // Interpolate positions
            const node1X = node1.startX + (node1.targetX - node1.startX) * node1Eased;
            const node1Y = node1.startY + (node1.targetY - node1.startY) * node1Eased;
            const node2X = node2.startX + (node2.targetX - node2.startX) * node2Eased;
            const node2Y = node2.startY + (node2.targetY - node2.startY) * node2Eased;
            
            // Calculate connection point - between the right edge of node1 and left edge of node2
            const dx = node2X - node1X;
            const dy = node2Y - node1Y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            // Calculate edge positions (accounting for node size)
            const node1HalfSize = node1.size / 2;
            const node2HalfSize = node2.size / 2;
            const connectorX = node1X + Math.cos(angle) * node1HalfSize;
            const connectorY = node1Y + Math.sin(angle) * node1HalfSize;
            
            // Calculate connector opacity and scale based on both nodes' progress
            const connectorProgress = Math.min(node1Progress, node2Progress);
            const connectorOpacity = this.easeOutCubic(connectorProgress);
            const connectorScale = this.easeOutCubic(connectorProgress);
            
            if (connectorOpacity > 0 && connectorScale > 0) {
                this.ctx.save();
                this.ctx.globalAlpha = connectorOpacity;
                this.ctx.translate(connectorX, connectorY);
                this.ctx.rotate(angle);
                this.ctx.scale(connectorScale, connectorScale);
                
                // Draw connector image
                this.ctx.drawImage(
                    this.connectorImage,
                    -this.config.connectorSize / 2,
                    -this.config.connectorSize / 2,
                    this.config.connectorSize,
                    this.config.connectorSize
                );
                
                this.ctx.restore();
            }
        });
    }
    
    // Draw nodes
    drawNodes() {
        if (!this.startTime || this.nodes.length === 0) return;
        
        const currentTime = Date.now() - this.startTime;
        
        // Sort nodes by their target position (back to front) to ensure consistent drawing order
        // This prevents visual artifacts where later nodes appear to overlap earlier ones
        const sortedNodes = [...this.nodes].sort((a, b) => {
            // Sort by y position first (top to bottom), then by x (left to right)
            if (Math.abs(a.targetY - b.targetY) > 10) {
                return a.targetY - b.targetY;
            }
            return a.targetX - b.targetX;
        });
        
        sortedNodes.forEach((node) => {
            // Calculate animation progress for this node
            const nodeStartTime = node.delay;
            const nodeElapsed = Math.max(0, currentTime - nodeStartTime);
            
            // Calculate how much time is left for this node to animate
            let nodeDuration;
            if (node.isCenter) {
                // Center node animates over the first part of the total duration
                nodeDuration = this.config.animationDuration * 0.4; // 40% of total time
            } else {
                // Other nodes animate over the remaining time
                const remainingTime = this.config.animationDuration - this.config.otherNodesStartDelay;
                nodeDuration = remainingTime * 0.8; // 80% of remaining time for movement
            }
            
            const nodeProgress = Math.min(1, nodeElapsed / nodeDuration);
            
            // Apply easing
            const progress = this.easeOutCubic(nodeProgress);
            const scale = this.easeOutCubic(nodeProgress);
            const opacity = this.easeOutCubic(nodeProgress);
            
            // Interpolate position from start to target
            const currentX = node.startX + (node.targetX - node.startX) * progress;
            const currentY = node.startY + (node.targetY - node.startY) * progress;
            
            if (node.image && scale > 0) {
                this.ctx.save();
                this.ctx.globalAlpha = opacity;
                this.ctx.translate(currentX, currentY);
                this.ctx.scale(scale, scale);
                
                // Calculate aspect ratio and scale to fit within node.size
                const imgWidth = node.image.width || node.image.naturalWidth || node.size;
                const imgHeight = node.image.height || node.image.naturalHeight || node.size;
                const imgAspectRatio = imgWidth / imgHeight;
                
                let drawWidth, drawHeight;
                if (imgAspectRatio > 1) {
                    // Image is wider than tall
                    drawWidth = node.size;
                    drawHeight = node.size / imgAspectRatio;
                } else {
                    // Image is taller than wide or square
                    drawHeight = node.size;
                    drawWidth = node.size * imgAspectRatio;
                }
                
                // Create rounded rectangle path for clipping
                const halfWidth = drawWidth / 2;
                const halfHeight = drawHeight / 2;
                const radius = this.config.borderRadius;
                this.ctx.beginPath();
                this.ctx.moveTo(-halfWidth + radius, -halfHeight);
                this.ctx.lineTo(halfWidth - radius, -halfHeight);
                this.ctx.quadraticCurveTo(halfWidth, -halfHeight, halfWidth, -halfHeight + radius);
                this.ctx.lineTo(halfWidth, halfHeight - radius);
                this.ctx.quadraticCurveTo(halfWidth, halfHeight, halfWidth - radius, halfHeight);
                this.ctx.lineTo(-halfWidth + radius, halfHeight);
                this.ctx.quadraticCurveTo(-halfWidth, halfHeight, -halfWidth, halfHeight - radius);
                this.ctx.lineTo(-halfWidth, -halfHeight + radius);
                this.ctx.quadraticCurveTo(-halfWidth, -halfHeight, -halfWidth + radius, -halfHeight);
                this.ctx.closePath();
                
                // Clip to rounded rectangle
                this.ctx.clip();
                
                // Draw image maintaining aspect ratio
                this.ctx.drawImage(
                    node.image,
                    -halfWidth,
                    -halfHeight,
                    drawWidth,
                    drawHeight
                );
                
                this.ctx.restore();
            }
        });
    }
    
    // Easing function for smooth animation
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    // Start recording the canvas as video
    startRecording(loops = 3) {
        if (!this.canvas) return;
        
        this.recordingLoops = loops;
        this.recordingLoopCount = 0;
        
        try {
            const stream = this.canvas.captureStream(60); // 60 FPS
            
            // For transparency, we need to use WebM with VP8 or VP9 codec that supports alpha
            // VP8 with alpha: 'video/webm;codecs=vp8'
            // VP9 with alpha: 'video/webm;codecs=vp9' (may not preserve alpha in all browsers)
            let mimeType = 'video/webm;codecs=vp8';
            let fileExtension = 'webm';
            
            // Try VP8 first (better alpha support), then VP9, then fallback
            if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
                mimeType = 'video/webm;codecs=vp8';
            } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
                mimeType = 'video/webm;codecs=vp9';
            } else if (MediaRecorder.isTypeSupported('video/webm')) {
                mimeType = 'video/webm';
            }
            
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: mimeType,
                videoBitsPerSecond: 5000000 // 5 Mbps for better quality
            });
            
            this.recordedChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { type: mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `node-animation-${Date.now()}.${fileExtension}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                console.log('Video saved as WebM with transparent background!');
                console.log('Note: Transparency is preserved in WebM format.');
                console.log('To convert to MP4 (may lose transparency), use:');
                console.log('FFmpeg: ffmpeg -i input.webm -c:v libx264 -pix_fmt yuv420p -c:a aac output.mp4');
                console.log('For MP4 with transparency, use: ffmpeg -i input.webm -c:v libx264 -pix_fmt yuva420p output.mp4');
                // Show conversion info
                const convertInfo = document.getElementById('convertInfo');
                if (convertInfo) {
                    convertInfo.innerHTML = '<strong>Video saved with transparent background!</strong><br>WebM format preserves transparency.<br>To convert to MP4 (may lose transparency):<br><code style="background: #333; padding: 2px 5px;">ffmpeg -i input.webm -c:v libx264 -pix_fmt yuv420p output.mp4</code>';
                    convertInfo.style.display = 'block';
                    setTimeout(() => {
                        convertInfo.style.display = 'none';
                    }, 10000); // Hide after 10 seconds
                }
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            console.log(`Recording started... (format: ${fileExtension.toUpperCase()})`);
        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Recording not supported in this browser. Try using Chrome or Firefox, or use screen recording software.');
        }
    }
    
    // Stop recording
    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            console.log('Recording stopped. Processing video...');
        }
    }
    
    // Main animation loop
    animate() {
        if (!this.ctx || !this.canvas) {
            return; // Canvas not initialized
        }
        
        if (!this.isAnimating) {
            this.isAnimating = true;
            this.startTime = Date.now();
        }
        
        // Clear canvas (transparent background)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        
        // Draw connectors (before nodes so they appear behind)
        if (this.imagesLoaded && this.nodes.length > 0 && this.connectorImage) {
            this.drawConnectors();
        }
        
        // Draw nodes (only if images are loaded and nodes are generated)
        if (this.imagesLoaded && this.nodes.length > 0) {
            this.drawNodes();
        }
        
        // Handle looping for recording
        if (this.isRecording && this.startTime) {
            const elapsed = Date.now() - this.startTime;
            const loopDuration = this.config.animationDuration + 500; // Animation + small buffer
            
            // If we've completed one loop, restart the animation (without regenerating positions)
            if (elapsed >= loopDuration && this.recordingLoopCount < this.recordingLoops - 1) {
                this.recordingLoopCount++;
                this.restart(false); // Restart animation for next loop without regenerating positions
            }
            // Stop recording after all loops complete
            else if (elapsed >= loopDuration * this.recordingLoops) {
                this.stopRecording();
            }
        }
        
        // Continue animation loop
        requestAnimationFrame(() => this.animate());
    }
    
    // Restart animation
    restart(regeneratePositions = true) {
        if (regeneratePositions) {
            this.generateNodePositions(); // Regenerate positions for new random center
        }
        this.startTime = Date.now();
        this.isAnimating = true;
    }
}

// Initialize animation when page loads
let nodeAnimation;

document.addEventListener('DOMContentLoaded', () => {
    nodeAnimation = new NodeAnimation();
    
    // Restart on click (but not on record button)
    document.addEventListener('click', (e) => {
        if (e.target.id !== 'recordBtn') {
            nodeAnimation.restart();
        }
    });
    
    // Keyboard shortcuts for recording
    document.addEventListener('keydown', (e) => {
        // Press 'R' to start/stop recording (loops 3 times by default)
        if (e.key === 'r' || e.key === 'R') {
            if (nodeAnimation.isRecording) {
                nodeAnimation.stopRecording();
            } else {
                nodeAnimation.restart(); // Restart animation
                setTimeout(() => {
                    nodeAnimation.startRecording(3); // Record 3 loops
                }, 100);
            }
        }
        // Press 'L' to record with more loops (5 loops)
        if (e.key === 'l' || e.key === 'L') {
            if (!nodeAnimation.isRecording) {
                nodeAnimation.restart();
                setTimeout(() => {
                    nodeAnimation.startRecording(5); // Record 5 loops
                }, 100);
            }
        }
    });
    
    // Add instructions to console
    console.log('Press "R" key to record the animation as a looping video (3 loops)');
    console.log('Press "L" key to record with 5 loops');
});

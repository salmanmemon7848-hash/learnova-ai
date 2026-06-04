const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function drawLogo(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Background gradient - richer purple
    const gradient = ctx.createRadialGradient(size * 0.3, size * 0.3, 0, size * 0.5, size * 0.5, size * 0.7);
    gradient.addColorStop(0, '#7c3aed');
    gradient.addColorStop(0.5, '#534AB7');
    gradient.addColorStop(1, '#4338a0');
    
    // Draw rounded rectangle background
    const radius = size * 0.22;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fill();
    
    // Add subtle inner glow
    const innerGlow = ctx.createRadialGradient(size * 0.5, size * 0.5, 0, size * 0.5, size * 0.5, size * 0.5);
    innerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    innerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = innerGlow;
    ctx.fillRect(0, 0, size, size);
    
    // Center position for logo
    const centerX = size * 0.5;
    const centerY = size * 0.5;
    
    // Draw AI brain/learning symbol - interconnected nodes
    const nodeRadius = size * 0.04;
    const lineWidth = size * 0.015;
    
    // Node positions (forming a stylized brain/learning pattern)
    const nodes = [
        { x: centerX, y: centerY - size * 0.18 }, // Top
        { x: centerX - size * 0.15, y: centerY - size * 0.05 }, // Top-left
        { x: centerX + size * 0.15, y: centerY - size * 0.05 }, // Top-right
        { x: centerX - size * 0.18, y: centerY + size * 0.1 }, // Left
        { x: centerX + size * 0.18, y: centerY + size * 0.1 }, // Right
        { x: centerX, y: centerY + size * 0.2 }, // Bottom
        { x: centerX, y: centerY + size * 0.05 }, // Center
    ];
    
    // Draw connections (neural network)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    
    const connections = [
        [0, 1], [0, 2], [1, 2], // Top triangle
        [1, 3], [2, 4], // Sides
        [3, 5], [4, 5], // Bottom triangle
        [1, 6], [2, 6], [3, 6], [4, 6], // To center
        [0, 6], [6, 5] // Vertical through center
    ];
    
    connections.forEach(([start, end]) => {
        ctx.beginPath();
        ctx.moveTo(nodes[start].x, nodes[start].y);
        ctx.lineTo(nodes[end].x, nodes[end].y);
        ctx.stroke();
    });
    
    // Draw nodes
    nodes.forEach((node, index) => {
        // Outer glow
        const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeRadius * 2);
        glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Node circle
        const nodeGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeRadius);
        nodeGradient.addColorStop(0, '#ffffff');
        nodeGradient.addColorStop(1, '#e0e0ff');
        ctx.fillStyle = nodeGradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Add "L" letter overlay - subtle but recognizable
    const lPadding = size * 0.28;
    const lWidth = size * 0.08;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = lWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Vertical line of L
    ctx.beginPath();
    ctx.moveTo(lPadding, lPadding);
    ctx.lineTo(lPadding, size - lPadding);
    ctx.stroke();
    
    // Horizontal line of L
    ctx.beginPath();
    ctx.moveTo(lPadding, size - lPadding);
    ctx.lineTo(size - lPadding, size - lPadding);
    ctx.stroke();
    
    // Add sparkle accents
    const sparkles = [
        { x: size * 0.15, y: size * 0.15, s: size * 0.03 },
        { x: size * 0.85, y: size * 0.2, s: size * 0.025 },
        { x: size * 0.8, y: size * 0.8, s: size * 0.02 },
    ];
    
    sparkles.forEach(sparkle => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        // 4-point star
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const r = i % 2 === 0 ? sparkle.s : sparkle.s * 0.4;
            const x = sparkle.x + Math.cos(angle) * r;
            const y = sparkle.y + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
    });
    
    return canvas;
}

// Generate and save icons
const iconsDir = path.join(__dirname, 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('🎨 Generating Learnova AI PWA icons...');

// Generate 192x192 icon
const canvas192 = drawLogo(192);
const buffer192 = canvas192.toBuffer('image/png');
const path192 = path.join(iconsDir, 'icon-192.png');
fs.writeFileSync(path192, buffer192);
console.log('✅ Created icon-192.png (192x192)');

// Generate 512x512 icon
const canvas512 = drawLogo(512);
const buffer512 = canvas512.toBuffer('image/png');
const path512 = path.join(iconsDir, 'icon-512.png');
fs.writeFileSync(path512, buffer512);
console.log('✅ Created icon-512.png (512x512)');

console.log('\n🎉 Icons successfully placed in public/icons/ folder!');
console.log('📱 Your PWA is now ready with beautiful icons!');

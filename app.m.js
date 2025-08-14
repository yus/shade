// Mobile-optimized version
console.log("Loading mobile version");

// ===== TOUCH EVENT HANDLERS =====
document.getElementById("analyze-btn").addEventListener("touchend", processImage, {passive: true});

// ===== MOBILE-SPECIFIC OPTIMIZATIONS =====
function loadImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Downsample for mobile memory constraints
      const canvas = document.createElement('canvas');
      const maxSize = 800;
      let width = img.width;
      let height = img.height;
      
      if (width > maxSize) {
        height = (maxSize / width) * height;
        width = maxSize;
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Return both original and processed
      resolve({
        original: img,
        processed: canvas
      });
    };
    img.src = URL.createObjectURL(file);
  });
}

// Modified extractPalette for mobile
async function extractPalette(imageData) {
  console.log("Mobile color extraction started");
  
  // Use simpler quantization for mobile
  const pixels = [];
  const data = imageData.data;
  
  // Sample every 4th pixel for performance
  for (let i = 0; i < data.length; i += 16) {
    pixels.push([data[i], data[i+1], data[i+2]]);
  }
  
  return quantize(pixels, 5).palette();
}

// ===== SHARED FUNCTIONS =====
// Include all other functions from app.js here
// but use mobile-optimized versions where needed

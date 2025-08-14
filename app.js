// Fixed and optimized version
async function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function getImageData(img) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = Math.min(200, img.width);
  canvas.height = Math.min(200, img.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const formatted = [];
  
  // Convert RGBA to RGB, skipping transparent pixels
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i+3] > 0) { // Only include non-transparent pixels
      formatted.push([pixels[i], pixels[i+1], pixels[i+2]]);
    }
  }
  
  return formatted.length > 0 ? formatted : [[0,0,0]]; // Fallback
}

async function extractPalette(file) {
  try {
    const img = await loadImage(file);
    const data = getImageData(img);
    return quantize(data, 5).palette();
  } catch (e) {
    console.error("Extraction failed:", e);
    return [[255,255,255], [0,0,0]]; // Default palette
  }
}

function getDominantColors(imageData, colorCount = 5) {
  // Convert to LAB color space for better perception
  const pixels = rgbToLab(imageData);
  const kmeans = new KMeans(pixels, colorCount);
  return kmeans.clusters.map(cluster => {
    return labToRgb(cluster.centroid);
  });
}

// Helper conversion functions
function rgbToLab(rgbData) {
  // Implementation using d3-color or similar
  return rgbData.map(pixel => {
    const lab = d3.lab(d3.rgb(pixel[0], pixel[1], pixel[2]));
    return [lab.l, lab.a, lab.b];
  });
}

async function generateColorStory(palette) {
  const colorsHex = palette.map(c => 
    `#${c.map(v => v.toString(16).padStart(2,'0').join('')}`
  );
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4-turbo",
      messages: [{
        role: "user",
        content: `Create a 100-word creative description about this color palette: ${colorsHex.join(', ')}. 
        Include emotional associations and design suggestions.`
      }]
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
}

function generatePDF(palette, story) {
  const pdf = new PDFDocument();
  pdf.font('Helvetica');
  
  // Add color grid
  palette.forEach((color, i) => {
    pdf.rect(50, 100 + i*60, 50, 50)
       .fill(color.map(c => c/255));
  });
  
  // Add story
  pdf.text(story, {
    width: 400,
    align: 'justify'
  });
  
  return pdf;
}

document.getElementById("analyze-btn").addEventListener("click", async () => {
  const file = document.getElementById("image-upload").files[0];
  const img = await loadImage(file);
  
  // Show previews
  document.getElementById("original-preview").src = URL.createObjectURL(file);
  document.getElementById("upload-section").style.display = "none";
  document.getElementById("preview-section").style.display = "block";
  
  // Process colors
  const palette = await extractPalette(img);
  renderPalette(palette);
});

document.getElementById("generate-story-btn").addEventListener("click", async () => {
  const story = await generateColorStory(currentPalette);
  document.getElementById("color-story").innerHTML = story;
  document.getElementById("preview-section").style.display = "none";
  document.getElementById("story-section").style.display = "block";
});

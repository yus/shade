// ===== Core Functions =====
// Helper: Load image to canvas
function loadImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = URL.createObjectURL(file);
  });
}

// Helper: Get image data for quantize.js
// Replace the getImageData function with this:
function getImageData(img) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = Math.min(img.width, 200);
  canvas.height = Math.min(img.height, 200);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  // Get pixel data and reformat for quantize
  const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const formattedData = [];
  
  for (let i = 0; i < pixelData.length; i += 4) {
    formattedData.push([pixelData[i], pixelData[i+1], pixelData[i+2]]);
  }
  
  return formattedData;
}

// Main: Extract color palette
// Update the extractPalette function to:
async function extractPalette(file) {
  try {
    console.log("Loading image...");
    const image = await loadImage(file);
    console.log("Image loaded, dimensions:", image.width, "x", image.height);
    
    console.log("Getting image data...");
    const imageData = getImageData(image);
    console.log("Image data length:", imageData.length);
    
    if (!imageData || imageData.length === 0) {
      throw new Error("Empty image data");
    }
    
    console.log("Quantizing colors...");
    const palette = quantize(imageData, 5).palette();
    console.log("Palette generated:", palette);
    
    return palette;
  } catch (error) {
    console.error("Error in extractPalette:", error);
    throw error;
  }
}

// Main: Generate PDF
async function generatePDF(palette) {
  const { PDFDocument, rgb } = PDFLib;
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([400, 600]);

  // Add color swatches
  palette.forEach((color, i) => {
    const [r, g, b] = color;
    page.drawRectangle({
      color: rgb(r/255, g/255, b/255),
      x: 50, y: 500 - i * 60,
      width: 50, height: 50,
    });
    page.drawText(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase(), {
      x: 110, y: 530 - i * 60,
      size: 12,
    });
  });

  // Add footer
  page.drawText("Generated with Shade (github.com/yus/shade)", {
    x: 50,
    y: 30,
    size: 10,
    color: rgb(0.5, 0.5, 0.5),
  });

  return await pdfDoc.save();
}

// ===== UI Integration =====
document.getElementById("generate-pdf").addEventListener("click", async () => {
  console.log("Generate PDF button clicked"); // Debug log 1
  
  const file = document.getElementById("image-upload").files[0];
  if (!file) {
    console.log("No file selected"); // Debug log 2
    return alert("Please upload an image first!");
  }

  try {
    console.log("Starting palette extraction"); // Debug log 3
    const palette = await extractPalette(file);
    console.log("Palette extracted:", palette); // Debug log 4
    
    console.log("Starting PDF generation"); // Debug log 5
    const pdfBytes = await generatePDF(palette);
    console.log("PDF generated successfully"); // Debug log 6
    
    download(new Blob([pdfBytes]), "shade-palette.pdf", "application/pdf");
  } catch (error) {
    console.error("Full error details:", error); // Debug log 7
    alert("Failed to generate PDF. Please try another image.");
  }
});

// Temporary test - add this at the end of app.js
async function testWithSampleImage() {
  const response = await fetch('https://github.com/yus/yus.github.io/blob/master/images');
  const blob = await response.blob();
  const file = new File([blob], 'yus143.png', { type: 'image/png' });
  
  // Simulate click with test file
  document.getElementById('image-upload').files = [file];
  document.getElementById("generate-pdf").click();
}

// Run test after 3 seconds
setTimeout(testWithSampleImage, 3000);


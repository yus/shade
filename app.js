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
function getImageData(img) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.min(img.width, 200); // Limit size for performance
  canvas.height = Math.min(img.height, 200);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
}

// Main: Extract color palette
async function extractPalette(file) {
  const image = await loadImage(file);
  return quantize(getImageData(image), 5).palette(); // 5 colors max
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
  const file = document.getElementById("image-upload").files[0];
  if (!file) return alert("Please upload an image first!");

  try {
    const palette = await extractPalette(file);
    const pdfBytes = await generatePDF(palette);
    
    // Download PDF
    download(new Blob([pdfBytes]), "shade-palette.pdf", "application/pdf");
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to generate PDF. Please try another image.");
  }
});

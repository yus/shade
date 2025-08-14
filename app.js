document.getElementById("generate-pdf").addEventListener("click", async () => {
  const file = document.getElementById("image-upload").files[0];
  if (!file) return alert("Upload an image first!");

  // Step 1: Extract colors (quantize.js)
  const image = await loadImage(file);
  const palette = quantize(getImageData(image), 5).palette();
  renderPalette(palette);

  // Step 2: Generate PDF (pdf-lib)
  const { PDFDocument, rgb } = PDFLib;
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([400, 600]);

  // Add colors to PDF
  palette.forEach((color, i) => {
    const [r, g, b] = color;
    page.drawRectangle({
      color: rgb(r/255, g/255, b/255),
      x: 50, y: 500 - i * 60,
      width: 50, height: 50,
    });
    page.drawText(`#${r.toString(16)}${g.toString(16)}${b.toString(16)}`, {
      x: 110, y: 530 - i * 60,
    });
  });

  // Add eSign placeholder
  page.drawText("Approved by: ________________", { x: 50, y: 50 });

  // Download
  const pdfBytes = await pdfDoc.save();
  download(new Blob([pdfBytes]), "palette-signature.pdf", "application/pdf");
});

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
  canvas.width = Math.min(img.width, 200); // Limit size for speed
  canvas.height = Math.min(img.height, 200);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
}

// Helper: Show palette preview
function renderPalette(palette) {
  const container = document.getElementById("palette-preview");
  container.innerHTML = "";
  palette.forEach(color => {
    const box = document.createElement("div");
    box.className = "color-box";
    box.style.backgroundColor = `rgb(${color.join(",")})`;
    container.appendChild(box);
  });
}

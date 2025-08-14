export function rgbToHex(rgb) {
  return `#${rgb.map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

export function extractPalette(imageData, count = 5) {
  // Simplified k-means implementation
  const pixels = imageData.data;
  const clusters = [];
  
  // Sample implementation (replace with actual k-means)
  for (let i = 0; i < count; i++) {
    clusters.push([
      pixels[i*4],
      pixels[i*4+1],
      pixels[i*4+2]
    ]);
  }
  
  return clusters;
}

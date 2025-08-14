const Shade = require('../dist/shade.umd.js');

test('Color conversion works', () => {
  const rgb = [255, 0, 0];
  const hex = Shade.rgbToHex(rgb);
  expect(hex).toBe('#ff0000');
});

import * as color from './color';
import * as pdf from './pdf';
import * as story from './story';

export default {
  ...color,
  ...pdf,
  ...story
};

// For Node.js compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ...color,
    ...pdf,
    ...story
  };
}

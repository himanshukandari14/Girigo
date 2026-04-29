const fs = require('fs');

const rows = 60;
const cols = 22;
const matrix = [];

for (let r = 0; r < rows; r++) {
  let row = '';
  // slope on the left
  let leftEdge = 20 - Math.floor(r / 2.5);
  if (r > 40) {
    leftEdge = 20 - Math.floor(40 / 2.5) - Math.floor((r - 40) * 1.5);
  }
  
  if (r > 50) {
    leftEdge = leftEdge + (r - 50) * 2; // slope back in
  }

  // right edge (center of hands)
  let rightEdge = 21;
  
  // notches
  if (r > 5 && r < 40) {
    if (r % 7 === 0 || r % 7 === 1) {
      rightEdge = 20;
    }
  }

  for (let c = 0; c <= 21; c++) {
    if (c >= Math.max(0, leftEdge) && c <= rightEdge) {
      // dithering at the bottom
      if (r > 42 && r <= 48) {
        // checkered dither
        if ((r + c) % 2 === 0) {
          row += '#';
        } else {
          row += ' ';
        }
      } else if (r > 48 && r <= 50) {
        if (Math.random() > 0.5) {
          row += '#';
        } else {
          row += ' ';
        }
      } else {
        row += '#';
      }
    } else {
      row += ' ';
    }
  }
  matrix.push(row);
}

const out = `
export const LEFT_HAND_MATRIX = [
${matrix.map(r => `  "${r}"`).join(',\n')}
];
`;
fs.writeFileSync('hand_matrix.js', out);
console.log('generated');

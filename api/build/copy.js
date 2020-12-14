const fs = require('fs');
const path = require('path');

console.log();

const packageJSONPath = path.resolve(__dirname, '../package.json')
const destPath = path.resolve(__dirname, '../dist/package.json')

console.log("Copying package.json to newly created build...")
fs.copyFileSync(packageJSONPath, destPath);
console.log("Done.")
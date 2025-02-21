import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const assets = {
  'toolbar.css': readFileSync(resolve('src/styles/toolbar.css'), 'utf8'),
  'fallback.css': readFileSync(resolve('src/styles/fallback.css'), 'utf8')
};

const output = `export const embeddedAssets = ${JSON.stringify(assets)};`;
writeFileSync(resolve('src/config/embeddedAssets.js'), output);

import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { rename } from 'node:fs/promises';
import { resolve } from 'node:path';

const OUT_DIR = 'dist';
const OUT_NAME = 'signandmore-calculator-v5.html';

// Vite schrijft de entry weg als index.html; hernoemen gebeurt na afloop van de
// build, zodat de volgorde ten opzichte van vite-plugin-singlefile niet uitmaakt.
function renameOutput() {
  return {
    name: 'rename-output',
    async closeBundle() {
      await rename(resolve(OUT_DIR, 'index.html'), resolve(OUT_DIR, OUT_NAME));
    },
  };
}

export default defineConfig({
  plugins: [viteSingleFile(), renameOutput()],
  build: {
    outDir: OUT_DIR,
    // Zonder deze vlag wist Vite dist/ leeg, inclusief de v4-referentie.
    emptyOutDir: false,
    assetsInlineLimit: Infinity,
  },
});

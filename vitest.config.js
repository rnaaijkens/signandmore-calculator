import { defineConfig } from 'vitest/config';

// Bewust los van vite.config.js: de singlefile-plugin hoort niet in de tests.
export default defineConfig({
  test: {
    include: ['test/**/*.test.js', 'tests/**/*.test.js'],
  },
});

import { defineConfig } from 'vite';

export default defineConfig({
  // './' makes asset URLs relative, so the app works under the
  // /Etihad-Airlines/ subpath on GitHub Pages without hardcoding the repo name.
  base: './',
});
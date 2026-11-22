import { defineConfig } from 'vite';

const puterLocalhost = (name) => ({
  name: 'puter-localhost',
  apply: 'serve',
  configureServer(server) {
    server.httpServer?.on('listening', () => {
      const local = server.resolvedUrls?.local[0];
      if (!local) return;
      const url = new URL(local);
      url.hostname = `${name}.puter.localhost`;
      server.resolvedUrls.local = [url.href];
    });
  },
});

export default defineConfig({
  plugins: [puterLocalhost('pos')],
  base: './',
  build: {
    target: 'es2022',
    cssTarget: 'safari15',
  },
  server: {
    port: 5174,
  },
  test: {
    environment: 'node',
    include: ['test/**/*.test.js'],
  },
});

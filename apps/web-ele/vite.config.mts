import { defineConfig } from '@vben/vite-config';

import ElementPlus from 'unplugin-element-plus/vite';

const devProxyTarget =
  process.env.VITE_DEV_SERVER_PROXY_TARGET || 'http://localhost:8000';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      plugins: [
        ElementPlus({
          format: 'esm',
        }),
      ],
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            target: devProxyTarget,
          },
        },
      },
    },
  };
});

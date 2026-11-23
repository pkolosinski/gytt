import { defineConfig } from 'orval';

export default defineConfig({
  gytt: {
    input: '../../contracts/openapi.yaml',
    output: {
      client: 'fetch',
      mode: 'tags',
      target: 'src/shared/generated/api',
      baseUrl: '/api',
      clean: true,
    },
  },
});

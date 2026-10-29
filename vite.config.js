import { defineConfig } from 'vite';

// GitHub supplies owner/repository during deployment; local development uses /.
export default defineConfig(() => {
  const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const base = repository && !repository.endsWith('.github.io') ? `/${repository}/` : '/';
  return { base };
});

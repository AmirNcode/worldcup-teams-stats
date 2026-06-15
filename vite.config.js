import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Emit ads.txt at the site root from the AdSense publisher id, so the file is
// always in sync with the configured account and there's no manual step.
// f08c47fec0942fa0 is Google's fixed certification-authority id for AdSense.
function adsTxt(client) {
  return {
    name: 'emit-ads-txt',
    apply: 'build',
    generateBundle() {
      if (!client) return
      const pub = client.replace(/^ca-/, '') // ca-pub-… -> pub-…
      this.emitFile({
        type: 'asset',
        fileName: 'ads.txt',
        source: `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`,
      })
    },
  }
}

// base './' so the built site works from any path (GitHub Pages subpath, etc.)
export default defineConfig(({ mode }) => {
  // default 'VITE_' prefix also reads vars set in Netlify's UI (via process.env)
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [react(), adsTxt(env.VITE_ADSENSE_CLIENT)],
    base: './',
  }
})

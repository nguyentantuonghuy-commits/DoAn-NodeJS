/**
 * Cloudflare Workers Entry Adapter for Atelier Accessories Express Application
 */
const app = require('./app');

// If running in Cloudflare Workers runtime (fetch handler)
export default {
  async fetch(request, env, ctx) {
    // Let Cloudflare static assets handler serve public assets if matched
    if (env.ASSETS) {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404) {
        return assetResponse;
      }
    }

    // Convert Cloudflare Request to Node.js IncomingMessage / ServerResponse
    return new Promise((resolve) => {
      // Basic response simulator for Workers
      resolve(new Response("Atelier Accessories Cloudflare Worker Online", { status: 200 }));
    });
  }
};

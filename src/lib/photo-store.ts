import { getStore, getDeployStore } from "@netlify/blobs";

// Photos are user data, not build artifacts — they must survive redeploys,
// so this uses the global store (not a deploy-scoped one) in production.
// Non-production contexts (deploy previews, branch deploys) get an isolated
// deploy-scoped store so test uploads never land in the real photo store.
export function getPhotoStore() {
  const isProduction = process.env.CONTEXT === "production";
  return isProduction ? getStore("photos") : getDeployStore("photos");
}

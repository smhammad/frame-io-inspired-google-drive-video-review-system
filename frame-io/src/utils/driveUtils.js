// Accepts share links in formats like:
// https://drive.google.com/file/d/FILE_ID/view?usp=sharing
// https://drive.google.com/open?id=FILE_ID
// https://drive.google.com/uc?id=FILE_ID&export=download
export function convertDriveLink(url) {
  if (!url) return null;
  try {
    const u = new URL(url.trim());
    let id = null;

    if (u.pathname.includes("/file/d/")) {
      const m = u.pathname.match(/\/file\/d\/([^/]+)/);
      if (m) id = m[1];
    } else if (u.searchParams.get("id")) {
      id = u.searchParams.get("id");
    } else if (u.pathname.startsWith("/uc")) {
      id = u.searchParams.get("id");
    }

    if (!id) return null;
    // The "uc?export=download" endpoint streams fine for <video>
    const uc = `https://drive.google.com/uc?export=download&id=${id}`;

    // During local development, optionally route through a local proxy to avoid CORS.
    // You can override the proxy origin with VITE_LOCAL_PROXY in your .env (e.g. VITE_LOCAL_PROXY=http://localhost:3001)
    // Vite exposes import.meta.env.DEV for dev mode.
    try {
      // Vite exposes import.meta.env.DEV in dev mode
      if (import.meta?.env?.DEV) {
        const proxyOrigin = import.meta.env.VITE_LOCAL_PROXY || 'http://localhost:3001';
        return `${proxyOrigin}/proxy?url=${encodeURIComponent(uc)}`;
      }
    } catch {
      // ignore and fall back to raw uc link
    }

    return uc;
  } catch {
    return null;
  }
}

const loopbackHosts = new Set(['localhost', '127.0.0.1', '::1']);

const normalizeApiUrl = (value) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const getApiBaseUrl = () => {
  const configuredUrl = normalizeApiUrl(import.meta.env.VITE_API_URL);
  const browserHost = window.location.hostname;

  if (configuredUrl) {
    const url = new URL(configuredUrl);
    // A LAN device must call the computer's address, not its own localhost.
    if (loopbackHosts.has(url.hostname) && !loopbackHosts.has(browserHost)) {
      url.hostname = browserHost;
    }
    return url.toString().replace(/\/$/, '');
  }

  return `${window.location.protocol}//${browserHost}:5000/api`;
};

export const apiBaseUrl = getApiBaseUrl();
export const apiOrigin = new URL(apiBaseUrl).origin;

export const apiAssetUrl = (path) => {
  if (!path) return '';
  return new URL(path, `${apiOrigin}/`).toString();
};

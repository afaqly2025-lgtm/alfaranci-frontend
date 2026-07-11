const loopbackHosts = new Set(['localhost', '127.0.0.1', '::1']);
const defaultApiPath = '/api';

const cleanConfiguredUrl = (value) => {
  let cleaned = String(value || '').trim();

  if (!cleaned) return '';

  // Be forgiving when an env value is pasted with quotes, an assignment, or a markdown link.
  cleaned = cleaned.replace(/^['"]|['"]$/g, '').trim();
  const assignmentMatch = cleaned.match(/^VITE_API_URL\s*=\s*(.+)$/i);
  if (assignmentMatch) {
    cleaned = assignmentMatch[1].trim().replace(/^['"]|['"]$/g, '').trim();
  }

  const markdownMatch = cleaned.match(/\((https?:\/\/[^)]+)\)/i);
  if (markdownMatch) {
    cleaned = markdownMatch[1].trim();
  }

  return cleaned.split(',')[0].trim().replace(/^['"]|['"]$/g, '').trim();
};

const normalizeApiUrl = (value) => {
  const trimmed = cleanConfiguredUrl(value);
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const getApiBaseUrl = () => {
  const configuredUrl = normalizeApiUrl(import.meta.env.VITE_API_URL);
  const browserHost = window.location.hostname;

  if (configuredUrl) {
    try {
      const url = new URL(configuredUrl);
      // A LAN device must call the computer's address, not its own localhost.
      if (loopbackHosts.has(url.hostname) && !loopbackHosts.has(browserHost)) {
        url.hostname = browserHost;
      }
      if (!url.pathname || url.pathname === '/') {
        url.pathname = defaultApiPath;
      }
      return url.toString().replace(/\/$/, '');
    } catch {
      console.warn('Invalid VITE_API_URL value. Falling back to the current host API URL.');
    }
  }

  return `${window.location.protocol}//${browserHost}:5000${defaultApiPath}`;
};

export const apiBaseUrl = getApiBaseUrl();
export const apiOrigin = new URL(apiBaseUrl).origin;

export const apiAssetUrl = (path) => {
  if (!path) return '';
  try {
    return new URL(path, `${apiOrigin}/`).toString();
  } catch {
    return `${apiOrigin}/${String(path).replace(/^\/+/, '')}`;
  }
};

// Central Fetch API wrapper. No Axios anywhere in this project — every
// network call in LifeOS goes through this module so token handling,
// refresh, and error shaping happen in exactly one place.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const TOKEN_KEY = "lifeos_access_token";
const REFRESH_KEY = "lifeos_refresh_token";

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem(TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

let refreshPromise = null;

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) throw new ApiError("No refresh token available", 401, null);

  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_URL}/auth/login/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    })
      .then(async (res) => {
        if (!res.ok) throw new ApiError("Session expired", res.status, null);
        const data = await res.json();
        setTokens({ access: data.access, refresh: data.refresh });
        return data.access;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

/**
 * Core request helper. Automatically attaches the JWT, retries once after
 * a silent token refresh on 401, and throws ApiError with parsed body on
 * any non-2xx response.
 */
async function request(path, { method = "GET", body, headers = {}, auth = true, isRetry = false } = {}) {
  const finalHeaders = { ...headers };
  let finalBody = body;

  if (body && !(body instanceof FormData)) {
    finalHeaders["Content-Type"] = "application/json";
    finalBody = JSON.stringify(body);
  }

  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: finalBody,
  });

  if (res.status === 401 && auth && !isRetry) {
    try {
      await refreshAccessToken();
      return request(path, { method, body, headers, auth, isRetry: true });
    } catch {
      clearTokens();
      window.dispatchEvent(new CustomEvent("lifeos:logout"));
      throw new ApiError("Session expired. Please log in again.", 401, null);
    }
  }

  if (res.status === 204) return null;

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message = extractErrorMessage(data) || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data);
  }

  return data;
}

function extractErrorMessage(data) {
  if (!data) return null;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  // DRF validation errors: { field: ["msg"] } or { field: "msg" }
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = data[firstKey];
    const msg = Array.isArray(val) ? val[0] : val;
    return typeof msg === "string" ? `${firstKey}: ${msg}` : null;
  }
  return null;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  patch: (path, body, opts) => request(path, { ...opts, method: "PATCH", body }),
  put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
  delete: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};

export { ApiError, BASE_URL };

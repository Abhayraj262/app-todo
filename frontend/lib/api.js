const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error("Could not reach the server.");
  }

  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success) {
    if (response.status === 401 && !path.startsWith("/api/auth/login")) {
      window.dispatchEvent(new Event("auth:expired"));
    }
    const error = new Error(body?.message || "Something went wrong.");
    error.status = response.status;
    throw error;
  }

  return body.data;
}

export function register(input) {
  return request("/api/auth/register", { method: "POST", body: JSON.stringify(input) });
}

export function login(input) {
  return request("/api/auth/login", { method: "POST", body: JSON.stringify(input) });
}

export function logout() {
  return request("/api/auth/logout", { method: "POST" });
}

export function getMe() {
  return request("/api/auth/me");
}

export function getTasks(range) {
  const params = new URLSearchParams();
  if (range?.from && range?.to) {
    params.set("from", range.from);
    params.set("to", range.to);
  }
  const query = params.toString();
  return request(`/api/tasks${query ? `?${query}` : ""}`);
}

export function createTask(input) {
  return request("/api/tasks", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateTask(id, changes) {
  return request(`/api/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}

export function deleteTask(id) {
  return request(`/api/tasks/${id}`, { method: "DELETE" });
}

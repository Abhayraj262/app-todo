const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
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
    throw new Error(body?.message || "Something went wrong.");
  }

  return body.data;
}

export function getTasks() {
  return request("/api/tasks");
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

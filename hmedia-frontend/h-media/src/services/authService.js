export async function loginUser(baseURL, payload) {
  const fd = new FormData();
  fd.append("username", payload.username);
  fd.append("password", payload.password);

  const res = await fetch(`${baseURL}/admin/login`, {
    method: "POST",
    body: fd,
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Login failed");
  }

  return data;
}

export async function logoutUser(baseURL) {
  const res = await fetch(`${baseURL}/admin/logout`, {
    method: "POST",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Logout failed");
  }

  return data;
}

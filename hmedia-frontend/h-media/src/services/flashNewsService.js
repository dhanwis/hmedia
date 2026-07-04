export async function fetchFlashNews(baseURL) {
  const res = await fetch(`${baseURL}/flash-news/`);
  if (!res.ok) throw new Error("Failed to load flash news");
  return await res.json();
}

export async function addFlashNews(baseURL,data) {
  const token = localStorage.getItem("access_token");
  const form = new FormData();
  form.append("title", data.title);
  form.append("status", data.status);
  form.append("link", data.url);

  const res = await fetch(`${baseURL}/admin/flash-news/`, {
    method: "POST",
    body: form,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const out = await res.json();
  if (!res.ok) throw new Error(out.detail || "Failed to add flash news");
  return out;
}

export async function updateFlashNews(baseURL,id, data) {
  const token = localStorage.getItem("access_token");
  const form = new FormData();
  form.append("title", data.title);
  form.append("status", data.status);
   form.append("link", data.url);

  const res = await fetch(`${baseURL}/admin/flash-news/${id}`, {
    method: "PUT",
    body: form,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const out = await res.json();

  if (!res.ok) throw new Error(out.detail || "Failed to update flash news");
  return out;
}

export async function deleteFlashNews(baseURL,id) {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${baseURL}/admin/flash-news/${id}`, {
    method: "DELETE",
     headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const out = await res.json();
    throw new Error(out.detail || "Failed to delete flash news");
  }

  return true;
}

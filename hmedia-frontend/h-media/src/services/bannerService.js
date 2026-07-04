export async function fetchBanners(baseURL) {
  const res = await fetch(`${baseURL}/banner/`);
  if (!res.ok) throw new Error("Failed to load banners");
  return await res.json();
}

export async function fetchBannersHome(baseURL) {
  const res = await fetch(`${baseURL}/banner/homepage`);
  if (!res.ok) throw new Error("Failed to load home banners");
  return await res.json();
}

export async function addBanner(baseURL,data) {
   const token = localStorage.getItem("access_token");
  const res = await fetch(`${baseURL}/admin/banner`, {
    method: "POST",
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const out = await res.json();
  if (!res.ok) throw new Error(out.detail || "Failed to add banner");
  return out;
}

export async function updateBanner(baseURL,id, data) {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${baseURL}/admin/banner/${id}`, {
    method: "PUT",
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const out = await res.json();

  if (!res.ok) throw new Error(out.detail || "Failed to update banner");
  return out;
}

export async function deleteBanner(baseURL,id) {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${baseURL}/admin/banner/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const out = await res.json();
    throw new Error(out.detail || "Failed to delete banner");
  }

  return true;
}

export async function fetchFullScreenAds(baseURL) {
  const res = await fetch(`${baseURL}/full-screen-ads/`);
  if (!res.ok) throw new Error("Failed to load fullscreen ads");
  return await res.json();
}

export async function addFullScreenAd(baseURL, formData) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${baseURL}/admin/full-screen-ads/`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to create fullscreen ad");
  return res.json();
}

export async function updateFullScreenAd(baseURL, id, formData) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${baseURL}/admin/full-screen-ads/${id}/`, {
    method: "PUT",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to update fullscreen ad");
  return res.json();
}

export async function deleteFullScreenAd(baseURL, id) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${baseURL}/admin/full-screen-ads/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to delete fullscreen ad");
}
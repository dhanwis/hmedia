export async function fetchBottomAdBanner(baseURL) {
  const res = await fetch(`${baseURL}/bottom-banner-ads/`);
  if (!res.ok) throw new Error("Failed to load bottom banner ads");
  return await res.json();
}

export async function AddBottomAdBanner(baseURL, formData) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${baseURL}/admin/bottom-banner-ads/`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to create bottom ad banner");
  return res.json();
}

export async function updateBottomAdBanner(baseURL, id, formData) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${baseURL}/admin/bottom-banner-ads/${id}/`, {
    method: "PUT",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to update Bottom Ad Banner");
  return res.json();
}

export async function deleteBottomBannerAd(baseURL, id) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${baseURL}/admin/bottom-banner-ads/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to delete bottom ad banner");
}

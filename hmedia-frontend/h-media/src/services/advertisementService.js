export async function fetchBannerAds(baseURL) {
  const res = await fetch(`${baseURL}/banner-ads/`);
  if (!res.ok) throw new Error("Failed to load banner ads");
  return res.json();
}

export async function fetchSquareAds(baseURL) {
  const res = await fetch(`${baseURL}/square-ads/`);
  
  if (!res.ok) throw new Error("Failed to load square ads");
  return res.json();
}

export async function createAd(baseURL, adType, formData) {
  const token = localStorage.getItem("access_token");
  const url =
    adType === "banner"
      ? `${baseURL}/admin/banner-ads/`
      : `${baseURL}/admin/square-ads/`;

  const res = await fetch(url, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to create ad");
  return res.json();
}

export async function updateAd(baseURL, adType, id, formData) {
  const token = localStorage.getItem("access_token");
  const url =
    adType === "banner"
      ? `${baseURL}/admin/banner-ads/${id}`
      : `${baseURL}/admin/square-ads/${id}`;

  const res = await fetch(url, {
    method: "PUT",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to update ad");
  return res.json();
}

export async function deleteAd(baseURL, adType, id) {
  const token = localStorage.getItem("access_token");
  const url =
    adType === "banner"
      ? `${baseURL}/admin/banner-ads/${id}`
      : `${baseURL}/admin/square-ads/${id}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to delete ad");
}

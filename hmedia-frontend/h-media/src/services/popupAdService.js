export async function fetchPopupAd(baseURL) {
  const res = await fetch(`${baseURL}/pop-up-ads/`);
  if (!res.ok) throw new Error("Failed to load poup ad");
  return await res.json();
}

export async function AddPopupAd(baseURL, formData) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${baseURL}/admin/pop-up-ads/`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to create popup ad");
  return res.json();
}

export async function updatePopupAd(baseURL, id, formData) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${baseURL}/admin/pop-up-ads/${id}/`, {
    method: "PUT",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to update popup ad");
  return res.json();
}

export async function deletePopupAd(baseURL, id) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${baseURL}/admin/pop-up-ads/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to delete popup ad");
}

export async function fetchTeasers(baseURL) {
  const res = await fetch(`${baseURL}/teaser-and-promo/`);
  if (!res.ok) throw new Error("Failed to load teasers");
  return await res.json();
}

export const fetchTeasersLimit = async (baseURL) => {
  try {
    const res = await fetch(`${baseURL}/teaser-and-promo/limit`);
    if (!res.ok) throw new Error("Failed to load teasers limit");
    return await res.json();
  } catch (err) {
    console.error("Failed to load teasers limit");
    return [];
  }
};

export async function addTeaser(baseURL, data) {
  const token = localStorage.getItem("access_token");
  const form = new FormData();

  form.append("video_title", data.title);
  form.append("video_url", data.youtubeUrl);
  form.append("active_inactive", data.status === "Active");
  form.append("published_date", data.publishedDate.toISOString().split("T")[0]);

  const res = await fetch(`${baseURL}/admin/teaser-and-promo`, {
    method: "POST",
    body: form,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const out = await res.json();
  if (!res.ok) throw new Error(out.detail || "Failed to add teaser");
  return out;
}

export async function updateTeaser(baseURL, id, data) {
  const token = localStorage.getItem("access_token");
  const form = new FormData();

  form.append("video_title", data.title);
  form.append("video_url", data.youtubeUrl);
  form.append("active_inactive", data.status === "Active" ? "true" : "false");
  form.append("published_date", data.publishedDate.toISOString().split("T")[0]);

  const res = await fetch(`${baseURL}/admin/teaser-and-promo/${id}`, {
    method: "PUT",
    body: form,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const out = await res.json();
  if (!res.ok) throw new Error(out.detail || "Failed to update teaser");
  return out;
}

export async function deleteTeaser(baseURL, id) {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${baseURL}/admin/teaser-and-promo/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const out = await res.json();
  if (!res.ok) throw new Error(out.detail || "Failed to delete teaser");
  return out;
}


export const fetchTeasersPaginated = async (
  baseURL,
  page = 1
) => {
  try {
    const res = await fetch(
      `${baseURL}/teaser-and-promo/paginate?page=${page}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch paginated teasers");
    }

    return await res.json(); 
    // { page, limit, total, items }
  } catch (err) {
    console.error("Error fetching paginated teasers");
    return {
      page: 1,
      limit: 12,
      total: 0,
      items: [],
    };
  }
};
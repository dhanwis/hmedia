export async function fetchCinemaNews(baseURL) {
  const res = await fetch(`${baseURL}/cinema-news/`);
  if (!res.ok) throw new Error("Failed to load cinema news");
  return await res.json();
}


export const fetchCinemaNewsLimit = async (baseURL) => {
  try {
    const res = await fetch(`${baseURL}/cinema-news/limit`);
    if (!res.ok) throw new Error("Failed to load cinema news limit");
    return await res.json();
  } catch (err) {
    console.error("Failed to load cinema news limit");
    return [];
  }
};

export async function addCinemaNews(baseURL, formData) {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${baseURL}/admin/cinema-news/`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const out = await res.json();
  if (!res.ok) throw new Error(out.detail || "Failed to add cinema news");
  return out;
}

export async function updateCinemaNews(baseURL, id, formData) {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${baseURL}/admin/cinema-news/${id}`, {
    method: "PUT",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const out = await res.json();
  if (!res.ok) throw new Error(out.detail || "Failed to update cinema news");
  return out;
}

export async function deleteCinemaNews(baseURL, id) {
  const token = localStorage.getItem("access_token");
  try {
    const res = await fetch(`${baseURL}/admin/cinema-news/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || "Failed to delete news");
    }
    return await res.json();
  } catch (err) {
    console.error("Error deleting cinema news");
  }
}


export const fetchCinemaNewsPaginated = async (
  baseURL,
  page = 1
) => {
  try {
    const res = await fetch(
      `${baseURL}/cinema-news/paginate?page=${page}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch paginated cinema news");
    }

    return await res.json(); 
    // { page, limit, total, items }
  } catch (err) {
    console.error("Error fetching paginated cinema news");
    return {
      page: 1,
      limit: 12,
      total: 0,
      items: [],
    };
  }
};

export const toggleAddToHomeCinemaNews = async (baseURL, id, value) => {
  const token = localStorage.getItem("access_token");
  const form = new FormData();
  form.append("add_to_home", value);

  const res = await fetch(`${baseURL}/admin/cinema-news/${id}/add_to_home`, {
    method: "PATCH",
    body: form,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to update add to home cinema news");
  }

  return res.json();
};



export const toggleIsSponsoredCinemaNews = async (baseURL, id, value) => {
  const token = localStorage.getItem("access_token");

  const form = new FormData();
  form.append("is_sponsored", value);

  const res = await fetch(`${baseURL}/admin/cinema-news/${id}/is_sponsored`, {
    method: "PATCH",
    body: form,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to update sponsored cinema news");
  }

  return res.json();
};


export const toggleShowViewCountCinemaNews = async (baseURL, id, value) => {
  const token = localStorage.getItem("access_token");

  const form = new FormData();
  form.append("show_view_count", value);

  const res = await fetch(
    `${baseURL}/admin/cinema-news/${id}/show_view_count`,
    {
      method: "PATCH",
      body: form,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to update show view count");
  }

  return res.json();
};



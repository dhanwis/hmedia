export async function fetchMoreNews(baseURL) {
  const res = await fetch(`${baseURL}/more-news/`);
  if (!res.ok) throw new Error("Failed to load More News");
  return await res.json();
}


export const fetchMoreNewsLimit = async (baseURL) => {
  try {
    const res = await fetch(`${baseURL}/more-news/limit`);
    if (!res.ok) throw new Error("Failed to fetch more news limit");
    return await res.json();
  } catch (err) {
    console.error("Error fetching trending more limit");
    return [];
  }
};

export async function addMoreNews(baseURL,data) {
   const token = localStorage.getItem("access_token");
  const res = await fetch(`${baseURL}/admin/more-news/`, {
    method: "POST",
    body: data,
     headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const out = await res.json();
  if (!res.ok) throw new Error(out.detail || "Failed to add more news");
  return out;
}

export async function updateMoreNews(baseURL,id, data) {
   const token = localStorage.getItem("access_token");
  const res = await fetch(`${baseURL}/admin/more-news/${id}`, {
    method: "PUT",
    body: data,
     headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const out = await res.json();
  if (!res.ok) throw new Error(out.detail || "Failed to update more news");
  return out;
}

export async function deleteMoreNews(baseURL,id) {
   const token = localStorage.getItem("access_token");
  const res = await fetch(`${baseURL}/admin/more-news/${id}`, {
    method: "DELETE",
     headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const out = await res.json();
    throw new Error(out.detail || "Failed to delete more news");
  }

  return true;
}



export const fetchMoreNewsPaginated = async (
  baseURL,
  page = 1
) => {
  try {
    const res = await fetch(
      `${baseURL}/more-news/paginate?page=${page}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch paginated more news");
    }

    return await res.json(); 
    // { page, limit, total, items }
  } catch (err) {
    console.error("Error fetching paginated more news");
    return {
      page: 1,
      limit: 12,
      total: 0,
      items: [],
    };
  }
};


export const toggleAddToHomeMoreNews = async (baseURL, id, value) => {
  const token = localStorage.getItem("access_token");
  const form = new FormData();
  form.append("add_to_home", value);

  const res = await fetch(`${baseURL}/admin/more-news/${id}/add_to_home`, {
    method: "PATCH",
    body: form,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to update add to home more news");
  }

  return res.json();
};


export const toggleIsSponsoredMoreNews = async (baseURL, id, value) => {
  const token = localStorage.getItem("access_token");

  const form = new FormData();
  form.append("is_sponsored", value);

  const res = await fetch(`${baseURL}/admin/more-news/${id}/is_sponsored`, {
    method: "PATCH",
    body: form,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to update sponsored more news");
  }

  return res.json();
};


export const toggleShowViewCountMoreNews = async (baseURL, id, value) => {
  const token = localStorage.getItem("access_token");

  const form = new FormData();
  form.append("show_view_count", value);

  const res = await fetch(
    `${baseURL}/admin/more-news/${id}/show_view_count`,
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



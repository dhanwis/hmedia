export const fetchLatestNews = async (baseURL) => {
  try {
    const res = await fetch(`${baseURL}/news/`);
    if (!res.ok) throw new Error("Failed to fetch latest news");
    
    return await res.json();
   
  } catch (err) {
    console.error("Error fetching latest news");
    return [];
  }
};



export const fetchLatestNewsLimit = async (baseURL) => {
  try {
    const res = await fetch(`${baseURL}/news/limit`);
    if (!res.ok) throw new Error("Failed to fetch latest news limit");
    return await res.json();
  } catch (err) {
    console.error("Error fetching latest news limit");
    return [];
  }
};

export const addLatestNews = async (baseURL, formData) => {
  const token = localStorage.getItem("access_token");
  try {
    const res = await fetch(`${baseURL}/admin/news`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || "Failed to add news");
    }
    return await res.json();
  } catch (err) {
    console.error("add latest news error");
    throw err;
  }
};

export const updateLatestNews = async (baseURL, newsId, formData) => {
  const token = localStorage.getItem("access_token");
  try {
    const res = await fetch(`${baseURL}/admin/news/${newsId}`, {
      method: "PUT",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || "Failed to update news");
    }
    return await res.json();
  } catch (err) {
    console.error("failed to update latest news");
    throw err;
  }
};

export const deleteLatestNews = async (baseURL, newsId) => {
  const token = localStorage.getItem("access_token");
  try {
    const res = await fetch(`${baseURL}/admin/news/${newsId}`, {
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
    console.error("failed to delete latest news");
    throw err;
  }
};

export const fetchLatestNewsPaginated = async (baseURL, page = 1) => {
  try {
    const res = await fetch(`${baseURL}/news/paginate?page=${page}`);

    if (!res.ok) {
      throw new Error("Failed to fetch paginated news");
    }

    return await res.json();
    // { page, limit, total, items }
  } catch (err) {
    console.error("Error fetching paginated news");
    return {
      page: 1,
      limit: 12,
      total: 0,
      items: [],
    };
  }
};

// export const fetchLatestNewsPaginated = async (baseURL, page = 1) => {
//   try {
//     const res = await fetch(`${baseURL}/news/paginate?page=${page}`);

//     if (!res.ok) {
//       throw new Error("Failed to fetch paginated news");
//     }

//     const data = await res.json();

//     console.log("Paginated News Response:", data); // 👈 add this

//     return data;
//   } catch (err) {
//     console.error("Error fetching paginated news:", err);

//     return {
//       page: 1,
//       limit: 12,
//       total: 0,
//       items: [],
//     };
//   }
// };
export const toggleAddToHomeLatestNews = async (baseURL, id, value) => {
  const token = localStorage.getItem("access_token");
  const form = new FormData();
  form.append("add_to_home", value);

  const res = await fetch(`${baseURL}/admin/news/${id}/add_to_home`, {
    method: "PATCH",
    body: form,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to update add to home latest news");
  }

  return res.json();
};

export const toggleIsSponsoredLatestNews = async (baseURL, id, value) => {
  const token = localStorage.getItem("access_token");

  const form = new FormData();
  form.append("is_sponsored", value);

  const res = await fetch(`${baseURL}/admin/news/${id}/is_sponsored`, {
    method: "PATCH",
    body: form,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to update sponsored latest news");
  }

  return res.json();
};



export const toggleShowViewCountLatestNews = async (baseURL, id, value) => {
  const token = localStorage.getItem("access_token");

  const form = new FormData();
  form.append("show_view_count", value);

  const res = await fetch(
    `${baseURL}/admin/news/${id}/show_view_count`,
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



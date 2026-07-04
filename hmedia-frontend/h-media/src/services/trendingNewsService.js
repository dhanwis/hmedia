export async function fetchTrendingNews(baseURL) {
  const res = await fetch(`${baseURL}/trending-news/`);
  if (!res.ok) throw new Error("Failed to load trending news");
  return await res.json();
}

export const fetchTrendingNewsLimit = async (baseURL) => {
  try {
    const res = await fetch(`${baseURL}/trending-news/limit`);
    if (!res.ok) throw new Error("Failed to fetch trending news limit");
    return await res.json();
  } catch (err) {
    console.error("Error fetching trending news limit");
    return [];
  }
};

export async function removeTrendingNews(baseURL, id) {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${baseURL}/admin/trending-news/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to remove trending news");
  return await res.json();
}

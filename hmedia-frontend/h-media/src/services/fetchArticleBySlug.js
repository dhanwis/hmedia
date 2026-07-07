export const fetchArticleBySlug = async (baseURL, category, slug) => {
  try {
    const endpoints = {
      "news": "news",
      "cinema-news": "cinema-news",
      "meet-person": "meet-person",
      "more-news": "more-news",
      "trending-news": "trending-news",
    };

    const endpoint = endpoints[category];
    if (!endpoint) return null;

    const res = await fetch(`${baseURL}/${endpoint}/api/${slug}`);

    if (!res.ok) throw new Error("Failed to fetch article");

    return await res.json();
  } catch (err) {
    console.error("Error fetching article by slug");
    return null;
  }
};




export const checkImageExists = async (
  baseURL,
  filename,
  category
) => {
  try {
    const token = localStorage.getItem("access_token");

    const res = await fetch(
      `${baseURL}/admin/check-image-exists?filename=${encodeURIComponent(
        filename
      )}&category=${category}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to check image");
    }

    return await res.json();
  } catch (err) {
    console.error("Error checking image existence", err);
    return null;
  }
};



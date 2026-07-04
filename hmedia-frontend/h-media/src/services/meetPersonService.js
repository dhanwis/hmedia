export async function fetchMeetPersons(baseURL) {
  const res = await fetch(`${baseURL}/meet-person/`);
  if (!res.ok) throw new Error("Failed to load Meet The Person data");
  return await res.json();
}

export const fetchMeetPersonsLimit = async (baseURL) => {
  try {
    const res = await fetch(`${baseURL}/meet-person/limit`);
    if (!res.ok) throw new Error("Failed to load Meet The Person data limit");
    return await res.json();
  } catch (err) {
    console.error("Failed to load Meet The Person data limit");
    return [];
  }
};

export async function addMeetPerson(baseURL,formData) {
   const token = localStorage.getItem("access_token");
  const res = await fetch(`${baseURL}/admin/meet-person/`, {
    method: "POST",
    body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
  });

  const out = await res.json();
  if (!res.ok) throw new Error(out.detail || "Failed to add person");
  return out;
}

export async function updateMeetPerson(baseURL,id, formData) {
   const token = localStorage.getItem("access_token");
  const res = await fetch(`${baseURL}/admin/meet-person/${id}`, {
    method: "PUT",
    body: formData,
     headers: {
        Authorization: `Bearer ${token}`,
      },
  });

  const out = await res.json();
  if (!res.ok) throw new Error(out.detail || "Failed to update person");
  return out;
}

export async function deleteMeetPerson(baseURL,id) {
   const token = localStorage.getItem("access_token");
  const res = await fetch(`${baseURL}/admin/meet-person/${id}`, {
    method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
  });

  if (!res.ok) {
    const out = await res.json();
    throw new Error(out.detail || "Failed to delete person");
  }

  return true;
}


export const fetchMeetPersonPaginated = async (
  baseURL,
  page = 1
) => {
  try {
    const res = await fetch(
      `${baseURL}/meet-person/paginate?page=${page}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch paginated meet persons");
    }

    return await res.json(); 
    // { page, limit, total, items }
  } catch (err) {
    console.error("Error fetching paginated meet persons");
    return {
      page: 1,
      limit: 12,
      total: 0,
      items: [],
    };
  }
};

export const toggleAddToHomeMeetThePerson = async (baseURL, id, value) => {
  const token = localStorage.getItem("access_token");
  const form = new FormData();
  form.append("add_to_home", value);

  const res = await fetch(`${baseURL}/admin/meet-person/${id}/add_to_home`, {
    method: "PATCH",
    body: form,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to update add to home meet the person");
  }

  return res.json();
};

export const toggleIsSponsoredMeetThePerson = async (baseURL, id, value) => {
  const token = localStorage.getItem("access_token");

  const form = new FormData();
  form.append("is_sponsored", value);

  const res = await fetch(`${baseURL}/admin/meet-person/${id}/is_sponsored`, {
    method: "PATCH",
    body: form,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to update sponsored meet the person");
  }

  return res.json();
};



export const toggleShowViewCountMeetThePerson = async (baseURL, id, value) => {
  const token = localStorage.getItem("access_token");

  const form = new FormData();
  form.append("show_view_count", value);

  const res = await fetch(
    // `${baseURL}/admin/meet-person/${id}/show_view_count`,
    `${baseURL}/admin/meet-person/${id}/show_view_count`,
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



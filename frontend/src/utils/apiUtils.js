export const buildFormData = (payload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    formData.append(key, value);
  });

  return formData;
};

export const multipartConfig = {
  headers: { "Content-Type": "multipart/form-data" },
};

export const getApiErrorMessage = (error, fallback = "Помилка мережі.") => {
  const data = error?.response?.data;
  if (!data) {
    return error?.message || fallback;
  }

  if (typeof data === "string") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.join(" ");
  }

  if (typeof data === "object") {
    return Object.values(data)
      .flat()
      .filter(Boolean)
      .join(" ") || fallback;
  }

  return fallback;
};

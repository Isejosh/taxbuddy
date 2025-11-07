const BASE_URL = "http://localhost:5000/api";

async function apiRequest(endpoint, method = "GET", body = null, auth = false) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = localStorage.getItem("authToken");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API request error:", error);
    return { success: false, message: "Server connection failed" };
  }
}

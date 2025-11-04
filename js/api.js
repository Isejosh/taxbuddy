const BASE_URL = "http://localhost:5000/api";

// 🔐 Save token after login
function saveToken(token) {
  localStorage.setItem("authToken", token);
}

// 🔐 Get token for protected routes
function getToken() {
  return localStorage.getItem("authToken");
}

// 🧾 Generalized API request helper
async function apiRequest(endpoint, method = "GET", data = null, auth = false) {
  const headers = { "Content-Type": "application/json" };
  if (auth) headers["Authorization"] = `Bearer ${getToken()}`;

  const options = {
    method,
    headers,
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const result = await res.json();
  return result;
}

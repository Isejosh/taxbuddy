const BASE_URL = "https://tax-tracker-backend.onrender.com/api";

/**
 * Generic API request handler
 * @param {string} endpoint - API endpoint (e.g., "/auth/sign_in")
 * @param {string} method - HTTP method (GET, POST, PUT, PATCH, DELETE)
 * @param {object} body - Request body (optional)
 * @param {boolean} auth - Whether to include auth token
 * @returns {Promise<object>} API response
 */
async function apiRequest(endpoint, method = "GET", body = null, auth = false) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = localStorage.getItem("authToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const options = { method, headers };

  if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
    options.body = JSON.stringify(body);
  }

  console.log(`🌐 API Request: ${method} ${BASE_URL}${endpoint}`);
  console.log("📦 Request body:", body);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);

    console.log(`📊 Response status: ${response.status} ${response.statusText}`);

    let data;
    try {
      data = await response.json();
      console.log("📥 Response data:", data);
    } catch (parseError) {
      console.error("❌ Failed to parse JSON response:", parseError);
      const text = await response.text();
      console.log("📄 Raw response:", text);
      return { success: false, message: "Invalid server response format." };
    }

    if (!data.success && response.status === 401) {
      console.warn("⚠️ Session expired (401)");
      localStorage.clear();
      window.location.href = "login.html";
      return { success: false, message: "Session expired. Please login again." };
    }

    if (!response.ok && !data.success) {
      console.error(`❌ Server error: ${response.status}`, data);
    }

    return data;
  } catch (error) {
    console.error("❌ API request failed:", error);
    console.error("Error details:", { name: error.name, message: error.message, stack: error.stack });
    return { success: false, message: "Network error. Please check your connection.", error: error.message };
  }
}

// Helper functions for localStorage
function getUserId() {
  const user = localStorage.getItem("user");
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.id || userData._id || userData.userId;
    } catch (e) {
      console.error("Error parsing user data:", e);
    }
  }
  return localStorage.getItem("userId");
}

function getAuthToken() {
  return localStorage.getItem("authToken") || localStorage.getItem("token");
}

function getUserType() {
  const user = localStorage.getItem("user");
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.accountType || userData.account_type || userData.role || "individual";
    } catch (e) {
      console.error("Error parsing user data:", e);
    }
  }
  return localStorage.getItem("accountType") || "individual";
}

function setUserData(userData, token) {
  // Normalize keys to ensure consistency
  const normalizedData = {
    ...userData,
    id: userData.id || userData._id || userData.userId,
    accountType: userData.accountType || userData.account_type || "individual",
    name: userData.fullname || userData.name || "User",
  };

  localStorage.setItem("user", JSON.stringify(normalizedData));
  localStorage.setItem("userId", normalizedData.id);
  localStorage.setItem("authToken", token);
  localStorage.setItem("token", token);
  localStorage.setItem("accountType", normalizedData.accountType);
  localStorage.setItem("userName", normalizedData.name);
}

function clearUserData() {
  localStorage.removeItem("user");
  localStorage.removeItem("userId");
  localStorage.removeItem("authToken");
  localStorage.removeItem("token");
  localStorage.removeItem("accountType");
  localStorage.removeItem("userName");
  localStorage.removeItem("email");
}

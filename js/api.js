// api.js - Fixed API Integration
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

  const options = { 
    method, 
    headers 
  };
  
  if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    // Handle token expiration
    if (!data.success && response.status === 401) {
      localStorage.clear();
      window.location.href = "login.html";
      return { success: false, message: "Session expired. Please login again." };
    }
    
    return data;
  } catch (error) {
    console.error("API request error:", error);
    return { 
      success: false, 
      message: "Network error. Please check your connection." 
    };
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
      return userData.accountType || userData.role || "individual";
    } catch (e) {
      console.error("Error parsing user data:", e);
    }
  }
  return localStorage.getItem("accountType") || "individual";
}

function setUserData(userData, token) {
  localStorage.setItem("user", JSON.stringify(userData));
  localStorage.setItem("userId", userData.id || userData._id);
  localStorage.setItem("authToken", token);
  localStorage.setItem("token", token);
  localStorage.setItem("accountType", userData.accountType || "individual");
  localStorage.setItem("userName", userData.name || "User");
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
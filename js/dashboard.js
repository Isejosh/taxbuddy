const BASE_URL = "https://tax-tracker-backend.onrender.com/api";

// Generic API helper
async function apiRequest(endpoint, method = "GET", body = null, authRequired = false) {
  const headers = { "Content-Type": "application/json" };

  if (authRequired) {
    const token = getAuthToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  return response.json();
}

// LocalStorage helpers
function getUserId() {
  // Try getting from stored user object first
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

function getUserName() {
  // Try getting from stored user object first
  const user = localStorage.getItem("user");
  if (user) {
    try {
      const userData = JSON.parse(user);
      const name = userData.fullname || userData.fullName || userData.name || userData.username;
      if (name) return name;
    } catch (e) {
      console.error("Error parsing user data:", e);
    }
  }
  
  // Fallback to userName in localStorage
  return localStorage.getItem("userName") || "User";
}

function getUserType() {
  // Try getting from stored user object first
  const user = localStorage.getItem("user");
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.accountType || userData.account_type || "individual";
    } catch (e) {
      console.error("Error parsing user data:", e);
    }
  }
  
  return localStorage.getItem("accountType") || "individual";
}

// Update user info in header
function updateUserInfo() {
  const userName = getUserName();
  const userType = getUserType();

  console.log("📊 Dashboard user info:", { userName, userType });

  const userNameElement = document.querySelector(".user-info h2");
  const userTypeElement = document.querySelector(".user-info span");

  if (userNameElement) {
    userNameElement.textContent = userName;
    console.log("✅ Updated user name display");
  } else {
    console.warn("⚠️ User name element not found");
  }

  if (userTypeElement) {
    userTypeElement.textContent = `${userType} account`;
    console.log("✅ Updated account type display");
  } else {
    console.warn("⚠️ Account type element not found");
  }
}

// Fetch income/expense summary
async function fetchIncomeExpenseSummary() {
  try {
    const userId = getUserId();
    if (!userId) {
      console.error("❌ No user ID found");
      return;
    }

    console.log("📤 Fetching income/expense summary for user:", userId);

    const data = await apiRequest(`/income-expense/${userId}/summary`, "GET", null, true);

    console.log("📥 Income/expense response:", data);

    if (data.success) {
      updateIncomeData(data.data);
    } else {
      console.error("❌ Failed to fetch income summary:", data.message);
    }
  } catch (error) {
    console.error("❌ Error fetching income summary:", error);
  }
}

// Update income data
function updateIncomeData(incomeData) {
  const totalIncome = incomeData?.totalIncome || 0;
  const incomeElement = document.querySelector(".tax-income h1");
  
  if (incomeElement) {
    incomeElement.textContent = `₦${totalIncome.toLocaleString()}`;
    console.log("✅ Updated income display:", totalIncome);
  } else {
    console.warn("⚠️ Income element not found");
  }
}

// Handle date filters
function setupDateFilters() {
  const monthSelect = document.querySelector('select[name="month"]');
  const yearSelect = document.querySelector('select[name="year"]');

  if (monthSelect) {
    monthSelect.addEventListener("change", refreshDashboardData);
    console.log("✅ Month filter setup");
  }
  
  if (yearSelect) {
    yearSelect.addEventListener("change", refreshDashboardData);
    console.log("✅ Year filter setup");
  }
}

function refreshDashboardData() {
  console.log("🔄 Refreshing dashboard data...");
  fetchIncomeExpenseSummary();
}

function initializeDashboard() {
  console.log("🚀 Initializing dashboard...");
  
  const token = getAuthToken();
  const userId = getUserId();

  console.log("🔐 Auth check:", { hasToken: !!token, userId });

  if (!token || !userId) {
    console.warn("⚠️ User not authenticated, redirecting to login...");
    alert("⚠️ Please login first");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
    return;
  }

  // Update user info first
  updateUserInfo();

  // Then load dashboard data
  loadDashboardData();
}

function loadDashboardData() {
  console.log("📊 Loading dashboard data...");
  fetchIncomeExpenseSummary();
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("📄 Dashboard loaded");
  initializeDashboard();
  setupDateFilters();
});

// Auto-refresh every minute
setInterval(() => {
  const token = getAuthToken();
  if (token) {
    console.log("🔄 Auto-refreshing data...");
    fetchIncomeExpenseSummary();
  }
}, 60000);
// dashboard.js - Complete with Tax Summary
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
  return localStorage.getItem("userName") || "User";
}

function getUserType() {
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

  // Update ALL h2 elements inside user-info
  const userNameElements = document.querySelectorAll(".user-info h2");
  const userTypeElement = document.querySelector(".user-info span");

  // Set name for all h2 elements (mobile and desktop)
  userNameElements.forEach(el => {
    el.textContent = userName;
  });
  
  if (userNameElements.length > 0) {
    console.log("✅ Updated user name display:", userName);
  } else {
    console.warn("⚠️ User name element not found");
  }

  if (userTypeElement) {
    // Capitalize first letter
    const displayType = userType.charAt(0).toUpperCase() + userType.slice(1);
    userTypeElement.textContent = `${displayType} account`;
    console.log("✅ Updated account type display:", displayType);
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
      console.warn("⚠️ Income/Expense API not available yet");
      updateIncomeData({ totalIncome: 0 });
    }
  } catch (error) {
    console.warn("⚠️ Income/Expense API not ready:", error.message);
    updateIncomeData({ totalIncome: 0 });
  }
}

// Fetch tax summary
async function fetchTaxSummary() {
  try {
    const userId = getUserId();
    if (!userId) {
      console.error("❌ No user ID found");
      return;
    }

    console.log("📤 Fetching tax summary for user:", userId);

    const data = await apiRequest(`/tax/summary/${userId}`, "GET", null, true);

    console.log("📥 Tax summary response:", data);

    if (data.success && data.data) {
      updateTaxData(data.data);
    } else {
      console.warn("⚠️ No tax data available yet");
      updateTaxData({
        totalPayable: 0,
        totalPaid: 0,
        totalUnpaid: 0,
        paidPercentage: 0,
        unpaidPercentage: 0
      });
    }
  } catch (error) {
    console.warn("⚠️ Tax API error:", error.message);
    updateTaxData({
      totalPayable: 0,
      totalPaid: 0,
      totalUnpaid: 0,
      paidPercentage: 0,
      unpaidPercentage: 0
    });
  }
}

// Update income data
function updateIncomeData(incomeData) {
  const totalIncome = incomeData?.totalIncome || 0;
  const incomeElement = document.querySelector(".tax-income h1");
  
  if (incomeElement) {
    incomeElement.textContent = `₦${totalIncome.toLocaleString()}`;
    console.log("✅ Updated income display:", totalIncome);
  }
}

// Update tax data on dashboard
function updateTaxData(taxData) {
  console.log("📊 Updating tax data:", taxData);

  // Update Total Payable
  const payableElement = document.querySelector(".tax-payable h1");
  if (payableElement) {
    payableElement.textContent = `₦${(taxData.totalPayable || 0).toLocaleString()}`;
  }

  // Update Unpaid
  const unpaidElement = document.querySelector(".tax-unpaid h1");
  if (unpaidElement) {
    unpaidElement.textContent = `₦${(taxData.totalUnpaid || 0).toLocaleString()}`;
  }

  // Update Paid
  const paidElement = document.querySelector(".tax-paid h1");
  if (paidElement) {
    paidElement.textContent = `₦${(taxData.totalPaid || 0).toLocaleString()}`;
  }

  // Update progress bars
  const paidBar = document.getElementById("paid-bar");
  const unpaidBar = document.getElementById("unpaid-bar");
  const paidPercent = document.getElementById("paid-percent");
  const unpaidPercent = document.getElementById("unpaid-percent");

  if (paidBar) paidBar.style.width = `${taxData.paidPercentage || 0}%`;
  if (unpaidBar) unpaidBar.style.width = `${taxData.unpaidPercentage || 0}%`;
  if (paidPercent) paidPercent.textContent = `${Math.round(taxData.paidPercentage || 0)}%`;
  if (unpaidPercent) unpaidPercent.textContent = `${Math.round(taxData.unpaidPercentage || 0)}%`;

  console.log("✅ Updated tax dashboard");
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
  fetchTaxSummary();
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

  updateUserInfo();
  loadDashboardData();
}

function loadDashboardData() {
  console.log("📊 Loading dashboard data...");
  fetchIncomeExpenseSummary();
  fetchTaxSummary();
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
    fetchTaxSummary();
  }
}, 60000);
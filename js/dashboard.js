// dashboard.js - SUPER SIMPLE VERSION THAT WORKS
const BASE_URL = "https://tax-tracker-backend.onrender.com/api";

// SIMPLE: Just get the name
function getUserName() {
  // Try localStorage first
  let name = localStorage.getItem("userName");
  if (name && name !== "User") {
    console.log("✅ Got name from localStorage:", name);
    return name;
  }
  
  // Try user object
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      name = user.fullname || user.fullName || user.name || user.username;
      if (name) {
        console.log("✅ Got name from user object:", name);
        localStorage.setItem("userName", name); // Save it
        return name;
      }
    }
  } catch (e) {
    console.error("Error:", e);
  }
  
  return "User";
}

function getUserType() {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.accountType || user.account_type || "individual";
    }
  } catch (e) {}
  return localStorage.getItem("accountType") || "individual";
}

function getUserId() {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id || user._id || user.userId;
    }
  } catch (e) {}
  return localStorage.getItem("userId");
}

function getAuthToken() {
  return localStorage.getItem("authToken") || localStorage.getItem("token");
}

// UPDATE USER INFO - SUPER SIMPLE
function updateUserInfo() {
  const name = getUserName();
  const type = getUserType();
  
  console.log("🔍 Updating dashboard with:", { name, type });
  
  // Find ALL h2 elements and update them
  const h2Elements = document.querySelectorAll(".user-info h2");
  console.log("📍 Found", h2Elements.length, "h2 elements");
  
  h2Elements.forEach((h2, index) => {
    h2.textContent = name;
    console.log(`✅ Updated h2 #${index + 1} to:`, name);
  });
  
  // Update account type
  const typeElement = document.querySelector(".user-info span");
  if (typeElement) {
    typeElement.textContent = type.charAt(0).toUpperCase() + type.slice(1) + " account";
    console.log("✅ Updated account type to:", type);
  }
}

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

// Fetch tax summary
async function fetchTaxSummary() {
  try {
    const userId = getUserId();
    if (!userId) return;
    
    const data = await apiRequest(`/tax/summary/${userId}`, "GET", null, true);
    
    if (data.success && data.data) {
      updateTaxData(data.data);
    } else {
      updateTaxData({ totalPayable: 0, totalPaid: 0, totalUnpaid: 0, paidPercentage: 0, unpaidPercentage: 0 });
    }
  } catch (error) {
    console.warn("Tax API error:", error);
    updateTaxData({ totalPayable: 0, totalPaid: 0, totalUnpaid: 0, paidPercentage: 0, unpaidPercentage: 0 });
  }
}

// Update tax data
function updateTaxData(taxData) {
  const payable = document.querySelector(".tax-payable h1");
  const unpaid = document.querySelector(".tax-unpaid h1");
  const paid = document.querySelector(".tax-paid h1");
  const income = document.querySelector(".tax-income h1");
  
  if (payable) payable.textContent = `₦${(taxData.totalPayable || 0).toLocaleString()}`;
  if (unpaid) unpaid.textContent = `₦${(taxData.totalUnpaid || 0).toLocaleString()}`;
  if (paid) paid.textContent = `₦${(taxData.totalPaid || 0).toLocaleString()}`;
  if (income) income.textContent = `₦0`;
  
  const paidBar = document.getElementById("paid-bar");
  const unpaidBar = document.getElementById("unpaid-bar");
  const paidPercent = document.getElementById("paid-percent");
  const unpaidPercent = document.getElementById("unpaid-percent");
  
  if (paidBar) paidBar.style.width = `${taxData.paidPercentage || 0}%`;
  if (unpaidBar) unpaidBar.style.width = `${taxData.unpaidPercentage || 0}%`;
  if (paidPercent) paidPercent.textContent = `${Math.round(taxData.paidPercentage || 0)}%`;
  if (unpaidPercent) unpaidPercent.textContent = `${Math.round(taxData.unpaidPercentage || 0)}%`;
}

// Setup filters
function setupDateFilters() {
  const monthSelect = document.querySelector('select[name="month"]');
  const yearSelect = document.querySelector('select[name="year"]');
  
  if (monthSelect) monthSelect.addEventListener("change", fetchTaxSummary);
  if (yearSelect) yearSelect.addEventListener("change", fetchTaxSummary);
}

// Initialize
function initializeDashboard() {
  const token = getAuthToken();
  const userId = getUserId();
  
  console.log("🚀 Dashboard initializing...");
  console.log("Auth:", { hasToken: !!token, userId });
  
  if (!token || !userId) {
    alert("⚠️ Please login first");
    setTimeout(() => window.location.href = "login.html", 1000);
    return;
  }
  
  updateUserInfo();
  fetchTaxSummary();
}

// Start when page loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("📄 Dashboard page loaded");
  initializeDashboard();
  setupDateFilters();
});
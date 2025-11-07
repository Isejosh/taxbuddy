// dashboard.js

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
  return localStorage.getItem("userId");
}

function getAuthToken() {
  return localStorage.getItem("token");
}

function getUserName() {
  return localStorage.getItem("userName") || "User";
}

function getUserType() {
  return localStorage.getItem("accountType") || "individual";
}

// Update user info in header
function updateUserInfo() {
  const userName = getUserName();
  const userType = getUserType();

  const userNameElement = document.querySelector(".user-info h2");
  const userTypeElement = document.querySelector(".user-info span");

  if (userNameElement) userNameElement.textContent = userName;
  if (userTypeElement) userTypeElement.textContent = `${userType} account`;
}

// Fetch income/expense summary
async function fetchIncomeExpenseSummary() {
  try {
    const userId = getUserId();
    if (!userId) return;

    const data = await apiRequest(`/income-expense/${userId}/summary`, "GET", null, true);

    if (data.success) {
      updateIncomeData(data.data);
    } else {
      console.error("Failed to fetch income summary:", data.message);
    }
  } catch (error) {
    console.error("Error fetching income summary:", error);
  }
}

// Update income data
function updateIncomeData(incomeData) {
  const totalIncome = incomeData?.totalIncome || 0;
  const incomeElement = document.querySelector(".tax-income h1");
  if (incomeElement) incomeElement.textContent = `₦${totalIncome.toLocaleString()}`;
}

// Handle date filters
function setupDateFilters() {
  const monthSelect = document.querySelector('select[name="month"]');
  const yearSelect = document.querySelector('select[name="year"]');

  if (monthSelect) monthSelect.addEventListener("change", refreshDashboardData);
  if (yearSelect) yearSelect.addEventListener("change", refreshDashboardData);
}

function refreshDashboardData() {
  fetchIncomeExpenseSummary();
}

function initializeDashboard() {
  updateUserInfo();

  const token = getAuthToken();
  const userId = getUserId();

  if (!token || !userId) {
    console.warn("User not authenticated");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
    return;
  }

  loadDashboardData();
}

function loadDashboardData() {
  fetchIncomeExpenseSummary();
}

document.addEventListener("DOMContentLoaded", () => {
  initializeDashboard();
  setupDateFilters();
});

// Auto-refresh every minute
setInterval(() => {
  const token = getAuthToken();
  if (token) fetchIncomeExpenseSummary();
}, 60000);

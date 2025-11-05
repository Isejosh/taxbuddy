// dashboard.js - Using your existing apiRequest function

// Get user data from localStorage
function getUserId() {
  const user = localStorage.getItem("user");
  if (user) {
    const userData = JSON.parse(user);
    return userData.id || userData._id;
  }
  return localStorage.getItem("userId");
}

function getAuthToken() {
  return localStorage.getItem("authToken");
}

function getUserName() {
  const user = localStorage.getItem("user");
  if (user) {
    const userData = JSON.parse(user);
    return userData.name || userData.fullName || userData.email || "User";
  }
  return localStorage.getItem("userName") || "User";
}

function getUserType() {
  const user = localStorage.getItem("user");
  if (user) {
    const userData = JSON.parse(user);
    return userData.accountType || userData.role || "individual";
  }
  return localStorage.getItem("userType") || "individual";
}

// Update user info in header
function updateUserInfo() {
  const userName = getUserName();
  const userType = getUserType();

  const userNameElement = document.querySelector(".user-info h2");
  const userTypeElement = document.querySelector(".user-info span");

  if (userNameElement) {
    userNameElement.textContent = userName;
  }
  if (userTypeElement) {
    userTypeElement.textContent = `${userType} account`;
  }
}

// Fetch tax summary and update dashboard
async function fetchTaxSummary() {
  try {
    const userId = getUserId();

    if (!userId) {
      console.warn("User ID not found");
      return;
    }

    const data = await apiRequest(`/tax/summary/${userId}`, "GET", null, true);

    if (data.success) {
      updateTaxDashboard(data.data);
    } else {
      console.error("Failed to fetch tax summary:", data.message);
    }
  } catch (error) {
    console.error("Error fetching tax summary:", error);
  }
}

// Fetch income/expense summary
async function fetchIncomeExpenseSummary() {
  try {
    const userId = getUserId();

    if (!userId) {
      return;
    }

    const data = await apiRequest(
      `/income-expense/${userId}/summary`,
      "GET",
      null,
      true
    );

    if (data.success) {
      updateIncomeData(data.data);
    } else {
      console.error("Failed to fetch income summary:", data.message);
    }
  } catch (error) {
    console.error("Error fetching income summary:", error);
  }
}

// Update tax dashboard with data
function updateTaxDashboard(taxData) {
  let totalPaid = 0;
  let totalPending = 0;
  let totalTax = 0;

  // Calculate totals from tax summary
  if (taxData && taxData.length > 0) {
    taxData.forEach((taxType) => {
      totalPaid += taxType.paidTax || 0;
      totalPending += taxType.pendingTax || 0;
      totalTax += taxType.totalTax || 0;
    });
  }

  // Update the tax ledger cards
  const payableElement = document.querySelector(".tax-payable h1");
  const unpaidElement = document.querySelector(".tax-unpaid h1");
  const paidElement = document.querySelector(".tax-paid h1");

  if (payableElement)
    payableElement.textContent = `₦${totalTax.toLocaleString()}`;
  if (unpaidElement)
    unpaidElement.textContent = `₦${totalPending.toLocaleString()}`;
  if (paidElement) paidElement.textContent = `₦${totalPaid.toLocaleString()}`;

  // Update progress bars and percentages
  updateProgressBars(totalPaid, totalPending, totalTax);
}

// Update income data
function updateIncomeData(incomeData) {
  const totalIncome = incomeData?.totalIncome || 0;
  const incomeElement = document.querySelector(".tax-income h1");
  if (incomeElement) {
    incomeElement.textContent = `₦${totalIncome.toLocaleString()}`;
  }
}

// Update progress bars for tax status
function updateProgressBars(paid, unpaid, total) {
  const paidPercent = total > 0 ? Math.round((paid / total) * 100) : 0;
  const unpaidPercent = total > 0 ? Math.round((unpaid / total) * 100) : 0;

  // Update percentages
  const paidPercentElement = document.getElementById("paid-percent");
  const unpaidPercentElement = document.getElementById("unpaid-percent");

  if (paidPercentElement) paidPercentElement.textContent = `${paidPercent}%`;
  if (unpaidPercentElement)
    unpaidPercentElement.textContent = `${unpaidPercent}%`;

  // Update progress bars
  const paidBar = document.getElementById("paid-bar");
  const unpaidBar = document.getElementById("unpaid-bar");

  if (paidBar) paidBar.style.width = `${paidPercent}%`;
  if (unpaidBar) unpaidBar.style.width = `${unpaidPercent}%`;
}

// Handle date filter changes
function setupDateFilters() {
  const monthSelect = document.querySelector('select[name="month"]');
  const yearSelect = document.querySelector('select[name="year"]');

  if (monthSelect) {
    monthSelect.addEventListener("change", refreshDashboardData);
  }

  if (yearSelect) {
    yearSelect.addEventListener("change", refreshDashboardData);
  }
}

// Refresh dashboard data based on filters
function refreshDashboardData() {
  fetchTaxSummary();
  fetchIncomeExpenseSummary();
}

// Check authentication and load data
function initializeDashboard() {
  updateUserInfo();

  const token = getAuthToken();
  const userId = getUserId();

  if (!token || !userId) {
    console.warn("User not authenticated");
    // Optional: redirect to login after a delay
    setTimeout(() => {
      if (!getAuthToken()) {
        // window.location.href = 'individual-login.html';
      }
    }, 2000);
    return;
  }

  // Load dashboard data
  loadDashboardData();
}

// Load all dashboard data
function loadDashboardData() {
  fetchTaxSummary();
  fetchIncomeExpenseSummary();
}

// Initialize dashboard when page loads
document.addEventListener("DOMContentLoaded", function () {
  initializeDashboard();
  setupDateFilters();
});

// Set up periodic refresh (every 60 seconds)
setInterval(() => {
  const token = getAuthToken();
  if (token) {
    fetchTaxSummary();
    fetchIncomeExpenseSummary();
  }
}, 60000);

// Utility function to format currency
function formatCurrency(amount) {
  return `₦${amount?.toLocaleString() || "0"}`;
}

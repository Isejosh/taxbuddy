// dashboard.js - FIXED to show user name by force!
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

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    return response.json();
  } catch (error) {
    console.error("❌ API Request failed:", error);
    return { success: false, message: error.message };
  }
}

// LocalStorage helpers - IMPROVED
function getUserId() {
  // Try multiple possible storage locations
  const user = localStorage.getItem("user");
  const userId = localStorage.getItem("userId");
  
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log("🔍 User data from localStorage:", userData);
      return userData.id || userData._id || userData.userId || userId;
    } catch (e) {
      console.error("Error parsing user data:", e);
    }
  }
  
  return userId || "unknown";
}

function getAuthToken() {
  return localStorage.getItem("authToken") || localStorage.getItem("token");
}

function getUserName() {
  console.log("🔍 Searching for user name in localStorage...");
  
  // Check ALL possible locations for the name
  const user = localStorage.getItem("user");
  const storedName = localStorage.getItem("userName");
  
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log("📋 User data found:", userData);
      
      // Try EVERY possible name field
      const name = userData.fullname || 
                   userData.fullName || 
                   userData.name || 
                   userData.username ||
                   userData.firstName ||
                   `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
      
      if (name) {
        console.log("✅ Name found in user data:", name);
        return name;
      }
    } catch (e) {
      console.error("Error parsing user data:", e);
    }
  }
  
  if (storedName) {
    console.log("✅ Name found in userName storage:", storedName);
    return storedName;
  }
  
  console.log("❌ No name found, using fallback");
  return "Taxpayer"; // Fallback name
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

// Update user info in header - FORCEFULLY!
function updateUserInfo() {
  console.log("🔄 FORCE UPDATING USER INFO...");
  
  const userName = getUserName();
  const userType = getUserType();

  console.log("📊 Dashboard user info:", { 
    userName, 
    userType,
    localStorage: {
      user: localStorage.getItem("user"),
      userName: localStorage.getItem("userName"),
      userId: localStorage.getItem("userId"),
      authToken: localStorage.getItem("authToken") ? "PRESENT" : "MISSING"
    }
  });

  // Target ALL possible name display elements
  const userNameElements = document.querySelectorAll(".user-info h2, .user-info h1, .user-info .desktop, .user-info .mobile");
  const userTypeElement = document.querySelector(".user-info span");
  const welcomeText = document.querySelector(".user-info p");

  console.log(`🎯 Found ${userNameElements.length} name elements to update`);

  // Update all name elements
  userNameElements.forEach((element, index) => {
    console.log(`✅ Updating name element ${index + 1}:`, element);
    element.textContent = userName;
    element.style.color = "#2D6A4F"; // Force visible color
    element.style.fontWeight = "bold";
  });

  // Update account type
  if (userTypeElement) {
    userTypeElement.textContent = `${userType.charAt(0).toUpperCase() + userType.slice(1)} Account`;
    userTypeElement.style.color = "#666";
    console.log("✅ Updated account type:", userType);
  }

  // Update welcome text if needed
  if (welcomeText && welcomeText.textContent === "Welcome,") {
    welcomeText.textContent = "Welcome back,";
    console.log("✅ Updated welcome text");
  }

  // LAST RESORT: If no elements found, create one!
  if (userNameElements.length === 0) {
    console.log("⚠️ No name elements found, creating one...");
    const userInfoDiv = document.querySelector(".user-info");
    if (userInfoDiv) {
      const forcedName = document.createElement("h2");
      forcedName.textContent = userName;
      forcedName.style.color = "#2D6A4F";
      forcedName.style.fontSize = "24px";
      forcedName.style.margin = "0";
      userInfoDiv.appendChild(forcedName);
      console.log("🚨 FORCED name display creation!");
    }
  }

  console.log("🎉 USER NAME UPDATE COMPLETE!");
}

// Fetch user profile data as backup
async function fetchUserProfile() {
  try {
    const userId = getUserId();
    const token = getAuthToken();
    
    console.log("📤 Fetching user profile for:", userId);
    
    if (!token) {
      console.warn("❌ No auth token available");
      return;
    }

    const userType = getUserType();
    const endpoint = userType === 'business' 
      ? `/auth/business/profile` 
      : `/auth/individual/profile`;

    console.log("🔗 Using endpoint:", endpoint);

    const data = await apiRequest(endpoint, "GET", null, true);
    
    console.log("📥 Profile response:", data);

    if (data.success && data.user) {
      // Update localStorage with fresh user data
      localStorage.setItem("user", JSON.stringify(data.user));
      
      const name = data.user.fullname || data.user.fullName || data.user.name || data.user.username;
      if (name) {
        localStorage.setItem("userName", name);
        console.log("✅ Updated user data from profile API:", name);
      }
      
      // Force update display
      updateUserInfo();
    }
  } catch (error) {
    console.warn("⚠️ Profile API not available:", error.message);
  }
}

// Fetch tax summary
async function fetchTaxSummary() {
  try {
    const userId = getUserId();
    if (!userId || userId === "unknown") {
      console.error("❌ No valid user ID found");
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
  }
  
  if (yearSelect) {
    yearSelect.addEventListener("change", refreshDashboardData);
  }
}

function refreshDashboardData() {
  console.log("🔄 Refreshing dashboard data...");
  fetchTaxSummary();
}

// MAIN INITIALIZATION - AGGRESSIVE!
function initializeDashboard() {
  console.log("🚀 FORCE INITIALIZING DASHBOARD...");
  
  const token = getAuthToken();
  const userId = getUserId();

  console.log("🔐 Auth check:", { 
    hasToken: !!token, 
    userId,
    tokenLength: token ? token.length : 0
  });

  if (!token) {
    console.warn("⚠️ No auth token found, redirecting to login...");
    alert("⚠️ Please login first");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
    return;
  }

  // IMMEDIATE name display
  updateUserInfo();
  
  // Try to fetch profile as backup
  setTimeout(fetchUserProfile, 500);
  
  // Load other data
  setTimeout(loadDashboardData, 1000);
  
  // EXTRA: Force update again after a delay to catch any rendering issues
  setTimeout(updateUserInfo, 2000);
}

function loadDashboardData() {
  console.log("📊 Loading dashboard data...");
  fetchTaxSummary();
}

// DOM Ready - MULTIPLE ATTEMPTS!
document.addEventListener("DOMContentLoaded", () => {
  console.log("📄 Dashboard DOM loaded - STARTING FORCE DISPLAY!");
  
  // First attempt
  initializeDashboard();
  setupDateFilters();
  
  // Second attempt after short delay (in case of slow rendering)
  setTimeout(initializeDashboard, 100);
  
  // Third attempt after elements should be fully rendered
  setTimeout(initializeDashboard, 500);
});

// DEBUG: Add a manual refresh button in console
console.log("🔧 Debug: Type 'forceName()' in console to manually refresh user name");
window.forceName = function() {
  console.log("🔄 MANUAL FORCE REFRESH TRIGGERED!");
  updateUserInfo();
  fetchUserProfile();
};
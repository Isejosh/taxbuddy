// dashboard.js - BULLETPROOF VERSION
console.log("🚀 Dashboard.js loaded!");

const BASE_URL = "https://tax-tracker-backend.onrender.com/api";

// ============================================
// HELPER FUNCTIONS
// ============================================

function getUserName() {
  console.log("📝 getUserName() called");
  
  // Try localStorage first
  let name = localStorage.getItem("userName");
  if (name && name !== "User" && name !== "null" && name !== "undefined") {
    console.log("✅ Got name from localStorage:", name);
    return name;
  }
  
  // Try user object
  try {
    const userStr = localStorage.getItem("user");
    console.log("🔍 Checking user object:", userStr);
    
    if (userStr) {
      const user = JSON.parse(userStr);
      console.log("👤 Parsed user:", user);
      
      // Try ALL possible name fields
      name = user.fullname || user.fullName || user.full_name || user.name || user.username || user.userName;
      
      if (name) {
        console.log("✅ Got name from user object:", name);
        localStorage.setItem("userName", name); // Save it for next time
        return name;
      } else {
        console.warn("⚠️ No name field found in user object. Available fields:", Object.keys(user));
      }
    }
  } catch (e) {
    console.error("❌ Error parsing user data:", e);
  }
  
  console.warn("⚠️ Returning default 'User'");
  return "User";
}

function getUserType() {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.accountType || user.account_type || user.role || "individual";
    }
  } catch (e) {
    console.error("Error getting user type:", e);
  }
  return localStorage.getItem("accountType") || "individual";
}

function getUserId() {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id || user._id || user.userId || user.user_id;
    }
  } catch (e) {
    console.error("Error getting user ID:", e);
  }
  return localStorage.getItem("userId");
}

function getAuthToken() {
  return localStorage.getItem("authToken") || localStorage.getItem("token");
}

// ============================================
// UPDATE USER INFO - THE CRITICAL FUNCTION
// ============================================

function updateUserInfo() {
  console.log("🎨 updateUserInfo() called");
  
  const name = getUserName();
  const type = getUserType();
  
  console.log("📊 User info:", { name, type });
  
  // METHOD 1: Update h2 elements by class
  const mobileH2 = document.querySelector(".user-info h2.mobile");
  const desktopH2 = document.querySelector(".user-info h2.desktop");
  
  console.log("🔍 Found elements:", {
    mobileH2: !!mobileH2,
    desktopH2: !!desktopH2
  });
  
  if (mobileH2) {
    mobileH2.textContent = name;
    console.log("✅ Updated mobile h2 to:", name);
  } else {
    console.warn("⚠️ Mobile h2 not found!");
  }
  
  if (desktopH2) {
    desktopH2.textContent = name;
    console.log("✅ Updated desktop h2 to:", name);
  } else {
    console.warn("⚠️ Desktop h2 not found!");
  }
  
  // METHOD 2: Fallback - update ALL h2 elements in user-info
  const allH2 = document.querySelectorAll(".user-info h2");
  console.log("🔍 Found", allH2.length, "total h2 elements");
  
  allH2.forEach((h2, index) => {
    if (!h2.textContent || h2.textContent.trim() === "") {
      h2.textContent = name;
      console.log(`✅ Updated h2 #${index + 1} to:`, name);
    }
  });
  
  // Update account type
  const typeElement = document.querySelector(".user-info span");
  if (typeElement) {
    const displayType = type.charAt(0).toUpperCase() + type.slice(1);
    typeElement.textContent = `${displayType} account`;
    console.log("✅ Updated account type to:", displayType);
  } else {
    console.warn("⚠️ Account type span not found!");
  }
  
  // VERIFICATION: Check if updates worked
  setTimeout(() => {
    const verification = document.querySelectorAll(".user-info h2");
    console.log("🔍 Verification - h2 contents:", Array.from(verification).map(h2 => h2.textContent));
  }, 100);
}

// ============================================
// API REQUEST HELPER
// ============================================

async function apiRequest(endpoint, method = "GET", body = null, authRequired = false) {
  const headers = { "Content-Type": "application/json" };
  
  if (authRequired) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: error.message };
  }
}

// ============================================
// FETCH TAX SUMMARY
// ============================================

async function fetchTaxSummary() {
  console.log("📊 Fetching tax summary...");
  
  try {
    const userId = getUserId();
    if (!userId) {
      console.warn("⚠️ No user ID found");
      return;
    }
    
    const data = await apiRequest(`/tax/summary/${userId}`, "GET", null, true);
    console.log("📥 Tax summary response:", data);
    
    if (data.success && data.data) {
      updateTaxData(data.data);
    } else {
      console.warn("⚠️ No tax data, using defaults");
      updateTaxData({ 
        totalPayable: 0, 
        totalPaid: 0, 
        totalUnpaid: 0, 
        paidPercentage: 0, 
        unpaidPercentage: 0 
      });
    }
  } catch (error) {
    console.error("❌ Tax summary error:", error);
    updateTaxData({ 
      totalPayable: 0, 
      totalPaid: 0, 
      totalUnpaid: 0, 
      paidPercentage: 0, 
      unpaidPercentage: 0 
    });
  }
}

// ============================================
// UPDATE TAX DATA IN UI
// ============================================

function updateTaxData(taxData) {
  console.log("💰 Updating tax data:", taxData);
  
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
  
  console.log("✅ Tax data updated in UI");
}

// ============================================
// SETUP DATE FILTERS
// ============================================

function setupDateFilters() {
  const monthSelect = document.querySelector('select[name="month"]');
  const yearSelect = document.querySelector('select[name="year"]');
  
  if (monthSelect) {
    monthSelect.addEventListener("change", () => {
      console.log("📅 Month changed:", monthSelect.value);
      fetchTaxSummary();
    });
  }
  
  if (yearSelect) {
    yearSelect.addEventListener("change", () => {
      console.log("📅 Year changed:", yearSelect.value);
      fetchTaxSummary();
    });
  }
}

// ============================================
// INITIALIZE DASHBOARD
// ============================================

function initializeDashboard() {
  console.log("🚀 ========== DASHBOARD INITIALIZING ==========");
  
  const token = getAuthToken();
  const userId = getUserId();
  const userName = getUserName();
  
  console.log("🔐 Auth check:", {
    hasToken: !!token,
    userId: userId,
    userName: userName,
    localStorage: {
      user: localStorage.getItem("user") ? "exists" : "missing",
      userName: localStorage.getItem("userName"),
      userId: localStorage.getItem("userId"),
      token: localStorage.getItem("authToken") ? "exists" : "missing"
    }
  });
  
  // Check if user is logged in
  if (!token || !userId) {
    console.error("❌ Not authenticated!");
    alert("⚠️ Please login first");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);
    return;
  }
  
  console.log("✅ User authenticated");
  
  // Update UI
  console.log("🎨 Calling updateUserInfo()...");
  updateUserInfo();
  
  console.log("📊 Calling fetchTaxSummary()...");
  fetchTaxSummary();
  
  console.log("🚀 ========== DASHBOARD INITIALIZED ==========");
}

// ============================================
// START WHEN PAGE LOADS
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("📄 ========== DOM CONTENT LOADED ==========");
  console.log("Current page:", window.location.pathname);
  
  // Small delay to ensure everything is ready
  setTimeout(() => {
    initializeDashboard();
    setupDateFilters();
  }, 100);
});

// Also try on window.load as backup
window.addEventListener("load", () => {
  console.log("🪟 Window fully loaded - running backup check");
  
  // Check if username is still not showing
  const h2Elements = document.querySelectorAll(".user-info h2");
  const hasEmptyH2 = Array.from(h2Elements).some(h2 => !h2.textContent || h2.textContent.trim() === "");
  
  if (hasEmptyH2) {
    console.warn("⚠️ Empty h2 detected on window.load, retrying updateUserInfo()");
    updateUserInfo();
  }
});

console.log("✅ Dashboard.js file fully loaded and ready");
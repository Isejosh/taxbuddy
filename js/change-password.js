// change-password.js - FIXED to match Postman exactly
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".pword-reset-container");
  const currentPassword = document.getElementById("currentPassword");
  const newPassword = document.getElementById("newPassword");
  const confirmPassword = document.getElementById("confirmPassword");
  const updateBtn = form.querySelector(".save-btn");
  const backBtn = form.querySelector(".logout-btn");

  // Check authentication
  const token = getAuthToken();
  if (!token) {
    alert("⚠️ Session expired. Please log in again.");
    window.location.href = "login.html";
    return;
  }

  console.log("🔑 User authenticated, token found");

  // Handle password change
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const oldPass = currentPassword.value.trim();
    const newPass = newPassword.value.trim();
    const confirmPass = confirmPassword.value.trim();

    // Validation
    if (!oldPass || !newPass || !confirmPass) {
      alert("⚠️ Please fill in all fields.");
      return;
    }

    if (newPass !== confirmPass) {
      alert("❌ New passwords do not match.");
      return;
    }

    if (newPass.length < 6) {
      alert("⚠️ Password must be at least 6 characters long.");
      return;
    }

    // Show loading state
    updateBtn.textContent = "Updating...";
    updateBtn.disabled = true;

    try {
      console.log("📤 Changing password...");

      // Use EXACT payload structure from Postman
      const requestBody = {
        oldPassword: oldPass,  // Note: camelCase, not snake_case
        newPassword: newPass   // Note: camelCase, not snake_case
      };

      console.log("📦 Request payload:", requestBody);

      // Make the API request with authentication
      const data = await apiRequest("/auth/users/change_password", "PATCH", requestBody, true);

      console.log("📥 Change password response:", data);

      if (data.success) {
        alert("✅ Password updated successfully! Please login again with your new password.");
        
        // Clear session and redirect to login
        clearUserData();
        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      } else {
        // Show specific error message from backend
        const errorMsg = data.message || "Failed to update password. Please check your current password.";
        alert(`❌ ${errorMsg}`);
        
        // Clear password fields on error
        currentPassword.value = "";
        newPassword.value = "";
        confirmPassword.value = "";
        currentPassword.focus();
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("⚠️ Server error. Please try again later.");
    } finally {
      updateBtn.textContent = "Update Password";
      updateBtn.disabled = false;
    }
  });

  // Back button handler
  if (backBtn) {
    backBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "profile-settings.html";
    });
  }

  // Helper functions (reuse from api.js)
  function getAuthToken() {
    return localStorage.getItem("authToken") || localStorage.getItem("token");
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
});
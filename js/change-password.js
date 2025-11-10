// change-password.js - Fixed endpoint
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".pword-reset-container") || document.querySelector("form");
  const currentPassword = document.getElementById("currentPassword");
  const newPassword = document.getElementById("newPassword");
  const confirmPassword = document.getElementById("confirmPassword");
  const updateBtn = form.querySelector(".save-btn") || form.querySelector('button[type="submit"]');
  const backBtn = form.querySelector(".logout-btn");

  const token = getAuthToken();
  const userId = getUserId();

  if (!token || !userId) {
    alert("⚠️ Session expired. Please log in again.");
    window.location.href = "login.html";
    return;
  }

  // Handle password change
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const oldPass = currentPassword.value.trim();
    const newPass = newPassword.value.trim();
    const confirmPass = confirmPassword.value.trim();

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

    updateBtn.textContent = "Updating...";
    updateBtn.disabled = true;

    try {
      console.log("📤 Changing password...");

      const data = await apiRequest("/auth/users/change_password", "PATCH", {
        old_password: oldPass,
        new_password: newPass,
      }, true);

      console.log("📥 Change password response:", data);

      if (data.success) {
        alert("✅ Password updated successfully! Please login again with your new password.");
        
        // Clear session and redirect to login
        localStorage.clear();
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);
      } else {
        alert(`❌ ${data.message || "Failed to update password."}`);
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("⚠️ Server error. Please try again later.");
    } finally {
      updateBtn.textContent = "Update Password";
      updateBtn.disabled = false;
    }
  });

  // Back button
  if (backBtn) {
    backBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "profile-settings.html";
    });
  }

  // Helper functions
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
});
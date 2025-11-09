// profile-settings.js - Fixed
document.addEventListener("DOMContentLoaded", async () => {
  const saveBtn = document.querySelector(".save-btn");
  const logoutBtn = document.querySelector(".logout-btn");
  const taxToggle = document.getElementById("taxToggle");

  const accountType = getUserType();
  const token = getAuthToken();
  const userId = getUserId();

  if (!token || !userId) {
    alert("⚠️ Please log in first");
    window.location.href = "login.html";
    return;
  }

  // Prefill account type
  const accountTypeField = document.getElementById("accountType");
  if (accountTypeField && accountType) {
    accountTypeField.value = accountType.charAt(0).toUpperCase() + accountType.slice(1);
  }

  // Load current profile data
  await loadProfileData();

  // Load saved tax reminder preference from localStorage
  const savedPreference = localStorage.getItem("taxReminderEnabled");
  if (taxToggle) {
    taxToggle.checked = savedPreference === "true";
  }

  // Handle Save (update profile)
  if (saveBtn) {
    saveBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      const fullName = document.getElementById("fullName")?.value.trim();
      const income = document.getElementById("incomeRange")?.value;
      const tin = document.getElementById("tin")?.value.trim();

      if (!fullName) {
        alert("⚠️ Please enter your full name");
        return;
      }

      saveBtn.textContent = "Saving...";
      saveBtn.disabled = true;

      try {
        console.log("📤 Updating profile for:", accountType);

        const data = await apiRequest(
          `/auth/${accountType}/profile`,
          "PATCH",
          {
            fullname: fullName,
            annualIncomeRange: income,
            tin: tin,
          },
          true
        );

        console.log("📥 Profile update response:", data);

        if (data.success) {
          // Update localStorage
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          user.fullname = fullName;
          user.annualIncomeRange = income;
          user.tin = tin;
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("userName", fullName);

          alert("✅ Profile updated successfully!");
        } else {
          alert(`❌ ${data.message || "Update failed."}`);
        }
      } catch (error) {
        console.error("❌ Error:", error);
        alert("⚠️ Error connecting to server.");
      } finally {
        saveBtn.textContent = "Save Changes";
        saveBtn.disabled = false;
      }
    });
  }

  // Handle Reminder Preference Toggle
  if (taxToggle) {
    taxToggle.addEventListener("change", async () => {
      const isEnabled = taxToggle.checked;
      localStorage.setItem("taxReminderEnabled", isEnabled);

      try {
        const data = await apiRequest(
          "/auth/preferences/reminders",
          "PUT",
          {
            tax_reminder: isEnabled,
          },
          true
        );

        if (data.success) {
          console.log("🔔 Reminder preference updated on server");
        } else {
          alert(`❌ ${data.message || "Failed to update reminder."}`);
        }
      } catch (error) {
        console.error("❌ Error:", error);
        alert("⚠️ Error updating reminder preference.");
      }
    });
  }

  // Handle Logout / Delete Account
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      const confirmDelete = confirm(
        "Do you want to delete your account permanently?\nPress Cancel to just log out."
      );

      if (confirmDelete) {
        try {
          const data = await apiRequest("/auth/profile", "DELETE", null, true);

          if (data.success) {
            alert("🗑️ Account deleted successfully.");
            localStorage.clear();
            window.location.href = "index.html";
          } else {
            alert(`❌ ${data.message || "Failed to delete account."}`);
          }
        } catch (error) {
          console.error("❌ Error:", error);
          alert("⚠️ Error connecting to server.");
        }
      } else {
        // Just logout
        localStorage.clear();
        window.location.href = "index.html";
      }
    });
  }

  // Load profile data function
  async function loadProfileData() {
    try {
      console.log("📤 Loading profile data...");

      const data = await apiRequest(
        `/auth/${accountType}/profile`,
        "GET",
        null,
        true
      );

      console.log("📥 Profile data:", data);

      if (data.success && data.data) {
        const profile = data.data;
        
        // Fill in form fields
        const fullNameField = document.getElementById("fullName");
        const incomeField = document.getElementById("incomeRange");
        const tinField = document.getElementById("tin");

        if (fullNameField) fullNameField.value = profile.fullname || profile.name || "";
        if (incomeField) incomeField.value = profile.annualIncomeRange || profile.income || "";
        if (tinField) tinField.value = profile.tin || "";
      }
    } catch (error) {
      console.error("❌ Error loading profile:", error);
    }
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
});
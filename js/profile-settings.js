document.addEventListener("DOMContentLoaded", async () => {
  const saveBtn = document.querySelector(".save-btn");
  const logoutBtn = document.querySelector(".logout-btn");
  const taxToggle = document.getElementById("taxToggle");

  const accountType = localStorage.getItem("accountType"); // "individual" or "business"
  const token = localStorage.getItem("token");

  // ✅ Prefill account type
  if (accountType) {
    document.getElementById("accountType").value =
      accountType.charAt(0).toUpperCase() + accountType.slice(1);
  }

  // ✅ Load saved tax reminder preference from localStorage
  const savedPreference = localStorage.getItem("taxReminderEnabled");
  taxToggle.checked = savedPreference === "true";

  // ✅ Handle Save (update profile)
  saveBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const income = document.getElementById("incomeRange").value;
    const tin = document.getElementById("tin").value.trim();

    if (!fullName || !tin) {
      alert("⚠️ Please fill in all required fields");
      return;
    }

    try {
      const data = await apiRequest(`/auth/${accountType}/profile`, "PATCH", {
        name: fullName,
        income,
        tin,
      }, true);

      if (data.success) {
        alert("✅ Profile updated successfully!");
      } else {
        alert(`❌ ${data.message || "Update failed."}`);
      }
    } catch (error) {
      console.error(error);
      alert("⚠️ Error connecting to server.");
    }
  });

  // ✅ Handle Reminder Preference Toggle
  taxToggle.addEventListener("change", async () => {
    const isEnabled = taxToggle.checked;
    localStorage.setItem("taxReminderEnabled", isEnabled);

    try {
      const data = await apiRequest("/auth/preferences/reminders", "PUT", {
        tax_reminder: isEnabled,
      }, true);

      if (data.success) {
        console.log("🔔 Reminder preference updated on server");
      } else {
        alert(`❌ ${data.message || "Failed to update reminder."}`);
      }
    } catch (error) {
      console.error(error);
      alert("⚠️ Error updating reminder preference.");
    }
  });

  // ✅ Handle Logout / Delete Account
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
        console.error(error);
        alert("⚠️ Error connecting to server.");
      }
    } else {
      // If user just wants to logout
      localStorage.clear();
      window.location.href = "index.html";
    }
  });
});

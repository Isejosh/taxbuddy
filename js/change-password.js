document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".pword-reset-container");
  const currentPassword = document.getElementById("currentPassword");
  const newPassword = document.getElementById("newPassword");
  const confirmPassword = document.getElementById("confirmPassword");
  const updateBtn = form.querySelector(".save-btn");
  const backBtn = form.querySelector(".logout-btn");

  const token = localStorage.getItem("token");
  if (!token) {
    alert("⚠️ Session expired. Please log in again.");
    window.location.href = "index.html";
    return;
  }

  // ✅ Helper function to call API
  async function apiRequest(endpoint, method, body = null) {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`http://localhost:5000/api${endpoint}`, options);
    return response.json();
  }

  // ✅ Handle password change
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

    if (newPass.length < 8) {
      alert("⚠️ Password must be at least 8 characters long.");
      return;
    }

    updateBtn.textContent = "Updating...";
    updateBtn.disabled = true;

    try {
      const data = await apiRequest("/auth/change_password", "PATCH", {
        old_password: oldPass,
        new_password: newPass,
      });

      if (data.success) {
        alert("✅ Password updated successfully!");
        form.reset();
        window.location.href = "profile-settings.html";
      } else {
        alert(`❌ ${data.message || "Failed to update password."}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("⚠️ Server error. Please try again later.");
    } finally {
      updateBtn.textContent = "Update Password";
      updateBtn.disabled = false;
    }
  });

  // ✅ Back button
  backBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "profile-settings.html";
  });
});
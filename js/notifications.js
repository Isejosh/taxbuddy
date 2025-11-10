// notifications.js - Handle tax reminders and notifications
document.addEventListener("DOMContentLoaded", async () => {
  // Update user name in header if it exists
  updateHeaderUserName();
  
  const userId = getUserId();
  const token = getAuthToken();

  if (!token || !userId) {
    alert("⚠️ Please log in first");
    window.location.href = "login.html";
    return;
  }

  await loadReminders();

  // Helper: Update header username
  function updateHeaderUserName() {
    const userNameElement = document.querySelector(".user-info h2");
    if (userNameElement) {
      const userName = getUserName();
      userNameElement.textContent = userName;
    }
  }

  function getUserName() {
    const storedName = localStorage.getItem("userName");
    if (storedName && storedName !== "User") return storedName;
    
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.fullname || userData.fullName || userData.name || userData.username || "User";
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
    return "User";
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

  async function loadReminders() {
    try {
      console.log("📤 Fetching reminders...");

      const response = await apiRequest(`/reminders/${userId}`, "GET", null, true);

      console.log("📥 Reminders response:", response);

      if (response.success && response.data) {
        displayReminders(response.data);
      } else {
        showEmptyState();
      }
    } catch (error) {
      console.error("❌ Error loading reminders:", error);
      showEmptyState();
    }
  }

  function displayReminders(reminders) {
    const container = document.getElementById("remindersContainer");
    const emptyState = document.getElementById("emptyState");

    if (!container) return;

    if (reminders.length === 0) {
      showEmptyState();
      return;
    }

    if (emptyState) emptyState.style.display = "none";
    container.style.display = "block";

    container.innerHTML = reminders.map(reminder => `
      <div class="notification-card ${reminder.type}">
        <div class="notification-icon">
          <i class="ph ph-bell-ringing"></i>
        </div>
        <div class="notification-content">
          <h3>${reminder.title || "Tax Reminder"}</h3>
          <p>${reminder.message}</p>
          <span class="notification-date">${formatDate(reminder.createdAt || reminder.date)}</span>
        </div>
      </div>
    `).join("");
  }

  function showEmptyState() {
    const container = document.getElementById("remindersContainer");
    const emptyState = document.getElementById("emptyState");

    if (container) container.style.display = "none";
    if (emptyState) {
      emptyState.style.display = "flex";
      emptyState.innerHTML = `
        <i class="ph ph-bell-slash"></i>
        <p>No notifications yet</p>
      `;
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  }
});
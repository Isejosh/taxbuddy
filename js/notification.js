document.addEventListener("DOMContentLoaded", function () {
  loadUserReminders();
});

async function loadUserReminders() {
  try {
    const userId = getUserId();
    const token = getAuthToken();

    if (!userId || !token) {
      console.warn("User not authenticated");
      showEmptyState();
      return;
    }

    // Show loading state
    showLoadingState();

    // Fetch reminders from API
    const data = await apiRequest(`/reminders/${userId}`, "GET", null, true);

    if (data.success && data.data && data.data.length > 0) {
      displayReminders(data.data);
    } else {
      showEmptyState();
    }
  } catch (error) {
    console.error("Error loading reminders:", error);
    showEmptyState();
  }
}

function displayReminders(reminders) {
  const emptyState = document.getElementById("emptyState");
  const notificationsList = document.getElementById("notificationsList");

  // Hide empty state, show notifications
  emptyState.style.display = "none";
  notificationsList.style.display = "block";

  let remindersHTML = `
        <div class="notification-message">
            <div class="btn-container">
                <button class="read-btn" id="markAllRead">Mark all as read</button>
                <button class="delete-btn" id="deleteAll">Delete all</button>
            </div>
    `;

  // Sort reminders by date (newest first)
  const sortedReminders = reminders.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  sortedReminders.forEach((reminder) => {
    const reminderDate = new Date(reminder.createdAt);
    const formattedDate = reminderDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const formattedTime = reminderDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    remindersHTML += `
            <div class="message-division" data-reminder-id="${reminder._id}">
                <div class="inner-btn">
                    <span class="new ${
                      reminder.isCompleted ? "read" : "unread"
                    }">${reminder.isCompleted ? "Read" : "New"}</span>
                    <span class="inner-mark-as-read" data-reminder-id="${
                      reminder._id
                    }">
                        ${
                          reminder.isCompleted
                            ? "Mark as unread"
                            : "Mark as read"
                        }
                    </span>
                </div>
                <p class="content">${reminder.message}</p>
                <p class="date-time">${formattedDate}, ${formattedTime}</p>
            </div>
        `;
  });

  remindersHTML += `
            <div class="notification-reminder">
                <h4>About Notifications</h4>
                <p>Notifications help you stay on top of your tax obligations. Enable reminders in your profile settings to get alerts about upcoming due dates.</p>
            </div>
        </div>
    `;

  notificationsList.innerHTML = remindersHTML;

  // Update header and setup actions
  const unreadCount = reminders.filter((r) => !r.isCompleted).length;
  updateHeaderStatus(unreadCount);
  setupNotificationActions();
}

function setupNotificationActions() {
  // Mark all as read
  const markAllReadBtn = document.getElementById("markAllRead");
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener("click", markAllAsRead);
  }

  // Delete all
  const deleteAllBtn = document.getElementById("deleteAll");
  if (deleteAllBtn) {
    deleteAllBtn.addEventListener("click", deleteAllReminders);
  }

  // Individual mark as read
  document.querySelectorAll(".inner-mark-as-read").forEach((button) => {
    button.addEventListener("click", function () {
      const reminderId = this.getAttribute("data-reminder-id");
      toggleReminderReadStatus(reminderId, this);
    });
  });
}

async function markAllAsRead() {
  try {
    const userId = getUserId();
    const reminders = await apiRequest(
      `/reminders/${userId}`,
      "GET",
      null,
      true
    );

    if (reminders.success) {
      // Show loading on button
      const button = document.getElementById("markAllRead");
      const originalText = button.textContent;
      button.textContent = "Marking...";
      button.disabled = true;

      // Mark all as read in UI
      document.querySelectorAll(".message-division").forEach((div) => {
        const newBadge = div.querySelector(".new");
        const markBtn = div.querySelector(".inner-mark-as-read");

        if (newBadge) {
          newBadge.textContent = "Read";
          newBadge.classList.remove("unread");
          newBadge.classList.add("read");
        }
        if (markBtn) markBtn.textContent = "Mark as unread";
      });

      // Update header
      updateHeaderStatus(0);

      // Reset button
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 1000);

      // Show success message
      showToast("All notifications marked as read");
    }
  } catch (error) {
    console.error("Error marking all as read:", error);
    showToast("Failed to mark all as read", "error");
  }
}

async function deleteAllReminders() {
  if (
    confirm(
      "Are you sure you want to delete all notifications? This action cannot be undone."
    )
  ) {
    try {
      const button = document.getElementById("deleteAll");
      const originalText = button.textContent;
      button.textContent = "Deleting...";
      button.disabled = true;

      // This would need a DELETE endpoint - for now just clear UI
      showEmptyState();

      // Reset button
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 1000);

      showToast("All notifications deleted");
    } catch (error) {
      console.error("Error deleting all reminders:", error);
      showToast("Failed to delete notifications", "error");
    }
  }
}

async function toggleReminderReadStatus(reminderId, buttonElement) {
  try {
    // Show loading on button
    const originalText = buttonElement.textContent;
    buttonElement.textContent = "...";
    buttonElement.disabled = true;

    // Since we don't have a specific endpoint for marking read,
    // we'll just toggle the UI state for now
    const messageDiv = buttonElement.closest(".message-division");
    const newBadge = messageDiv.querySelector(".new");

    if (newBadge.textContent === "New") {
      newBadge.textContent = "Read";
      newBadge.classList.remove("unread");
      newBadge.classList.add("read");
      buttonElement.textContent = "Mark as unread";
    } else {
      newBadge.textContent = "New";
      newBadge.classList.remove("read");
      newBadge.classList.add("unread");
      buttonElement.textContent = "Mark as read";
    }

    // Update header status
    const currentUnread = document.querySelectorAll(".new.unread").length;
    updateHeaderStatus(currentUnread);

    // Reset button
    setTimeout(() => {
      buttonElement.disabled = false;
    }, 500);
  } catch (error) {
    console.error("Error toggling reminder status:", error);
    buttonElement.textContent = originalText;
    buttonElement.disabled = false;
    showToast("Failed to update notification", "error");
  }
}

function updateHeaderStatus(unreadCount) {
  const headerStatus = document.getElementById("headerStatus");
  if (headerStatus) {
    if (unreadCount === 0) {
      headerStatus.textContent = "All caught up!";
      headerStatus.style.color = "#198754";
    } else {
      headerStatus.textContent = `${unreadCount} unread notification${
        unreadCount > 1 ? "s" : ""
      }`;
      headerStatus.style.color = "#dc3545";
    }
  }
}

function showEmptyState() {
  const emptyState = document.getElementById("emptyState");
  const notificationsList = document.getElementById("notificationsList");

  if (emptyState && notificationsList) {
    emptyState.style.display = "block";
    notificationsList.style.display = "none";
    updateHeaderStatus(0);
  }
}

function showLoadingState() {
  const emptyState = document.getElementById("emptyState");
  if (emptyState) {
    emptyState.innerHTML = `
            <div class="notification-display">
                <i class="ph ph-circle-notch ph-spin" style="font-size: 48px; color: #666;"></i>
                <p>Loading notifications...</p>
            </div>
        `;
  }
}

function showToast(message, type = "success") {
  // Create toast element
  let toast = document.getElementById("notificationToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "notificationToast";
    toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            transform: translateX(150%);
            transition: transform 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
    document.body.appendChild(toast);
  }

  // Set style based on type
  if (type === "error") {
    toast.style.background = "#dc3545";
  } else {
    toast.style.background = "#198754";
  }

  toast.textContent = message;
  toast.style.transform = "translateX(0)";

  // Hide after 3 seconds
  setTimeout(() => {
    toast.style.transform = "translateX(150%)";
  }, 3000);
}

// Utility functions
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

// Refresh notifications every 30 seconds if on the page
setInterval(() => {
  if (
    document.getElementById("notificationsList") &&
    document.getElementById("notificationsList").style.display !== "none"
  ) {
    loadUserReminders();
  }
}, 30000);

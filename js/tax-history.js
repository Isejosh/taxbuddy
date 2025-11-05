document.addEventListener("DOMContentLoaded", function () {
  // Initialize tax history
  loadTaxHistory();
  setupFilters();
});

async function loadTaxHistory() {
  try {
    const userId = getUserId();
    const token = getAuthToken();

    if (!userId || !token) {
      alert("⚠️ Please log in to view tax history.");
      window.location.href = "individual-login.html";
      return;
    }

    // Show loading state
    showLoadingState();

    // Fetch tax records from API
    const data = await apiRequest(`/tax/records/${userId}`, "GET", null, true);

    if (data.success) {
      const taxRecords = data.data;
      updateSummaryCards(taxRecords);
      displayTaxRecords(taxRecords);
      hideEmptyState();
    } else {
      showEmptyState();
      console.error("Failed to load tax records:", data.message);
    }
  } catch (error) {
    console.error("Error loading tax history:", error);
    showEmptyState();
  }
}

function updateSummaryCards(taxRecords) {
  const totalRecords = taxRecords.length;
  const paidRecords = taxRecords.filter((record) => record.isPaid).length;
  const unpaidRecords = totalRecords - paidRecords;
  const paidAmount = taxRecords
    .filter((record) => record.isPaid)
    .reduce((sum, record) => sum + record.taxAmount, 0);

  // Update summary cards
  const totalElement = document.querySelector(
    ".card-container .card:nth-child(1) p"
  );
  const paidElement = document.querySelector(".card-container .card.paid p");
  const unpaidElement = document.querySelector(
    ".card-container .card.unpaid p"
  );
  const amountElement = document.querySelector(
    ".card-container .card.amount p"
  );

  if (totalElement) totalElement.textContent = totalRecords;
  if (paidElement) paidElement.textContent = paidRecords;
  if (unpaidElement) unpaidElement.textContent = unpaidRecords;
  if (amountElement)
    amountElement.textContent = `₦${paidAmount.toLocaleString()}`;
}

function displayTaxRecords(taxRecords) {
  const recordsContainer =
    document.querySelector(".paid-state") ||
    document.querySelector(".empty-state")?.parentNode;

  if (!recordsContainer) return;

  // Clear existing content except empty state
  const emptyState = document.querySelector(".empty-state");
  if (emptyState) {
    emptyState.style.display = "none";
  }

  // Sort records by tax year and month (newest first)
  const sortedRecords = taxRecords.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Create records HTML
  let recordsHTML = "";

  sortedRecords.forEach((record) => {
    const recordDate = new Date(record.createdAt);
    const monthYear = recordDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    const isPaid = record.isPaid;
    const statusClass = isPaid ? "paid_green" : "";
    const statusText = isPaid ? "Paid" : "Unpaid";

    recordsHTML += `
      <div class="paid-state" data-record-id="${record._id}">
        <div class="paid-top">
          <p class="paid-top_head">${monthYear}</p>
          <p class="paid-top_body ${statusClass}">${statusText}</p>
        </div>

        <div class="paid-middle">
          <div class="paid-text">
            <p class="paid-text_top">Income</p>
            <p class="paid-text_bottom">₦${record.totalIncome.toLocaleString()}</p>
          </div>

          <div class="paid-text">
            <p class="paid-text_top">Tax Amount</p>
            <p class="paid-text_bottom">₦${record.taxAmount.toLocaleString()}</p>
          </div>
        </div>

        <div class="paid-bottom paid-middle">
          <div class="paid-text">
            <p class="paid-text_top">Tax Rate</p>
            <p class="paid-text_bottom">${(
              (record.taxAmount / record.totalIncome) *
              100
            ).toFixed(2)}%</p>
          </div>
          
          ${
            isPaid
              ? `
            <div class="paid-text">
              <p class="paid-text_top">Paid On</p>
              <p class="paid-text_bottom">${new Date(
                record.updatedAt
              ).toLocaleDateString()}</p>
            </div>
          `
              : `
            <div class="paid-text">
              <p class="paid-text_top">Due Date</p>
              <p class="paid-text_bottom">${new Date(
                record.dueDate
              ).toLocaleDateString()}</p>
            </div>
          `
          }
        </div>

        ${
          !isPaid
            ? `
          <button class="paid-btn unpaid-btn mark-as-paid-btn" data-record-id="${record._id}">
            <a href="#" class="check-icon">
              <i class="ph ph-check"></i>
            </a>
            Mark as Paid
          </button>
        `
            : ""
        }
      </div>
    `;
  });

  // Add records to container
  if (sortedRecords.length > 0) {
    recordsContainer.innerHTML = recordsHTML;

    // Add event listeners to "Mark as Paid" buttons
    document.querySelectorAll(".mark-as-paid-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const recordId = this.getAttribute("data-record-id");
        markTaxAsPaid(recordId);
      });
    });
  } else {
    showEmptyState();
  }
}

async function markTaxAsPaid(recordId) {
  try {
    const userId = getUserId();

    if (!confirm("Are you sure you want to mark this tax record as paid?")) {
      return;
    }

    // Show loading state on button
    const button = document.querySelector(`[data-record-id="${recordId}"]`);
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="ph ph-circle-notch"></i> Marking...';
    button.disabled = true;

    // Call mark as paid API
    const data = await apiRequest(
      `/tax/mark-paid/${userId}/${recordId}`,
      "PATCH",
      null,
      true
    );

    if (data.success) {
      alert("✅ Tax record marked as paid successfully!");

      // Reload the history to reflect changes
      loadTaxHistory();

      // Show success toast if available
      showSuccessToast();
    } else {
      alert(`❌ ${data.message || "Failed to mark as paid"}`);
      button.innerHTML = originalText;
      button.disabled = false;
    }
  } catch (error) {
    console.error("Error marking tax as paid:", error);
    alert("⚠️ Failed to mark tax as paid. Please try again.");

    const button = document.querySelector(`[data-record-id="${recordId}"]`);
    button.innerHTML = originalText;
    button.disabled = false;
  }
}

function setupFilters() {
  const monthSelect = document.querySelector('select[name="month"]');
  const yearSelect = document.querySelector('select[name="year"]');

  if (monthSelect) {
    monthSelect.addEventListener("change", filterRecords);
  }

  if (yearSelect) {
    yearSelect.addEventListener("change", filterRecords);
  }
}

function filterRecords() {
  // This would filter the displayed records based on selected month/year
  // For now, we'll just reload all data
  loadTaxHistory();
}

function showLoadingState() {
  const emptyState = document.querySelector(".empty-state");
  if (emptyState) {
    emptyState.innerHTML =
      '<i class="ph ph-circle-notch"></i> Loading tax history...';
  }
}

function showEmptyState() {
  const emptyState = document.querySelector(".empty-state");
  if (emptyState) {
    emptyState.innerHTML = `
      <i class="ph ph-calendar-dots empty-state_calendar"></i>
      <p>No tax records found. Calculate your first tax to see history.</p>
      <button onclick="window.location.href='calculateTax.html'">
        Calculate Your First Tax
      </button>
    `;
    emptyState.style.display = "block";
  }
}

function hideEmptyState() {
  const emptyState = document.querySelector(".empty-state");
  if (emptyState) {
    emptyState.style.display = "none";
  }
}

function showSuccessToast() {
  // Create or show success toast
  let toast = document.getElementById("successToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "successToast";
    toast.className = "toast";
    toast.textContent = "✅ Marked as paid successfully!";
    document.body.appendChild(toast);
  }

  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
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

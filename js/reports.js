// reports.js - Report download functionality
document.addEventListener("DOMContentLoaded", function () {
  // Check if we're on a dashboard page
  if (document.querySelector(".dashboard-container")) {
    setupReportDownloads();
  }
});

function setupReportDownloads() {
  const downloadPdfBtn = document.getElementById("downloadPdf");
  const downloadCsvBtn = document.getElementById("downloadCsv");

  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener("click", () => downloadReport("pdf"));
  }

  if (downloadCsvBtn) {
    downloadCsvBtn.addEventListener("click", () => downloadReport("csv"));
  }
}

async function downloadReport(format) {
  try {
    const userId = getUserId();
    const token = getAuthToken();

    if (!userId || !token) {
      alert("⚠️ Please log in to download reports.");
      return;
    }

    // Get selected date filters
    const selectedMonth = document.querySelector('select[name="month"]')?.value;
    const selectedYear = document.querySelector('select[name="year"]')?.value;

    // Build query parameters
    const params = new URLSearchParams({
      format: format,
      year: selectedYear || new Date().getFullYear().toString(),
    });

    if (selectedMonth && selectedMonth !== "Month") {
      params.append("month", selectedMonth);
    }

    // Show loading state
    const button = document.getElementById(`download${format.toUpperCase()}`);
    const originalText = button.innerHTML;
    button.innerHTML = `<i class="ph ph-circle-notch ph-spin"></i> Generating...`;
    button.disabled = true;

    // Download the report
    const response = await fetch(`${API_BASE_URL}/report/download?${params}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get the filename from Content-Disposition header or create one
    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = `tax-report-${selectedYear}`;

    if (selectedMonth && selectedMonth !== "Month") {
      filename += `-${selectedMonth}`;
    }

    filename += `.${format}`;

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    // Convert response to blob and download
    const blob = await response.blob();
    downloadBlob(blob, filename);

    // Show success message
    showReportSuccess(format);
  } catch (error) {
    console.error("Error downloading report:", error);
    alert(`⚠️ Failed to download report: ${error.message}`);
  } finally {
    // Reset button state
    const button = document.getElementById(`download${format.toUpperCase()}`);
    if (button) {
      button.innerHTML = originalText;
      button.disabled = false;
    }
  }
}

function downloadBlob(blob, filename) {
  // Create a download link and trigger click
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

function showReportSuccess(format) {
  // Show success toast
  const toast = document.createElement("div");
  toast.className = "report-toast success";
  toast.innerHTML = `
        <i class="ph ph-check-circle"></i>
        <span>${format.toUpperCase()} report downloaded successfully!</span>
    `;

  toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #198754;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 8px;
        transform: translateX(150%);
        transition: transform 0.3s ease;
    `;

  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.style.transform = "translateX(0)";
  }, 100);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.transform = "translateX(150%)";
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
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

// Make sure API_BASE_URL is available
const API_BASE_URL = "https://tax-tracker-backend.onrender.com/api";

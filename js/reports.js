// reports.js - Report download functionality

// API configuration - moved to top for better scope
const API_BASE_URL = "https://tax-tracker-backend.onrender.com/api";

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM loaded - initializing report downloads");
    
    // Check if we're on a dashboard page
    if (document.querySelector(".dashboard-container")) {
        console.log("Dashboard container found - setting up report downloads");
        setupReportDownloads();
    } else {
        console.log("No dashboard container found");
    }
});

function setupReportDownloads() {
    console.log("Setting up report download buttons...");
    
    const downloadPdfBtn = document.getElementById("downloadPdf");
    const downloadCsvBtn = document.getElementById("downloadCsv");

    console.log("PDF button element:", downloadPdfBtn);
    console.log("CSV button element:", downloadCsvBtn);

    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener("click", function(e) {
            console.log("📄 PDF download button clicked!");
            e.preventDefault();
            downloadReport("pdf");
        });
    } else {
        console.error("❌ PDF button not found!");
    }

    if (downloadCsvBtn) {
        downloadCsvBtn.addEventListener("click", function(e) {
            console.log("📊 CSV download button clicked!");
            e.preventDefault();
            downloadReport("csv");
        });
    } else {
        console.error("❌ CSV button not found!");
    }
    
    console.log("Report download setup complete");
}

async function downloadReport(format) {
    let originalText;
    let button;
    
    try {
        console.log(`=== Starting ${format.toUpperCase()} download ===`);
        
        // Get authentication data
        const userId = getUserId();
        const token = getAuthToken();
        
        console.log("🔐 Auth check - User ID:", userId, "Token exists:", !!token);

        if (!userId || !token) {
            alert("⚠️ Please log in to download reports.");
            console.error("Authentication failed: No user ID or token");
            return;
        }

        // Get selected date filters
        const selectedMonth = document.querySelector('select[name="month"]')?.value;
        const selectedYear = document.querySelector('select[name="year"]')?.value;
        
        console.log("📅 Date filters - Month:", selectedMonth, "Year:", selectedYear);

        if (!selectedYear) {
            alert("⚠️ Please select a year for the report.");
            console.error("No year selected");
            return;
        }

        // Build query parameters
        const params = new URLSearchParams({
            format: format,
            year: selectedYear,
        });

        if (selectedMonth && selectedMonth !== "Month") {
            params.append("month", selectedMonth);
        }

        const apiUrl = `${API_BASE_URL}/report/download?${params}`;
        console.log("🌐 API URL:", apiUrl);

        // Show loading state
        button = document.getElementById(`download${format.toUpperCase()}`);
        if (button) {
            originalText = button.innerHTML;
            button.innerHTML = `<i class="ph ph-circle-notch ph-spin"></i> Generating...`;
            button.disabled = true;
            console.log("⏳ Button loading state activated");
        }

        // Download the report
        console.log("⬇️ Sending request to server...");
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        console.log("📨 Response status:", response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Server error response:", errorText);
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        // Check if we got a valid response
        const contentType = response.headers.get("content-type");
        console.log("📄 Content-Type:", contentType);

        if (!contentType) {
            throw new Error("No content type in response");
        }

        // Get the filename from Content-Disposition header or create one
        const contentDisposition = response.headers.get("Content-Disposition");
        console.log("📋 Content-Disposition:", contentDisposition);

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

        console.log("💾 Filename:", filename);

        // Convert response to blob and download
        const blob = await response.blob();
        console.log("📦 Blob size:", blob.size, "bytes");
        
        if (blob.size === 0) {
            throw new Error("Received empty file from server");
        }

        downloadBlob(blob, filename);
        console.log("✅ Download initiated successfully");

        // Show success message
        showReportSuccess(format);

    } catch (error) {
        console.error("💥 Error downloading report:", error);
        
        let errorMessage = `Failed to download report: `;
        if (error.message.includes("Failed to fetch")) {
            errorMessage += "Network error. Please check your connection.";
        } else if (error.message.includes("401")) {
            errorMessage += "Authentication failed. Please log in again.";
        } else if (error.message.includes("404")) {
            errorMessage += "Report endpoint not found.";
        } else if (error.message.includes("empty file")) {
            errorMessage += "Server returned empty file. Please try again.";
        } else {
            errorMessage += error.message;
        }
        
        alert(`⚠️ ${errorMessage}`);
        
        // Show error toast
        showReportError(errorMessage);
        
    } finally {
        // Reset button state
        if (button && originalText) {
            button.innerHTML = originalText;
            button.disabled = false;
            console.log("🔄 Button state reset");
        }
    }
}

function downloadBlob(blob, filename) {
    console.log("💿 Creating download link for blob...");
    
    try {
        // Create a download link and trigger click
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            console.log("🧹 Download link cleaned up");
        }, 100);
        
    } catch (error) {
        console.error("Error creating download link:", error);
        throw error;
    }
}

function showReportSuccess(format) {
    console.log("🎉 Showing success toast for", format);
    
    // Remove any existing toasts
    const existingToasts = document.querySelectorAll('.report-toast');
    existingToasts.forEach(toast => toast.remove());

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
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 8px;
        transform: translateX(150%);
        transition: transform 0.3s ease;
        font-family: system-ui, -apple-system, sans-serif;
    `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.transform = "translateX(0)";
    }, 100);

    // Remove after 4 seconds
    setTimeout(() => {
        toast.style.transform = "translateX(150%)";
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

function showReportError(message) {
    console.log("❌ Showing error toast:", message);
    
    // Remove any existing toasts
    const existingToasts = document.querySelectorAll('.report-toast');
    existingToasts.forEach(toast => toast.remove());

    // Show error toast
    const toast = document.createElement("div");
    toast.className = "report-toast error";
    toast.innerHTML = `
        <i class="ph ph-warning-circle"></i>
        <span>${message}</span>
    `;

    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 8px;
        transform: translateX(150%);
        transition: transform 0.3s ease;
        font-family: system-ui, -apple-system, sans-serif;
        max-width: 400px;
    `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.transform = "translateX(0)";
    }, 100);

    // Remove after 5 seconds
    setTimeout(() => {
        toast.style.transform = "translateX(150%)";
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 5000);
}

// Utility functions
function getUserId() {
    try {
        const user = localStorage.getItem("user");
        if (user) {
            const userData = JSON.parse(user);
            const userId = userData.id || userData._id;
            console.log("👤 User ID from user object:", userId);
            return userId;
        }
        
        const userId = localStorage.getItem("userId");
        console.log("👤 User ID from localStorage:", userId);
        return userId;
    } catch (error) {
        console.error("Error getting user ID:", error);
        return null;
    }
}

function getAuthToken() {
    const token = localStorage.getItem("authToken");
    console.log("🔑 Auth token exists:", !!token);
    if (token) {
        console.log("🔑 Token preview:", token.substring(0, 20) + "...");
    }
    return token;
}

// Test function to check if everything is working
function testReportSetup() {
    console.log("🧪 Testing report setup...");
    console.log("API_BASE_URL:", API_BASE_URL);
    console.log("User ID:", getUserId());
    console.log("Auth Token exists:", !!getAuthToken());
    console.log("PDF Button exists:", !!document.getElementById("downloadPdf"));
    console.log("CSV Button exists:", !!document.getElementById("downloadCsv"));
}

// Run test on load
setTimeout(testReportSetup, 1000);
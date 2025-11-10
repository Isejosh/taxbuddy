// login.js - Fixed to handle backend response structure
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("⚠️ Please enter both email and password.");
      return;
    }

    // Show loading state
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Signing in...";
    submitBtn.disabled = true;

    try {
      console.log("📤 Login request:", { email });

      const response = await apiRequest("/auth/sign_in", "POST", { 
        email, 
        password 
      });

      console.log("📥 Login response:", response);

      // Check if login was successful
      if (!response.success) {
        alert(`❌ ${response.message || "Invalid email or password."}`);
        return;
      }

      // Backend returns user data inside "data" object
      const userData = response.data;
      const token = userData.token || response.token;

      // Check if user data exists
      if (!userData || !token) {
        console.error("Missing user data or token:", response);
        alert("❌ Login failed. Invalid response from server.");
        return;
      }

      // Store user data
      console.log("✅ Storing user data:", userData);
      setUserData(userData, token);

      alert("✅ Login successful!");

      // Redirect based on account type
      const accountType = userData.accountType || userData.account_type || "individual";
      console.log("👤 Account type:", accountType);

      // Store account type explicitly
      localStorage.setItem("accountType", accountType);

      if (accountType === "business" || accountType === "Business") {
        window.location.href = "dashboard_business.html";
      } else {
        window.location.href = "dashboard_individual.html";
      }

    } catch (error) {
      console.error("❌ Login error:", error);
      alert(`⚠️ ${error.message || "Server error. Please try again later."}`);
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
});
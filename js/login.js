document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Signing in...";
    submitBtn.disabled = true;

    try {
      console.log("📤 Login request:", { email });

      const response = await apiRequest("/auth/sign_in", "POST", { email, password });
      console.log("📥 Login response:", response);

      if (!response.success) {
        alert(`❌ ${response.message || "Invalid email or password."}`);
        return;
      }

      // ✅ FIXED: Get user data and token from root level, not from response.data
      const userData = response.user || response.data;       
      const token = response.token || response.access_token;         

      console.log("🔑 Extracted:", { userData, token });

      if (!userData || !token) {
        console.error("❌ Missing user data or token:", response);
        alert("Login failed. Invalid response from server.");
        return;
      }

      setUserData(userData, token);
      console.log("💾 Stored user data:", userData);

      alert("✅ Login successful!");

      // ✅ FIXED: Get account type with fallbacks
      const accountType = userData.account_type || userData.accountType || "individual";
      console.log("👤 Account type:", accountType);

      // Redirect based on account type
      setTimeout(() => {
        if (accountType === "business") {
          window.location.href = "dashboard_business.html";
        } else {
          window.location.href = "dashboard_individual.html";
        }
      }, 1000);

    } catch (error) {
      console.error("❌ Login error:", error);
      alert(`⚠️ ${error.message || "Server error. Please try again later."}`);
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
});
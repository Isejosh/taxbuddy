// login.js - Fixed
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
      const data = await apiRequest("/auth/sign_in", "POST", { 
        email, 
        password 
      });

      if (!data.success) {
        alert(`❌ ${data.message || "Invalid credentials."}`);
        return;
      }

      // Store user data
      setUserData(data.user, data.token);

      alert("✅ Login successful!");

      // Redirect based on account type
      const accountType = data.user.accountType || "individual";
      if (accountType === "business") {
        window.location.href = "dashboard_business.html";
      } else {
        window.location.href = "dashboard_individual.html";
      }

    } catch (error) {
      console.error("Login error:", error);
      alert("⚠️ Server error. Try again later.");
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
});
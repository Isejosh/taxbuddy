// reset-password.js - CORRECTED for token from URL
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".login_form");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirm-password");

  // Get token from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  console.log("🔑 Token from URL:", token);

  // If no token in URL, check if we came from OTP flow (backward compatibility)
  if (!token) {
    const storedToken = localStorage.getItem("resetToken");
    if (storedToken) {
      console.log("🔑 Using token from localStorage:", storedToken);
      // We can proceed with stored token
    } else {
      alert("❌ Invalid reset link. Please request a new password reset.");
      window.location.href = "forgot-password.html";
      return;
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = passwordInput.value.trim();
    const confirmPassword = confirmInput.value.trim();

    if (!password || !confirmPassword) {
      alert("Please fill in both password fields.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Use token from URL or localStorage
    const resetToken = token || localStorage.getItem("resetToken");
    
    if (!resetToken) {
      alert("Reset token missing. Please request a new password reset.");
      window.location.href = "forgot-password.html";
      return;
    }

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Resetting...";
    submitBtn.disabled = true;

    try {
      console.log("🔄 Resetting password with token:", resetToken);

      // Use the correct endpoint: PUT /auth/reset_password/:token
      const data = await apiRequest(`/auth/reset_password/${resetToken}`, "PUT", { 
        password 
      });

      console.log("📥 Reset response:", data);

      if (data.success) {
        alert("✅ Password reset successful! You can now log in with your new password.");
        
        // Clear any reset data
        localStorage.removeItem("resetToken");
        localStorage.removeItem("resetEmail");
        localStorage.removeItem("verifiedEmail");
        
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Redirect to login
        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      } else {
        alert(data.message || "Failed to reset password. The token may be expired or invalid.");
      }
    } catch (error) {
      console.error("❌ Reset error:", error);
      alert("⚠️ Something went wrong. Please try again or request a new reset link.");
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
});
// reset-password.js - FINAL VERSION for token from URL
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".login_form");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirm-password");

  // Get token from URL parameters (from the email link)
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  console.log("🔑 Token from URL:", token);

  // Show token status on page load
  if (!token) {
    console.error("❌ No token found in URL");
    document.querySelector(".auth-text_heading").textContent = "Invalid Reset Link";
    document.querySelector(".auth-text_body").textContent = "This reset link is invalid or has expired. Please request a new password reset.";
    
    // Disable the form
    form.style.opacity = "0.5";
    passwordInput.disabled = true;
    confirmInput.disabled = true;
    form.querySelector('button[type="submit"]').disabled = true;
    
    // Add button to request new reset
    const newResetBtn = document.createElement("button");
    newResetBtn.textContent = "Request New Reset Link";
    newResetBtn.className = "auth-btn";
    newResetBtn.style.marginTop = "20px";
    newResetBtn.onclick = () => window.location.href = "forgot-password.html";
    form.appendChild(newResetBtn);
    
    return;
  }

  // Update UI to show we have a valid token
  document.querySelector(".auth-text_body").textContent += `\n\nToken detected: ${token.substring(0, 10)}...`;

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

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Resetting Password...";
    submitBtn.disabled = true;

    try {
      console.log("🔄 Resetting password with token:", token);

      // Use the exact endpoint from your backend: PUT /auth/reset_password/:token
      const data = await apiRequest(`/auth/reset_password/${token}`, "PUT", { 
        password 
      });

      console.log("📥 Reset response:", data);

      if (data.success) {
        alert("✅ Password reset successful! You can now log in with your new password.");
        
        // Clear URL parameters without reloading
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Redirect to login
        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      } else {
        alert(data.message || "Failed to reset password. The token may be expired or invalid.");
        
        // Add option to request new reset
        if (confirm("Would you like to request a new reset link?")) {
          window.location.href = "forgot-password.html";
        }
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
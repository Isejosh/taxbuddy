// forgot_password.js - Fixed
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".auth-form");
  const emailInput = document.querySelector("#email");

  if (!form || !emailInput) {
    console.error("Form or email input not found");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();

    if (!email) {
      alert("⚠️ Please enter your email address.");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("⚠️ Please enter a valid email address.");
      return;
    }

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;

    try {
      console.log("📤 Sending password reset request for:", email);

      const data = await apiRequest("/auth/forgot_password", "POST", { email });

      console.log("📥 Forgot password response:", data);

      if (data.success) {
        // Save email for verify-reset page
        localStorage.setItem("resetEmail", email);
        
        alert("✅ Password reset OTP sent to your email! Please check your inbox.");
        
        // Clear the form
        emailInput.value = "";
        
        // Redirect to OTP verification page
        setTimeout(() => {
          window.location.href = "verify-reset.html";
        }, 1500);
      } else {
        alert(`❌ ${data.message || "Failed to send reset email. Please try again."}`);
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("⚠️ Server error. Please try again later.");
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
});
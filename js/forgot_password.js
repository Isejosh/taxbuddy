// forgot_password.js - CORRECTED for reset links
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".auth-form");
  const emailInput = document.querySelector("#email");

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
      console.log("📤 Requesting password reset link for:", email);

      // This should trigger an email with reset link
      const data = await apiRequest("/auth/forgot_password", "POST", { email });

      console.log("📥 Reset request response:", data);

      if (data.success) {
        alert("✅ Password reset link sent to your email! Please check your inbox and click the link to reset your password.");
        
        // Clear the form
        emailInput.value = "";
        
        // Redirect to login or stay on page
        setTimeout(() => {
          window.location.href = "login.html";
        }, 3000);
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
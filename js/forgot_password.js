// forgot_password.js - FINAL VERSION for reset links
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
    submitBtn.textContent = "Sending Reset Link...";
    submitBtn.disabled = true;

    try {
      console.log("📤 Requesting password reset link for:", email);

      // This triggers the backend to send a reset email with link
      const data = await apiRequest("/auth/forgot_password", "POST", { email });

      console.log("📥 Reset request response:", data);

      if (data.success) {
        alert("✅ Password reset link sent! Check your email and click the link to reset your password.");
        
        // Clear the form
        emailInput.value = "";
        
        // Optionally redirect to login or stay on page
        setTimeout(() => {
          window.location.href = "login.html";
        }, 3000);
      } else {
        alert(`❌ ${data.message || "Failed to send reset email. Please try again."}`);
      }
    } catch (error) {
      console.error("❌ Error:", error);
      
      // Even if there's an error, the backend might still send the email
      // (some backends don't reveal if email exists for security)
      alert("📧 If your email exists in our system, you'll receive a reset link shortly.");
      
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
});
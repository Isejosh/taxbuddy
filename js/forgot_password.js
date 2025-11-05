document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".login_form");
  const resetBtn = document.querySelector(".login_button");
  const emailInput = document.getElementById("email");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    if (!email) {
      alert("⚠️ Please enter your email address.");
      return;
    }

    resetBtn.textContent = "Sending...";
    resetBtn.disabled = true;

    try {
      const response = await apiRequest("/auth/forgot_password", "POST", {
        email,
      });

      if (response.success) {
        // Save email to localStorage for next page (verify)
        localStorage.setItem("resetEmail", email);

        alert(response.message || "✅ Verification code sent to your email.");

        // redirect to verification page
        window.location.href = "verify-reset.html";
      } else {
        alert(
          response.message || "⚠️ Unable to send reset code. Please try again."
        );
      }
    } catch (err) {
      alert("⚠️ Server connection error. Please try again later.");
    } finally {
      resetBtn.textContent = "Reset Password";
      resetBtn.disabled = false;
    }
  });
});

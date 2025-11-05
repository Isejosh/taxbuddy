document.addEventListener("DOMContentLoaded", () => {
  const verifyBtn = document.querySelector(".verify_btn");
  const resendLink = document.querySelector(".resend_link");
  const otpInputs = document.querySelectorAll(".otp_input");

  // Retrieve email from localStorage (saved during forgot password)
  const email = localStorage.getItem("resetEmail");
  if (!email) {
    alert("Email not found. Please go back and enter your email again.");
    window.location.href = "forgot-password.html";
    return;
  }

  otpInputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      if (input.value.length === 1 && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });
  });

  // 🔹 Verify button - Using your apiRequest function
  verifyBtn.addEventListener("click", async () => {
    const otp = Array.from(otpInputs)
      .map((i) => i.value)
      .join("");
    if (otp.length < 4) {
      alert("⚠️ Please enter the full 4-digit code.");
      return;
    }

    verifyBtn.textContent = "Verifying...";
    verifyBtn.disabled = true;

    try {
      // ✅ Using your existing apiRequest function
      const data = await apiRequest("/auth/verify_otp", "POST", { email, otp });

      if (data.success) {
        alert("✅ Verification successful! Proceed to reset your password.");

        // Save token (if returned) for reset-password.js
        if (data.token) {
          localStorage.setItem("resetToken", data.token);
        }

        localStorage.setItem("verifiedEmail", email);
        window.location.href = "reset-password.html";
      } else {
        alert(data.message || "Invalid code. Please try again.");
      }
    } catch (err) {
      alert("⚠️ Server connection error. Please try again.");
    } finally {
      verifyBtn.textContent = "Verify and Proceed";
      verifyBtn.disabled = false;
    }
  });

  // 🔹 Resend link - Using your apiRequest function
  resendLink.addEventListener("click", async (e) => {
    e.preventDefault();

    // Optional: Add loading state for resend
    const originalText = resendLink.textContent;
    resendLink.textContent = "Sending...";
    resendLink.style.pointerEvents = "none";

    try {
      const data = await apiRequest("/auth/send_otp", "POST", { email });

      if (data.success) {
        alert(data.message || "✅ New verification code sent!");
      } else {
        alert(data.message || "Failed to resend code. Please try again.");
      }
    } catch (err) {
      alert("⚠️ Failed to resend code. Please try again later.");
    } finally {
      resendLink.textContent = originalText;
      resendLink.style.pointerEvents = "auto";
    }
  });
});

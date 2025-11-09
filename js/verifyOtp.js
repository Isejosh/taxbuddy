document.addEventListener("DOMContentLoaded", () => {
  const verifyBtn = document.querySelector(".verify_btn");
  const resendLink = document.querySelector(".resend_link");
  const otpInputs = document.querySelectorAll(".otp_input");
  const emailSpan = document.querySelector(".verify_email");

  // Get email from localStorage
  const email = localStorage.getItem("email");
  const demoOTP = localStorage.getItem("demoOTP"); // 🎯 Grab demo OTP (for presentation/testing)

  if (!email) {
    alert("❌ Email not found. Please sign up again.");
    window.location.href = "signup.html";
    return;
  }

  // Display email on the page
  if (emailSpan) {
    emailSpan.textContent = email;
  }

  // ============================
  // 🎯 DEMO MODE: Auto-fill OTP (for presentation)
  // This section automatically fills OTP inputs with the OTP returned by backend.
  // Helps your PM/testers verify accounts without checking logs or asking for OTP manually.
  // ============================
  if (demoOTP) {
    demoOTP.split("").forEach((digit, index) => {
      if (otpInputs[index]) otpInputs[index].value = digit;
    });
    console.log(`🎯 Demo OTP auto-filled: ${demoOTP}`);
  }

  // Auto-focus and input handling
  otpInputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      // Allow only numbers
      e.target.value = e.target.value.replace(/[^0-9]/g, "");

      // Move to next input automatically
      if (e.target.value && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });

    input.addEventListener("keydown", (e) => {
      // Move back on backspace
      if (e.key === "Backspace" && !e.target.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });
  });

  // ============================
  // 🧩 VERIFY OTP
  // ============================
  verifyBtn.addEventListener("click", async () => {
    const otp = Array.from(otpInputs).map((input) => input.value).join("");

    if (otp.length !== 6) {
      alert("⚠️ Please enter the complete 6-digit code.");
      return;
    }

    verifyBtn.textContent = "Verifying...";
    verifyBtn.disabled = true;

    try {
      console.log("📤 Verifying OTP:", { email, otp });

      const data = await apiRequest("/auth/verify_otp", "POST", { email, otp });

      console.log("📥 Verify response:", data);

      if (data.success) {
        alert("✅ Email verified successfully! You can now login.");
        localStorage.removeItem("email");
        localStorage.removeItem("demoOTP"); // 🧹 Clean up demo data after success
        window.location.href = "login.html";
      } else {
        alert(`❌ ${data.message || "Invalid verification code."}`);
        // Clear inputs for retry
        otpInputs.forEach((input) => (input.value = ""));
        otpInputs[0].focus();
      }
    } catch (error) {
      console.error("❌ Verification error:", error);
      alert("⚠️ Server error. Please try again.");
    } finally {
      verifyBtn.textContent = "Verify";
      verifyBtn.disabled = false;
    }
  });

  // ============================
  // 🔄 RESEND OTP
  // ============================
  if (resendLink) {
    resendLink.addEventListener("click", async (e) => {
      e.preventDefault();

      const originalText = resendLink.textContent;
      resendLink.textContent = "Sending...";
      resendLink.style.pointerEvents = "none";

      try {
        console.log("📤 Resending OTP to:", email);

        const data = await apiRequest("/auth/send_otp", "POST", { email });
        console.log("📥 Resend response:", data);

        if (data.success) {
          alert("✅ New verification code sent to your email!");

          // 🧩 DEMO MODE: Update demoOTP if available
          if (data.data?.otp) {
            localStorage.setItem("demoOTP", data.data.otp);
            demoOTP.split("").forEach((digit, index) => {
              if (otpInputs[index]) otpInputs[index].value = digit;
            });
            console.log(`🎯 Updated Demo OTP auto-filled: ${data.data.otp}`);
          }
        } else {
          alert(`❌ ${data.message || "Failed to resend code."}`);
        }
      } catch (error) {
        console.error("❌ Resend error:", error);
        alert("⚠️ Server error. Please try again.");
      } finally {
        resendLink.textContent = originalText;
        resendLink.style.pointerEvents = "auto";
      }
    });
  }
});

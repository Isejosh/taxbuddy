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

  // 🔹 Auto-focus handling for OTP inputs
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

  // 🔹 Verify button
  verifyBtn.addEventListener("click", async () => {
    const otp = Array.from(otpInputs).map((i) => i.value).join("");
    if (otp.length < 4) {
      alert("⚠️ Please enter the full 4-digit code.");
      return;
    }

    verifyBtn.textContent = "Verifying...";
    verifyBtn.disabled = true;

    try {
      // ✅ Adjust endpoint to match your backend route
      const response = await fetch("http://localhost:5000/api/auth/verify_otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
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

  // 🔹 Resend link
  resendLink.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/auth/resend_otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      alert(data.message || "✅ New verification code sent!");
    } catch (err) {
      alert("⚠️ Failed to resend code. Please try again later.");
    }
  });
});

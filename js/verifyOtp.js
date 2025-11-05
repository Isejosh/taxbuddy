document.addEventListener("DOMContentLoaded", () => {
  const verifyBtn = document.querySelector(".verify_btn");
  const resendLink = document.querySelector(".resend_link");
  const emailElement = document.querySelector(".verify_email");

  // get email from localStorage (from signup page)
  const email = localStorage.getItem("email");
  if (email) emailElement.textContent = email;

  // handle OTP input navigation
  const otpInputs = document.querySelectorAll(".otp_input");
  otpInputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      if (input.value.length === 1 && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });
  });

  // Verify OTP button click
  verifyBtn.addEventListener("click", async () => {
    const otp = Array.from(otpInputs)
      .map((input) => input.value)
      .join("");
    if (otp.length < 4) {
      alert("Please enter the full OTP code.");
      return;
    }

    if (!email) {
      alert("Email not found. Please go back and resend OTP.");
      return;
    }

    verifyBtn.textContent = "Verifying...";
    verifyBtn.disabled = true;

    try {
      const response = await apiRequest("/auth/verify_otp", "POST", {
        email,
        otp,
      });

      if (response.success) {
        alert("OTP verified successfully!");

        // 🔹 Redirect based on account type (saved from signup)
        const accountType = localStorage.getItem("accountType");
        if (accountType === "business") {
          window.location.href = "business-login.html";
        } else {
          window.location.href = "individual-login.html";
        }
      } else {
        alert(response.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      alert("Server connection error.");
    } finally {
      verifyBtn.textContent = "Verify";
      verifyBtn.disabled = false;
    }
  });

  // Resend OTP link
  resendLink.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!email) return alert("Email not found.");

    try {
      const response = await apiRequest("/auth/send_otp", "POST", { email });
      alert(response.message || "OTP resent successfully.");
    } catch (err) {
      alert("Failed to resend OTP.");
    }
  });
});

// send_otp.js

import { apiRequest } from "./api.js"; // reuse your api helper

document.addEventListener("DOMContentLoaded", () => {
  const resendLink = document.querySelector(".resend_link");
  const email = localStorage.getItem("email");

  if (!resendLink) return;

  resendLink.addEventListener("click", async (e) => {
    e.preventDefault();

    if (!email) {
      alert("Email not found. Please sign up again.");
      return;
    }

    resendLink.textContent = "Resending...";
    resendLink.style.pointerEvents = "none";

    try {
      const response = await apiRequest("/auth/send_otp", "POST", { email });

      if (response.success) {
        alert("OTP has been resent to your email!");
      } else {
        alert(response.message || "Failed to resend OTP. Try again.");
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      alert("Server error. Please try again later.");
    } finally {
      resendLink.textContent = "Resend code";
      resendLink.style.pointerEvents = "auto";
    }
  });
});

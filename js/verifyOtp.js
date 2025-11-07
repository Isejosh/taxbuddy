document.addEventListener("DOMContentLoaded", () => {
  const verifyForm = document.getElementById("verifyForm");

  verifyForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = localStorage.getItem("email");
    const otp = document.getElementById("otp").value.trim();

    if (!otp) {
      alert("⚠️ Enter your OTP.");
      return;
    }

    const data = await apiRequest("/auth/verify_otp", "POST", { email, otp });

    if (data.success) {
      alert("✅ Account verified successfully!");
      window.location.href = "login.html";
    } else {
      alert(`❌ ${data.message || "Verification failed."}`);
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();
    const income = document.getElementById("income")?.value || "";
    const terms = document.getElementById("terms").checked;
    const accountType = document.querySelector('input[name="accountType"]:checked').value;

    if (!name || !email || !password || !confirmPassword) {
      alert("⚠️ Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      alert("❌ Passwords do not match.");
      return;
    }
    if (!terms) {
      alert("⚠️ Please agree to the Terms & Conditions.");
      return;
    }

    try {
      const data = await apiRequest(`/auth/sign_up/${accountType}`, "POST", {
        name, email, password, income,
      });

      if (!data.success) {
        alert(`❌ ${data.message || "Signup failed."}`);
        return;
      }

      await apiRequest("/auth/send_otp", "POST", { email });

      localStorage.setItem("email", email);
      localStorage.setItem("accountType", accountType);

      alert("✅ Signup successful! Verification sent to your email.");
      window.location.href = "verify-code.html";
    } catch (error) {
      console.error("Signup error:", error);
      alert("⚠️ Server error. Please try again later.");
    }
  });
});

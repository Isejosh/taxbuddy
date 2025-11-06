document.addEventListener("DOMContentLoaded", function () {
  const individualForm = document.querySelector("#individualForm form");
  const businessForm = document.querySelector("#businessForm form");

  // ✅ Helper function to handle signup
  async function handleSignup(form, formType, endpoint) {
    const name = form.querySelector("#name").value.trim();
    const email = form.querySelector("#email").value.trim();
    const income = form.querySelector("#income")
      ? form.querySelector("#income").value
      : "";
    const password = form.querySelector("#password").value.trim();
    const confirmPassword = form
      .querySelector("#confirm-password")
      .value.trim();
    const terms = form.querySelector("#terms").checked;

    // 🔹 Validation
    if (!name || !email || !password || !confirmPassword) {
      alert("⚠️ Please fill in all required fields.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      alert("⚠️ Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      alert("⚠️ Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      alert("⚠️ Passwords do not match.");
      return;
    }

    if (!terms) {
      alert("⚠️ You must agree to the Terms & Conditions.");
      return;
    }

    try {
      // 🔸 Register user
      const data = await apiRequest(`/auth/sign_up/${endpoint}`, "POST", {
        name,
        email,
        password,
        income,
      });

      if (!data || !data.success) {
        alert(`❌ ${data?.message || "Signup failed."}`);
        return;
      }

      // 🔸 Send OTP
      const otpData = await apiRequest("/auth/send_otp", "POST", { email });
      if (!otpData || !otpData.success) {
        alert(`❌ ${otpData?.message || "Failed to send OTP."}`);
        return;
      }

      // 🔸 Save info for verification
      localStorage.setItem("email", email);
      localStorage.setItem("accountType", formType.toLowerCase());

      alert("✅ Signup successful! Verification code sent to your email.");
      window.location.href = "verify-code.html";
    } catch (error) {
      console.error("Signup error:", error);
      alert("⚠️ Server connection error. Please try again later.");
    }
  }

  // ✅ Individual form listener
  if (individualForm) {
    individualForm.addEventListener("submit", function (e) {
      e.preventDefault();
      handleSignup(individualForm, "Individual", "individual");
    });
  }

  // ✅ Business form listener
  if (businessForm) {
    businessForm.addEventListener("submit", function (e) {
      e.preventDefault();
      handleSignup(businessForm, "Business", "business");
    });
  }
});

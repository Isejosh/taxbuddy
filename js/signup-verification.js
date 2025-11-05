document.addEventListener("DOMContentLoaded", function () {
  const individualForm = document.getElementById("individualSignupForm");
  const businessForm = document.getElementById("businessSignupForm");

  // 🔹 Helper function
  async function handleSignup(formType, endpoint) {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const income = document.getElementById("income")
      ? document.getElementById("income").value
      : "";
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document
      .getElementById("confirm-password")
      .value.trim();
    const terms = document.getElementById("terms").checked;

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
      // Register User
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

      //Send Otp
      const otpData = await apiRequest("/auth/send_otp", "POST", { email });
      if (!otpData || !otpData.success) {
        alert(`❌ ${otpData?.message || "Failed to send OTP."}`);
        return;
      }

      // Save email & account type to localStorage for verification page
      localStorage.setItem("email", email);
      localStorage.setItem("accountType", formType.toLowerCase());

      alert("✅ Signup successful! Verification code sent to your email.");
      // navigate to existing verification page
      window.location.href = "verify-code.html";
    } catch (error) {
      console.error("Signup error:", error);
      alert("⚠️ Server connection error. Please try again later.");
    }
  }

  // 🔸 Individual signup form
  if (individualForm) {
    individualForm.addEventListener("submit", function (e) {
      e.preventDefault();
      handleSignup("Individual", "individual");
    });
  }

  // 🔸 Business signup form
  if (businessForm) {
    businessForm.addEventListener("submit", function (e) {
      e.preventDefault();
      handleSignup("Business", "business");
    });
  }
});

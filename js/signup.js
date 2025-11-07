// signup.js - Fixed
document.addEventListener("DOMContentLoaded", () => {
  const individualForm = document.querySelector("#individualForm .login_form");
  const businessForm = document.querySelector("#businessForm .login_form");

  // Handle Individual Signup
  if (individualForm) {
    individualForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleSignup("individual", individualForm);
    });
  }

  // Handle Business Signup
  if (businessForm) {
    businessForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleSignup("business", businessForm);
    });
  }
});

async function handleSignup(accountType, form) {
  const name = form.querySelector("#name").value.trim();
  const email = form.querySelector("#email").value.trim();
  const password = form.querySelector("#password").value.trim();
  const confirmPassword = form.querySelector("#confirm-password").value.trim();
  const income = form.querySelector("#income")?.value || "";
  const tin = form.querySelector("#tin")?.value.trim() || "";
  const terms = form.querySelector("#terms").checked;

  // Validation
  if (!name || !email || !password || !confirmPassword) {
    alert("⚠️ Please fill in all required fields.");
    return;
  }

  if (password !== confirmPassword) {
    alert("❌ Passwords do not match.");
    return;
  }

  if (password.length < 6) {
    alert("⚠️ Password must be at least 6 characters long.");
    return;
  }

  if (!terms) {
    alert("⚠️ Please agree to the Terms & Conditions.");
    return;
  }

  // Show loading
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Creating account...";
  submitBtn.disabled = true;

  try {
    // Prepare request body based on account type
    const requestBody = {
      name,
      email,
      password
    };

    // Add optional fields
    if (income) requestBody.income = income;
    if (tin) requestBody.tin = tin;

    // For business, add business type if available
    if (accountType === "business") {
      const businessType = form.querySelector("#business")?.value;
      if (businessType) requestBody.businessType = businessType;
    }

    // Sign up
    const signupData = await apiRequest(
      `/auth/sign_up/${accountType}`,
      "POST",
      requestBody
    );

    if (!signupData.success) {
      alert(`❌ ${signupData.message || "Signup failed."}`);
      return;
    }

    // Send OTP
    const otpData = await apiRequest("/auth/send_otp", "POST", { email });

    if (!otpData.success) {
      alert("⚠️ Account created but OTP sending failed. Please try resending from verification page.");
    }

    // Store email and account type for verification
    localStorage.setItem("email", email);
    localStorage.setItem("accountType", accountType);

    alert("✅ Signup successful! Please verify your email.");
    window.location.href = "verify-code.html";

  } catch (error) {
    console.error("Signup error:", error);
    alert("⚠️ Server error. Please try again later.");
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}
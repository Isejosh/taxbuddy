// signup.js - Fixed with better debugging
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
    // Build clean request body
    const requestBody = {
      fullname: name,
      email: email,
      password: password,
      account_type: accountType,
    };

    // Add optional fields only if they exist
    if (income) requestBody.annualIncomeRange = income;
    if (tin) requestBody.tin = tin;

    // For business, add business type if available
    if (accountType === "business") {
      const businessType = form.querySelector("#business")?.value;
      if (businessType) requestBody.businessType = businessType;
    }

    console.log("📤 Signup request:", requestBody);

    // Sign up
    const signupData = await apiRequest(
      `/auth/sign_up/${accountType}`,
      "POST",
      requestBody
    );

    console.log("📥 Signup response:", signupData);

    // Check if signup was successful
    if (!signupData.success) {
      alert(`❌ ${signupData.message || "Signup failed. Please try again."}`);
      return;
    }

    // Store email and account type for verification
    localStorage.setItem("email", email);
    localStorage.setItem("accountType", accountType);

    // Check if OTP was already sent by backend
    if (signupData.message && signupData.message.includes("OTP")) {
      console.log("✅ OTP already sent by backend");
      alert("✅ Signup successful! Check your email for verification code.");
      window.location.href = "verify-code.html";
      return;
    }

    // If backend didn't send OTP automatically, send it manually
    console.log("📤 Sending OTP request...");
    submitBtn.textContent = "Sending verification code...";

    try {
      const otpData = await apiRequest("/auth/send_otp", "POST", { email });
      console.log("📥 OTP response:", otpData);

      if (otpData.success) {
        alert("✅ Signup successful! Check your email for verification code.");
      } else {
        console.warn("⚠️ OTP send failed:", otpData.message);
        alert(`⚠️ Account created! ${otpData.message || "Please click 'Resend code' on the next page."}`);
      }
    } catch (otpError) {
      console.error("❌ OTP send error:", otpError);
      alert("⚠️ Account created! Please click 'Resend code' on the next page to receive OTP.");
    }

    // Redirect to verification page
    window.location.href = "verify-code.html";

  } catch (error) {
    console.error("❌ Signup error:", error);
    alert(`❌ Error: ${error.message || "Server error. Please try again later."}`);
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}
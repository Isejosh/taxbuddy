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
      const response = await fetch(
        `http://localhost:5000/api/auth/sign_up/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
            income,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${formType} signup successful! Redirecting to login...`);
        window.location.href = formType === "Individual"
          ? "individual-login.html"
          : "business-login.html";
      } else {
        alert(`❌ ${data.message || "Signup failed. Please try again."}`);
      }
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

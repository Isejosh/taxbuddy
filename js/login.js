document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  const BASE_URL = "http://localhost:5000/api";

  // ✅ Reusable API helper
  async function apiRequest(endpoint, method, body = null) {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    return response.json();
  }

  // ✅ Handle login
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      alert("⚠️ Please enter both email and password.");
      return;
    }

    try {
      const data = await apiRequest("/auth/sign_in", "POST", {
        email,
        password,
      });

      if (!data.success) {
        alert(`❌ ${data.message || "Login failed. Try again."}`);
        return;
      }

      // Save login info
      localStorage.setItem("token", data.token);
      localStorage.setItem("accountType", data.accountType); // "individual" or "business"
      localStorage.setItem("userId", data.user?._id || data.userId);

      alert("✅ Login successful!");

      // Redirect based on account type
      if (data.accountType === "business") {
        window.location.href = "dashboard_business.html";
      } else {
        window.location.href = "dashboard_individual.html";
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("⚠️ Server connection error. Please try again later.");
    }
  });
});

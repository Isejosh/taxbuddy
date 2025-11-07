document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("⚠️ Please enter both email and password.");
      return;
    }

    try {
      const data = await apiRequest("/auth/sign_in", "POST", { email, password });

      if (!data.success) {
        alert(`❌ ${data.message || "Invalid credentials."}`);
        return;
      }

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("accountType", data.user.accountType || "individual");

      alert("✅ Login successful!");

      // Redirect based on account type
      if (data.user.accountType === "business") {
        window.location.href = "business-dashboard.html";
      } else {
        window.location.href = "individual-dashboard.html";
      }

    } catch (error) {
      console.error("Login error:", error);
      alert("⚠️ Server error. Try again later.");
    }
  });
});

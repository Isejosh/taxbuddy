document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.querySelector(".login_form");

  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      // Step 1: Validate fields
      if (!email || !password) {
        alert("⚠️ Please fill in all fields.");
        return;
      }

      if (!email.includes("@") || !email.includes(".")) {
        alert("⚠️ Please enter a valid email address.");
        return;
      }

      try {
        const data = await apiRequest("/auth/sign_in", "POST", {
          email,
          password,
        });
        // backend should return { token, user } on success; check `data`
        if (data?.token) {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("user", JSON.stringify(data.user || {}));
          alert("✅ Login successful!");
          // Redirect based on account type (backend should return accountType or role)
          const accountType = (data.user && data.user.accountType) || (data.user && data.user.role) || "individual";
          if (typeof accountType === "string" && accountType.toLowerCase() === "business") {
            window.location.href = "dashboard_business.html";
          } else {
            window.location.href = "dashboard_individual.html";
          }
        } else {
          alert(`❌ ${data.message || "Invalid credentials"}`);
        }
      } catch (err) {
        console.error(err);
        alert("⚠️ Server connection error. Please try again later.");
      }
    });
  }
});

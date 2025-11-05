document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.querySelector(".login_form");

  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!email || !password) {
        alert("⚠️ Please fill in all fields.");
        return;
      }

      try {
        const data = await apiRequest("/auth/sign_in", "POST", {
          email,
          password,
          accountType: "individual", // 👈 Explicitly tell backend
        });

        if (data?.token) {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("user", JSON.stringify(data.user || {}));

          // Store user data for dashboard
          if (data.user) {
            localStorage.setItem("userId", data.user.id || data.user._id);
            localStorage.setItem(
              "userName",
              data.user.name || data.user.fullName || data.user.email
            );
            localStorage.setItem("userType", "individual"); // 👈 Force individual
          }

          alert("✅ Login successful!");
          window.location.href = "dashboard_individual.html"; // 👈 Always go to individual dashboard
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

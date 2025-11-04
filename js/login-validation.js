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
        // Step 2: Send login request
        const response = await fetch("http://localhost:5000/api/auth/sign_in", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        // Step 3: Handle response
        if (response.ok) {
          alert("✅ Login successful!");
          // Store token in localStorage
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          // Redirect to dashboard (you can change the page)
          window.location.href = "dashboard.html";
        } else {
          alert(`❌ ${data.message || "Invalid credentials"}`);
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("⚠️ Server connection error. Please try again later.");
      }
    });
  }
});

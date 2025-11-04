document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".login_form");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirm-password");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = passwordInput.value.trim();
    const confirmPassword = confirmInput.value.trim();

    if (!password || !confirmPassword) {
      alert("Please fill in both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Get token from localStorage or URL
    const token = localStorage.getItem("resetToken") || new URLSearchParams(window.location.search).get("token");

    if (!token) {
      alert("Reset token not found. Please restart the password reset process.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/auth/reset_password/${token}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Password reset successful! You can now log in.");
        localStorage.removeItem("resetToken");
        window.location.href = "login.html";
      } else {
        alert(data.message || "Failed to reset password. Try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    }
  });
});

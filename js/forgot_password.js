document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".pword-reset-container");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.querySelector("input[type='text']").value.trim();

    if (!email) {
      alert("⚠️ Please enter your email address.");
      return;
    }

    const data = await apiRequest("/auth/forgot_password", "POST", { email });

    if (data.success) {
      alert("✅ Reset link sent to your email.");
    } else {
      alert(`❌ ${data.message || "Failed to send reset email."}`);
    }
  });
});

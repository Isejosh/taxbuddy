// Pop up screen
   window.addEventListener("load", function() {
  const splash = document.getElementById("splash_screen");
  const main = document.getElementById("main_content");

  // Wait a moment for mobile browsers to fully render
  setTimeout(() => {
    splash.classList.add("hide");
    main.style.display = "flex"; // ensure visible
    setTimeout(() => {
      main.classList.add("show");
    }, 100);
  }, 3500); // splash stays for 3.5 seconds
});



// onboarding.js
const slides = document.querySelectorAll('.onboarding_slide');
const dots = document.querySelectorAll('.dot');
const buttons = document.querySelectorAll('.onboarding_btn');
let current = 0;

buttons.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');

    // If it's the last slide, go to login
    if (current === slides.length - 1) {
      window.location.href = "choose-account.html";
      return;
    }

    current++;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  });
});

//Verify Movement
document.addEventListener("DOMContentLoaded", function() {
  const inputs = document.querySelectorAll(".otp_input");

  inputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      // Only allow numbers
      e.target.value = e.target.value.replace(/[^0-9]/g, "");

      // Move to next field
      if (e.target.value && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });

    input.addEventListener("keydown", (e) => {
      // Move to previous input on backspace
      if (e.key === "Backspace" && !e.target.value && index > 0) {
        inputs[index - 1].focus();
      }
    });

    // Make mobile keyboard numeric
    input.setAttribute("inputmode", "numeric");
    input.setAttribute("pattern", "[0-9]*");
  });
});


//Password
document.addEventListener("DOMContentLoaded", function() {
  const toggleButtons = document.querySelectorAll(".password-toggle");

  toggleButtons.forEach(toggle => {
    toggle.addEventListener("click", () => {
      const input = toggle.previousElementSibling;
      const isPassword = input.type === "password";

      input.type = isPassword ? "text" : "password";

      toggle.classList.toggle("ph-eye");
      toggle.classList.toggle("ph-eye-slash");
    });
  });
});


// Mark as Paid Pop up
  
  const openModal = document.getElementById("openModal");
  const closeModal = document.getElementById("closeModal");
  const confirmPayment = document.getElementById("confirmPayment");
  const modal = document.getElementById("paymentModal");

  // Open modal
  openModal.addEventListener("click", () => {
    modal.style.display = "flex";
  });

  // Close modal
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Redirect to paid page
  confirmPayment.addEventListener("click", () => {
    window.location.href = "tax-history_paid.html?success=true";
  });

  // Close modal if clicked outside
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

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

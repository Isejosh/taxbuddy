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

// Pop up screen
    window.addEventListener("load", function() {
      setTimeout(() => {
        const splash = document.getElementById("splash_screen");
        splash.style.opacity = "0";
        setTimeout(() => {
          splash.style.display = "none";
          document.getElementById("main_content").style.display = "flex";
        }, 600); // wait for fade-out
      }, 3000); // show for 4 seconds
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

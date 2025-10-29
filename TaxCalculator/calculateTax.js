document.addEventListener("DOMContentLoaded", function () {
  const incomeInput = document.querySelector("#incomeInput");
  const calculateBtn = document.querySelector("#calculateBtn");
  const placeholder = document.querySelector(".placeholder");
  const taxBreakdownSection = document.querySelector(".tax_breakdown");
  const taxResult = document.querySelector(".taxbreakdown_result");
  const monthSelect = document.querySelector("#monthSelect");
  const yearSelect = document.querySelector("#yearSelect");

  // Hide tax result at start
  if (taxResult) {
    taxResult.style.display = "none";
    taxResult.style.opacity = "0";
  }

  // Disable calculate button initially
//   calculateBtn.style.backgroundColor = "#a0c59e";

  // Enable button when valid input
  incomeInput?.addEventListener("input", () => {
    if (incomeInput.value.trim() === "" || isNaN(incomeInput.value) || incomeInput.value <= 0) {
      calculateBtn.style.backgroundColor = "#a0c59e";
    } else {
      calculateBtn.style.backgroundColor = "#198754";
    }
  });

  // Calculate button event
  calculateBtn?.addEventListener("click", () => {
    const income = parseFloat(incomeInput.value);
    const month = monthSelect.value.trim();
    const year = yearSelect.value.trim();

    if (!income || income <= 0 || !month || !year) {
      alert("⚠️ Please select a month, year, and enter a valid amount.");
      calculateBtn.style.backgroundColor = "#a0c59e";
      return;
    }

    // Compute tax rate
    const taxRate = income < 25000000 ? 0.2 : 0.3;
    const taxPayable = income * taxRate;
    const effectiveRate = (taxRate * 100).toFixed(2);

    // Hide placeholder, show result in same spot
    if (taxBreakdownSection) taxBreakdownSection.style.display = "none";
    if (taxBreakdownSection) taxBreakdownSection.style.position = "relative";
    if (taxResult) {
      taxResult.style.display = "block";
      taxResult.style.opacity = "1";
    }

    // Update visible result on calculateTax.html
    const totalTaxPayable = document.querySelector(".taxbreakdown_result .card_one h1");
    const effectiveTaxRate = document.querySelector(".taxbreakdown_result .card_two h1");
    const bandName = document.querySelector(".taxbreakdown_result .band p");
    const bandAmount = document.querySelector(".taxbreakdown_result .band h4");
    const bandPercent = document.querySelector(".taxbreakdown_result .tax_band > p");

    if (totalTaxPayable) totalTaxPayable.textContent = `₦${taxPayable.toLocaleString()}`;
    if (effectiveTaxRate) effectiveTaxRate.textContent = `${effectiveRate}%`;
    if (bandName) bandName.textContent = taxRate === 0.2 ? "Small Business CIT" : "Medium/Large Business CIT";
    if (bandAmount) bandAmount.textContent = `₦${taxPayable.toLocaleString()}`;
    if (bandPercent) bandPercent.textContent = `${(taxRate * 100).toFixed(0)}%`;

    // Save data for complete page
    localStorage.setItem(
      "taxData",
      JSON.stringify({
        month,
        year,
        income,
        taxPayable,
        effectiveRate,
        taxRatePercent: taxRate * 100,
      })
    );

    // Redirect automatically after 5 seconds
    setTimeout(() => {
      window.location.href = "./calculation_complete.html";
    }, 8000);
  });

  // --------------------------
  // COMPLETE PAGE LOGIC
  // --------------------------
  const data = JSON.parse(localStorage.getItem("taxData") || "{}");
  if (document.body.classList.contains("complete") && data.income) {
    const date = document.querySelector(".date");

    // Fixed selector: this is your first section (.taxbreakdown_resul)
    const incomeCard1 = document.querySelector(".taxbreakdown_resul .card_one h1");
    const effectiveRateCard1 = document.querySelector(".taxbreakdown_resul .card_two h1");
    const bandAmount1 = document.querySelector(".taxbreakdown_resul .band h4");
    const bandPercent1 = document.querySelector(".taxbreakdown_resul .tax_band > p");

    // Second section (.tax_payable)
    const incomeCard2 = document.querySelector(".tax_payable .card_one h1");
    const taxPayableCard2 = document.querySelector(".tax_payable .card_two h1");
    const effectiveRateCard2 = document.querySelector(".tax_payable .card_two + .card_two h1");
    const bandAmount2 = document.querySelector(".tax_payable .band h4");
    const bandPercent2 = document.querySelector(".tax_payable .tax_band > p");

    if (date) date.textContent = `${data.month} ${data.year}`;

    // Fill first section
    if (incomeCard1) incomeCard1.textContent = `₦${data.income.toLocaleString()}`;
    if (effectiveRateCard1) effectiveRateCard1.textContent = `${data.effectiveRate}%`;
    if (bandAmount1) bandAmount1.textContent = `₦${data.taxPayable.toLocaleString()}`;
    if (bandPercent1) bandPercent1.textContent = `${data.taxRatePercent}%`;

    // Fill second section
    if (incomeCard2) incomeCard2.textContent = `₦${data.income.toLocaleString()}`;
    if (taxPayableCard2) taxPayableCard2.textContent = `₦${data.taxPayable.toLocaleString()}`;
    if (effectiveRateCard2) effectiveRateCard2.textContent = `${data.effectiveRate}%`;
    if (bandAmount2) bandAmount2.textContent = `₦${data.taxPayable.toLocaleString()}`;
    if (bandPercent2) bandPercent2.textContent = `${data.taxRatePercent}%`;

    // "Calculate Another" button
    const calcAnother = document.querySelector(".comp_btn2");
    calcAnother?.addEventListener("click", () => {
      window.location.href = "./calculateTax.html";
    });
  }
});

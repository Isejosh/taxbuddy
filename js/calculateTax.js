document.addEventListener("DOMContentLoaded", function () {
  const incomeInput = document.querySelector("#incomeInput");
  const calculateBtn = document.querySelector("#calculateBtn");
  const placeholder = document.querySelector(".placeholder");
  const taxBreakdownSection = document.querySelector(".tax_breakdown");
  const taxResult = document.querySelector(".taxbreakdown_result");
  const monthSelect = document.querySelector("#monthSelect");
  const yearSelect = document.querySelector("#yearSelect");

  // Hide tax result at start (we'll redirect to complete page instead)
  if (taxResult) {
    taxResult.style.display = "none";
  }

  // Enable button when valid input
  incomeInput?.addEventListener("input", () => {
    if (
      incomeInput.value.trim() === "" ||
      isNaN(incomeInput.value) ||
      incomeInput.value <= 0
    ) {
      calculateBtn.style.backgroundColor = "#a0c59e";
    } else {
      calculateBtn.style.backgroundColor = "#198754";
    }
  });

  // Calculate button event - WITH API INTEGRATION & COMPLETION PAGE REDIRECT
  calculateBtn?.addEventListener("click", async () => {
    const income = parseFloat(incomeInput.value);
    const month = monthSelect.value.trim();
    const year = yearSelect.value.trim();

    if (!income || income <= 0 || !month || !year) {
      alert("⚠️ Please select a month, year, and enter a valid amount.");
      calculateBtn.style.backgroundColor = "#a0c59e";
      return;
    }

    // Show loading state
    calculateBtn.innerHTML =
      '<i class="ph ph-circle-notch"></i> Calculating...';
    calculateBtn.disabled = true;

    try {
      // Get user data
      const userId = getUserId();
      const token = getAuthToken();

      if (!userId || !token) {
        alert("⚠️ Please log in again.");
        window.location.href = "individual-login.html";
        return;
      }

      // Determine tax type based on user account type
      const userType = getUserType();
      const taxType = userType === "business" ? "CIT" : "PIT";

      // Call tax computation API
      const data = await apiRequest(
        `/tax/compute/${userId}`,
        "POST",
        {
          taxType: taxType,
          taxYear: parseInt(year),
          totalIncome: income,
        },
        true
      );

      if (data.success) {
        const taxRecord = data.data;
        const taxPayable = taxRecord.taxAmount;
        const effectiveRate = ((taxPayable / income) * 100).toFixed(2);

        // Store data for complete page - USING THE SAME STRUCTURE YOUR COMPLETE PAGE EXPECTS
        localStorage.setItem(
          "taxData",
          JSON.stringify({
            month: month,
            year: year,
            income: income,
            taxPayable: taxPayable,
            effectiveRate: effectiveRate,
            taxRatePercent: (taxPayable / income) * 100,
            taxRecordId: taxRecord._id, // Store the record ID for saving later
            taxType: taxType,
          })
        );

        // ✅ REDIRECT TO COMPLETION PAGE IMMEDIATELY (no delay)
        window.location.href = "./calculation_complete.html";
      } else {
        alert(`❌ ${data.message || "Tax calculation failed"}`);
      }
    } catch (error) {
      console.error("Tax computation error:", error);
      alert("⚠️ Server connection error. Please try again later.");

      // Fallback to local calculation if API fails
      calculateTaxLocally(income, month, year);
    } finally {
      // Reset button state
      calculateBtn.innerHTML = '<i class="ph ph-calculator"></i> Calculate';
      calculateBtn.disabled = false;
    }
  });

  // Fallback function for local calculation if API fails
  function calculateTaxLocally(income, month, year) {
    const userType = getUserType();
    let taxRate;

    if (userType === "business") {
      taxRate = income < 25000000 ? 0.2 : 0.3;
    } else {
      // Personal Income Tax brackets (simplified)
      if (income <= 300000) {
        taxRate = 0.07;
      } else if (income <= 600000) {
        taxRate = 0.11;
      } else {
        taxRate = 0.15;
      }
    }

    const taxPayable = income * taxRate;
    const effectiveRate = (taxRate * 100).toFixed(2);

    // Store data for complete page
    localStorage.setItem(
      "taxData",
      JSON.stringify({
        month: month,
        year: year,
        income: income,
        taxPayable: taxPayable,
        effectiveRate: effectiveRate,
        taxRatePercent: taxRate * 100,
        taxType: userType === "business" ? "CIT" : "PIT",
      })
    );

    // Redirect to completion page
    window.location.href = "./calculation_complete.html";
  }

  // Utility functions
  function getUserId() {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      return userData.id || userData._id;
    }
    return localStorage.getItem("userId");
  }

  function getAuthToken() {
    return localStorage.getItem("authToken");
  }

  function getUserType() {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      return userData.accountType || userData.role || "individual";
    }
    return localStorage.getItem("userType") || "individual";
  }

  // --------------------------
  // COMPLETE PAGE LOGIC (KEEP THIS - it populates calculation_complete.html)
  // --------------------------
  const data = JSON.parse(localStorage.getItem("taxData") || "{}");
  if (document.body.classList.contains("complete") && data.income) {
    const date = document.querySelector(".date");

    // Fixed selector: this is your first section (.taxbreakdown_resul)
    const incomeCard1 = document.querySelector(
      ".taxbreakdown_resul .card_one h1"
    );
    const effectiveRateCard1 = document.querySelector(
      ".taxbreakdown_resul .card_two h1"
    );
    const bandAmount1 = document.querySelector(".taxbreakdown_resul .band h4");
    const bandPercent1 = document.querySelector(
      ".taxbreakdown_resul .tax_band > p"
    );

    // Second section (.tax_payable)
    const incomeCard2 = document.querySelector(".tax_payable .card_one h1");
    const taxPayableCard2 = document.querySelector(".tax_payable .card_two h1");
    const effectiveRateCard2 = document.querySelector(
      ".tax_payable .card_two + .card_two h1"
    );
    const bandAmount2 = document.querySelector(".tax_payable .band h4");
    const bandPercent2 = document.querySelector(".tax_payable .tax_band > p");

    if (date) date.textContent = `${data.month} ${data.year}`;

    // Fill first section
    if (incomeCard1)
      incomeCard1.textContent = `₦${data.income.toLocaleString()}`;
    if (effectiveRateCard1)
      effectiveRateCard1.textContent = `${data.effectiveRate}%`;
    if (bandAmount1)
      bandAmount1.textContent = `₦${data.taxPayable.toLocaleString()}`;
    if (bandPercent1)
      bandPercent1.textContent = `${data.taxRatePercent.toFixed(0)}%`;

    // Fill second section
    if (incomeCard2)
      incomeCard2.textContent = `₦${data.income.toLocaleString()}`;
    if (taxPayableCard2)
      taxPayableCard2.textContent = `₦${data.taxPayable.toLocaleString()}`;
    if (effectiveRateCard2)
      effectiveRateCard2.textContent = `${data.effectiveRate}%`;
    if (bandAmount2)
      bandAmount2.textContent = `₦${data.taxPayable.toLocaleString()}`;
    if (bandPercent2)
      bandPercent2.textContent = `${data.taxRatePercent.toFixed(0)}%`;

    // "Save to Tracker" button on complete page
    const saveBtn = document.querySelector(".comp_btn1");
    saveBtn?.addEventListener("click", async function () {
      if (!data.taxRecordId) {
        alert(
          "✅ Tax calculation completed! The record has been automatically saved."
        );
        return;
      }

      this.innerHTML = '<i class="ph ph-circle-notch"></i> Saving...';
      this.disabled = true;

      try {
        // The tax record is already created by the compute endpoint
        alert("✅ Tax record saved to your history!");

        // Redirect to tax history
        setTimeout(() => {
          window.location.href = "tax-history.html";
        }, 1500);
      } catch (error) {
        console.error("Save tax error:", error);
        alert("⚠️ Failed to save tax record. Please try again.");
      } finally {
        this.innerHTML = "Save to Tracker";
        this.disabled = false;
      }
    });

    // "Calculate Another" button
    const calcAnother = document.querySelector(".comp_btn2");
    calcAnother?.addEventListener("click", () => {
      window.location.href = "./calculateTax.html";
    });
  }
});

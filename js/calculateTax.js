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

  // Calculate button - LOCAL CALCULATION ONLY
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
    calculateBtn.innerHTML = '<i class="ph ph-circle-notch"></i> Calculating...';
    calculateBtn.disabled = true;

    try {
      // Get user type
      const userType = getUserType();
      const taxType = userType === "business" ? "CIT" : "PIT";

      console.log("📊 Calculating tax locally for:", { income, userType, taxType });

      // Calculate tax based on user type
      let taxPayable, taxRate, effectiveRate;

      if (userType === "business") {
        // Business (CIT) - Corporate Income Tax
        if (income < 25000000) {
          taxRate = 0.20; // 20% for small companies
        } else {
          taxRate = 0.30; // 30% for large companies
        }
        taxPayable = income * taxRate;
        effectiveRate = (taxRate * 100).toFixed(2);
      } else {
        // Individual (PIT) - Personal Income Tax (Nigerian Tax Brackets)
        let tax = 0;
        
        // Nigerian PIT brackets (simplified)
        if (income <= 300000) {
          tax = income * 0.07; // 7%
          taxRate = 0.07;
        } else if (income <= 600000) {
          tax = (300000 * 0.07) + ((income - 300000) * 0.11); // 11%
          taxRate = 0.11;
        } else if (income <= 1100000) {
          tax = (300000 * 0.07) + (300000 * 0.11) + ((income - 600000) * 0.15); // 15%
          taxRate = 0.15;
        } else if (income <= 1600000) {
          tax = (300000 * 0.07) + (300000 * 0.11) + (500000 * 0.15) + ((income - 1100000) * 0.19); // 19%
          taxRate = 0.19;
        } else if (income <= 3200000) {
          tax = (300000 * 0.07) + (300000 * 0.11) + (500000 * 0.15) + (500000 * 0.19) + ((income - 1600000) * 0.21); // 21%
          taxRate = 0.21;
        } else {
          tax = (300000 * 0.07) + (300000 * 0.11) + (500000 * 0.15) + (500000 * 0.19) + (1600000 * 0.21) + ((income - 3200000) * 0.24); // 24%
          taxRate = 0.24;
        }
        
        taxPayable = tax;
        effectiveRate = ((taxPayable / income) * 100).toFixed(2);
      }

      console.log("✅ Tax calculated:", { income, taxPayable, effectiveRate, taxRate });

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
          taxType: taxType,
          userType: userType,
          saved: false, // Mark as not saved yet
        })
      );

      // Redirect to completion page
      window.location.href = "./calculation_complete.html";

    } catch (error) {
      console.error("❌ Tax calculation error:", error);
      alert("⚠️ Error calculating tax. Please try again.");
    } finally {
      // Reset button state
      calculateBtn.innerHTML = '<i class="ph ph-calculator"></i> Calculate';
      calculateBtn.disabled = false;
    }
  });

  // Utility functions
  function getUserId() {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.id || userData._id || userData.userId;
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
    return localStorage.getItem("userId");
  }

  function getAuthToken() {
    return localStorage.getItem("authToken") || localStorage.getItem("token");
  }

  function getUserType() {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.accountType || userData.account_type || userData.role || "individual";
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
    return localStorage.getItem("accountType") || "individual";
  }

  // --------------------------
  // COMPLETE PAGE LOGIC
  // --------------------------
  const data = JSON.parse(localStorage.getItem("taxData") || "{}");
  if (document.body.classList.contains("complete") && data.income) {
    const date = document.querySelector(".date");

    // First section (.taxbreakdown_resul)
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
    if (bandPercent1) bandPercent1.textContent = `${data.taxRatePercent.toFixed(0)}%`;

    // Fill second section
    if (incomeCard2) incomeCard2.textContent = `₦${data.income.toLocaleString()}`;
    if (taxPayableCard2) taxPayableCard2.textContent = `₦${data.taxPayable.toLocaleString()}`;
    if (effectiveRateCard2) effectiveRateCard2.textContent = `${data.effectiveRate}%`;
    if (bandAmount2) bandAmount2.textContent = `₦${data.taxPayable.toLocaleString()}`;
    if (bandPercent2) bandPercent2.textContent = `${data.taxRatePercent.toFixed(0)}%`;

    // "Save to Tracker" button on complete page
    const saveBtn = document.querySelector(".comp_btn1");
    saveBtn?.addEventListener("click", async function () {
      if (data.saved) {
        alert("✅ This tax record has already been saved!");
        window.location.href = "taxHistory.html";
        return;
      }

      this.innerHTML = '<i class="ph ph-circle-notch"></i> Saving...';
      this.disabled = true;

      try {
        const userId = getUserId();
        const token = getAuthToken();

        if (!userId || !token) {
          alert("⚠️ Please log in again.");
          window.location.href = "login.html";
          return;
        }

        console.log("📤 Saving tax record to backend:", data);

        // Send to backend to save
        const response = await apiRequest(
          `/tax/compute/${userId}`,
          "POST",
          {
            taxType: data.taxType,
            taxYear: parseInt(data.year),
            totalIncome: data.income,
            taxAmount: data.taxPayable,
            month: data.month,
          },
          true
        );

        console.log("📥 Save response:", response);

        if (response.success) {
          // Mark as saved
          data.saved = true;
          data.taxRecordId = response.data._id || response.data.id;
          localStorage.setItem("taxData", JSON.stringify(data));

          alert("✅ Tax record saved to your history!");

          // Redirect to tax history
          setTimeout(() => {
            window.location.href = "taxHistory.html";
          }, 1500);
        } else {
          alert(`❌ ${response.message || "Failed to save tax record"}`);
        }
      } catch (error) {
        console.error("❌ Save tax error:", error);
        alert("⚠️ Failed to save tax record. Please try again.");
      } finally {
        this.innerHTML = "Save to Tracker";
        this.disabled = false;
      }
    });

    // "Calculate Another" button
    const calcAnother = document.querySelector(".comp_btn2");
    calcAnother?.addEventListener("click", () => {
      localStorage.removeItem("taxData"); // Clear old data
      window.location.href = "./calculateTax.html";
    });
  }
});
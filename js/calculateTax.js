document.addEventListener("DOMContentLoaded", function () {
  // --------------------------
  // DOM Elements
  // --------------------------
  const incomeInput = document.querySelector("#incomeInput");
  const calculateBtn = document.querySelector("#calculateBtn");
  const monthSelect = document.querySelector("#monthSelect");
  const yearSelect = document.querySelector("#yearSelect");
  const taxResult = document.querySelector(".taxbreakdown_result");

  // Hide tax result at start
  if (taxResult) taxResult.style.display = "none";

  // --------------------------
  // Input validation
  // --------------------------
  incomeInput?.addEventListener("input", () => {
    const value = parseFloat(incomeInput.value);
    if (!value || isNaN(value) || value <= 0) {
      calculateBtn.style.backgroundColor = "#a0c59e";
      calculateBtn.disabled = true;
    } else {
      calculateBtn.style.backgroundColor = "#198754";
      calculateBtn.disabled = false;
    }
  });

  // --------------------------
  // Calculate Button Click
  // --------------------------
  calculateBtn?.addEventListener("click", async () => {
    const income = parseFloat(incomeInput.value);
    const month = monthSelect.value.trim();
    const year = yearSelect.value.trim();

    if (!income || income <= 0 || !month || !year) {
      alert("⚠️ Please select a month, year, and enter a valid amount.");
      return;
    }

    // Loading state
    calculateBtn.innerHTML = '<i class="ph ph-circle-notch"></i> Calculating...';
    calculateBtn.disabled = true;

    try {
      const userType = getUserType();
      const taxType = userType === "business" ? "CIT" : "PIT";

      let taxPayable, taxRate, effectiveRate;

      // --------------------------
      // BUSINESS TAX LOGIC (2026)
      // --------------------------
      if (userType === "business") {
        if (income <= 100000000) {
          taxRate = 0; // Small business exemption
        } else if (income < 25000000) {
          taxRate = 0.15;
        } else {
          taxRate = 0.30; // Minimum effective tax 15% for multinationals handled elsewhere
        }
        taxPayable = income * taxRate;
        effectiveRate = (taxRate * 100).toFixed(2);
      }

      // --------------------------
      // INDIVIDUAL TAX LOGIC (2026)
      // --------------------------
      else {
        const brackets = [
          { limit: 800000, rate: 0.00 },
          { limit: 3000000, rate: 0.15 },
          { limit: 12000000, rate: 0.18 },
          { limit: 25000000, rate: 0.21 },
          { limit: 50000000, rate: 0.23 },
          { limit: Infinity, rate: 0.25 }
        ];

        let tax = 0;
        let prevLimit = 0;

        for (let i = 0; i < brackets.length; i++) {
          const { limit, rate } = brackets[i];
          const taxable = Math.min(income, limit) - prevLimit;
          if (taxable > 0) tax += taxable * rate;
          if (income <= limit) break;
          prevLimit = limit;
        }

        taxPayable = tax;
        taxRate = tax / income;
        effectiveRate = (taxRate * 100).toFixed(2);
      }

      // --------------------------
      // Store Result
      // --------------------------
      const taxData = {
        month,
        year,
        income,
        taxPayable,
        effectiveRate,
        taxRatePercent: (taxRate * 100).toFixed(2),
        taxType,
        userType,
        saved: false,
      };
      localStorage.setItem("taxData", JSON.stringify(taxData));

      // Redirect to completion page
      window.location.href = "./calculation_complete.html";
    } catch (err) {
      console.error("❌ Tax calculation error:", err);
      alert("⚠️ Error calculating tax. Please try again.");
    } finally {
      calculateBtn.innerHTML = '<i class="ph ph-calculator"></i> Calculate';
      calculateBtn.disabled = false;
    }
  });

  // --------------------------
  // Helper functions
  // --------------------------
  function getUserId() {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const u = JSON.parse(user);
        return u.id || u._id || u.userId;
      } catch { return localStorage.getItem("userId"); }
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
        const u = JSON.parse(user);
        return u.accountType || u.account_type || u.role || "individual";
      } catch { return localStorage.getItem("accountType") || "individual"; }
    }
    return localStorage.getItem("accountType") || "individual";
  }

  // --------------------------
  // Completion Page Logic
  // --------------------------
  const data = JSON.parse(localStorage.getItem("taxData") || "{}");
  if (document.body.classList.contains("complete") && data.income) {
    const dateEl = document.querySelector(".date");
    if (dateEl) dateEl.textContent = `${data.month} ${data.year}`;

    const formatNGN = num => num.toLocaleString("en-NG", { style: "currency", currency: "NGN" });

    const updateCard = (incomeEl, taxEl, rateEl, bandAmtEl, bandPctEl) => {
      if (incomeEl) incomeEl.textContent = formatNGN(data.income);
      if (taxEl) taxEl.textContent = formatNGN(data.taxPayable);
      if (rateEl) rateEl.textContent = `${data.effectiveRate}%`;
      if (bandAmtEl) bandAmtEl.textContent = formatNGN(data.taxPayable);
      if (bandPctEl) bandPctEl.textContent = `${data.taxRatePercent}%`;
    };

    updateCard(
      document.querySelector(".taxbreakdown_resul .card_one h1"),
      document.querySelector(".taxbreakdown_resul .band h4"),
      document.querySelector(".taxbreakdown_resul .card_two h1"),
      document.querySelector(".taxbreakdown_resul .band h4"),
      document.querySelector(".taxbreakdown_resul .tax_band > p")
    );

    updateCard(
      document.querySelector(".tax_payable .card_one h1"),
      document.querySelector(".tax_payable .card_two h1"),
      document.querySelector(".tax_payable .card_two + .card_two h1"),
      document.querySelector(".tax_payable .band h4"),
      document.querySelector(".tax_payable .tax_band > p")
    );

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

        const response = await apiRequest(`/tax/compute/${userId}`, "POST", {
          taxType: data.taxType,
          taxYear: parseInt(data.year),
          totalIncome: data.income,
          taxAmount: data.taxPayable,
          month: data.month,
        }, true);

        if (response.success) {
          data.saved = true;
          data.taxRecordId = response.data._id || response.data.id;
          localStorage.setItem("taxData", JSON.stringify(data));
          alert("✅ Tax record saved to your history!");
          setTimeout(() => window.location.href = "tax-history.html", 1500);
        } else {
          alert(`❌ ${response.message || "Failed to save tax record"}`);
        }
      } catch (err) {
        console.error("❌ Save tax error:", err);
        alert("⚠️ Failed to save tax record. Please try again.");
      } finally {
        this.innerHTML = "Save to Tracker";
        this.disabled = false;
      }
    });

    const calcAnother = document.querySelector(".comp_btn2");
    calcAnother?.addEventListener("click", () => {
      localStorage.removeItem("taxData");
      window.location.href = "./calculateTax.html";
    });
  }
});

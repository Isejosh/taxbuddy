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

      if (userType === "business") {
        taxRate = income < 25000000 ? 0.20 : 0.30;
        taxPayable = income * taxRate;
        effectiveRate = (taxRate * 100).toFixed(2);
      } else {
        // Individual PIT brackets
        if (income <= 300000) taxRate = 0.07;
        else if (income <= 600000) taxRate = 0.11;
        else if (income <= 1100000) taxRate = 0.15;
        else if (income <= 1600000) taxRate = 0.19;
        else if (income <= 3200000) taxRate = 0.21;
        else taxRate = 0.24;

        // Calculate tax progressively
        let tax = 0;
        let brackets = [
          { limit: 300000, rate: 0.07 },
          { limit: 600000, rate: 0.11 },
          { limit: 1100000, rate: 0.15 },
          { limit: 1600000, rate: 0.19 },
          { limit: 3200000, rate: 0.21 },
        ];
        let remaining = income;

        for (let i = 0; i < brackets.length; i++) {
          const { limit, rate } = brackets[i];
          const prevLimit = i === 0 ? 0 : brackets[i - 1].limit;
          const taxable = Math.min(remaining, limit - prevLimit);
          if (taxable > 0) tax += taxable * rate;
        }
        if (income > 3200000) tax += (income - 3200000) * 0.24;

        taxPayable = tax;
        effectiveRate = ((taxPayable / income) * 100).toFixed(2);
      }

      // Store for completion page
      const taxData = {
        month,
        year,
        income,
        taxPayable,
        effectiveRate,
        taxRatePercent: taxRate * 100,
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
  // Complete Page Logic
  // --------------------------
  const data = JSON.parse(localStorage.getItem("taxData") || "{}");
  if (document.body.classList.contains("complete") && data.income) {
    const dateEl = document.querySelector(".date");
    if (dateEl) dateEl.textContent = `${data.month} ${data.year}`;

    // Helper to format Naira
    const formatNGN = num => num.toLocaleString("en-NG", { style: "currency", currency: "NGN" });

    const updateCard = (incomeEl, taxEl, rateEl, bandAmtEl, bandPctEl) => {
      if (incomeEl) incomeEl.textContent = formatNGN(data.income);
      if (taxEl) taxEl.textContent = formatNGN(data.taxPayable);
      if (rateEl) rateEl.textContent = `${data.effectiveRate}%`;
      if (bandAmtEl) bandAmtEl.textContent = formatNGN(data.taxPayable);
      if (bandPctEl) bandPctEl.textContent = `${data.taxRatePercent.toFixed(0)}%`;
    };

    // First section
    updateCard(
      document.querySelector(".taxbreakdown_resul .card_one h1"),
      document.querySelector(".taxbreakdown_resul .band h4"),
      document.querySelector(".taxbreakdown_resul .card_two h1"),
      document.querySelector(".taxbreakdown_resul .band h4"),
      document.querySelector(".taxbreakdown_resul .tax_band > p")
    );

    // Second section
    updateCard(
      document.querySelector(".tax_payable .card_one h1"),
      document.querySelector(".tax_payable .card_two h1"),
      document.querySelector(".tax_payable .card_two + .card_two h1"),
      document.querySelector(".tax_payable .band h4"),
      document.querySelector(".tax_payable .tax_band > p")
    );

    // Save button
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

    // Calculate Another
    const calcAnother = document.querySelector(".comp_btn2");
    calcAnother?.addEventListener("click", () => {
      localStorage.removeItem("taxData");
      window.location.href = "./calculateTax.html";
    });
  }
});

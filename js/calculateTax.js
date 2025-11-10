document.addEventListener("DOMContentLoaded", function () {
  const incomeInput = document.querySelector("#incomeInput");
  const calculateBtn = document.querySelector("#calculateBtn");
  const monthSelect = document.querySelector("#monthSelect");
  const yearSelect = document.querySelector("#yearSelect");

  // API Base URL - Updated to your deployed backend
  const API_BASE_URL = "https://tax-tracker-backend.onrender.com/api";

  // Enable button when valid input
  incomeInput?.addEventListener("input", () => {
    if (incomeInput.value.trim() === "" || isNaN(incomeInput.value) || incomeInput.value <= 0) {
      calculateBtn.style.backgroundColor = "#a0c59e";
    } else {
      calculateBtn.style.backgroundColor = "#198754";
    }
  });

  // Calculate button
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
          taxRate = 0.20;
        } else {
          taxRate = 0.30;
        }
        taxPayable = income * taxRate;
        effectiveRate = (taxRate * 100).toFixed(2);
      } else {
        // Individual (PIT) - Personal Income Tax
        let tax = 0;
        
        if (income <= 300000) {
          tax = income * 0.07;
          taxRate = 0.07;
        } else if (income <= 600000) {
          tax = (300000 * 0.07) + ((income - 300000) * 0.11);
          taxRate = 0.11;
        } else if (income <= 1100000) {
          tax = (300000 * 0.07) + (300000 * 0.11) + ((income - 600000) * 0.15);
          taxRate = 0.15;
        } else if (income <= 1600000) {
          tax = (300000 * 0.07) + (300000 * 0.11) + (500000 * 0.15) + ((income - 1100000) * 0.19);
          taxRate = 0.19;
        } else if (income <= 3200000) {
          tax = (300000 * 0.07) + (300000 * 0.11) + (500000 * 0.15) + (500000 * 0.19) + ((income - 1600000) * 0.21);
          taxRate = 0.21;
        } else {
          tax = (300000 * 0.07) + (300000 * 0.11) + (500000 * 0.15) + (500000 * 0.19) + (1600000 * 0.21) + ((income - 3200000) * 0.24);
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
          saved: false,
        })
      );

      console.log("💾 Tax data saved to localStorage");
      window.location.href = "./calculation_complete.html";

    } catch (error) {
      console.error("❌ Tax calculation error:", error);
      alert("⚠️ Error calculating tax. Please try again.");
    } finally {
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
    console.log("🎯 Loading complete page with data:", data);
    
    const date = document.querySelector(".date");

    // SECTION 1: .taxbreakdown_resul (top section)
    const section1Cards = document.querySelectorAll(".taxbreakdown_resul .bdc h1");
    const section1Band = document.querySelector(".taxbreakdown_resul .band h4");
    const section1Percent = document.querySelector(".taxbreakdown_resul .tax_band > p");

    // SECTION 2: .tax_payable (bottom section)
    const section2Cards = document.querySelectorAll(".tax_payable .bdc h1");
    const section2Band = document.querySelector(".tax_payable .band h4");
    const section2Percent = document.querySelector(".tax_payable .tax_band > p");

    // Update date
    if (date) {
      date.textContent = `${data.month} ${data.year}`;
      console.log("✅ Date updated:", date.textContent);
    }

    // SECTION 1: Fill first section (2 cards)
    if (section1Cards.length >= 2) {
      section1Cards[0].textContent = `₦${data.income.toLocaleString()}`;
      section1Cards[1].textContent = `${data.effectiveRate}%`;
      console.log("✅ Section 1 cards updated");
    }
    
    if (section1Band) {
      section1Band.textContent = `₦${data.taxPayable.toLocaleString()}`;
      console.log("✅ Section 1 band updated");
    }
    
    if (section1Percent) {
      section1Percent.textContent = `${data.taxRatePercent.toFixed(0)}%`;
      console.log("✅ Section 1 percent updated");
    }

    // SECTION 2: Fill second section (3 cards)
    if (section2Cards.length >= 3) {
      section2Cards[0].textContent = `₦${data.income.toLocaleString()}`;
      section2Cards[1].textContent = `₦${data.taxPayable.toLocaleString()}`;
      section2Cards[2].textContent = `${data.effectiveRate}%`;
      console.log("✅ Section 2 cards updated");
    }
    
    if (section2Band) {
      section2Band.textContent = `₦${data.taxPayable.toLocaleString()}`;
      console.log("✅ Section 2 band updated");
    }
    
    if (section2Percent) {
      section2Percent.textContent = `${data.taxRatePercent.toFixed(0)}%`;
      console.log("✅ Section 2 percent updated");
    }

    console.log("✅ All page elements updated with tax data");

    // "Save to Tracker" button on complete page - USING CORRECT ENDPOINT
    const saveBtn = document.querySelector(".comp_btn1");
    saveBtn?.addEventListener("click", async function () {
      console.log("💾 Save to Tracker clicked");
      console.log("Current data:", data);
      
      if (data.saved) {
        alert("✅ This tax record has already been saved!");
        window.location.href = "tax-history.html";
        return;
      }

      this.innerHTML = '<i class="ph ph-circle-notch ph-spin"></i> Saving...';
      this.disabled = true;

      try {
        const userId = getUserId();
        const token = getAuthToken();

        console.log("🔑 Auth check:", { userId, hasToken: !!token });

        if (!userId || !token) {
          alert("⚠️ Please log in again.");
          window.location.href = "login.html";
          return;
        }

        // CORRECT ENDPOINT AND DATA STRUCTURE FROM POSTMAN
        const requestBody = {
          taxType: data.taxType,
          startDate: `${data.year}-01-01`, // Using year as start date
          endDate: `${data.year}-12-31`,   // Using year as end date
          turnover: data.income,           // Using 'turnover' field from Postman
          month: data.month
        };

        console.log("📤 Saving tax record to backend:", requestBody);

        const response = await fetch(`${API_BASE_URL}/tax/compute/${userId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody)
        });

        console.log("📥 Response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log("📥 Save response:", responseData);

        if (responseData.success) {
          // Mark as saved
          data.saved = true;
          data.taxRecordId = responseData.data._id || responseData.data.id;
          localStorage.setItem("taxData", JSON.stringify(data));

          console.log("✅ Tax record saved successfully!");
          alert("✅ Tax record saved to your history!");

          // Redirect to tax history
          setTimeout(() => {
            window.location.href = "tax-history.html";
          }, 1500);
        } else {
          console.error("❌ Save failed:", responseData.message);
          alert(`❌ ${responseData.message || "Failed to save tax record"}`);
        }
      } catch (error) {
        console.error("❌ Save tax error:", error);
        alert(`⚠️ Failed to save tax record: ${error.message}`);
      } finally {
        this.innerHTML = "Save to Tracker";
        this.disabled = false;
      }
    });

    // "Calculate Another" button
    const calcAnother = document.querySelector(".comp_btn2");
    calcAnother?.addEventListener("click", () => {
      console.log("🔄 Calculate Another clicked");
      localStorage.removeItem("taxData");
      window.location.href = "./calculateTax.html";
    });
  } else if (document.body.classList.contains("complete")) {
    console.warn("⚠️ No tax data found in localStorage!");
    setTimeout(() => {
      window.location.href = "./calculateTax.html";
    }, 2000);
  }
});
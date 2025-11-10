(function () {
  const API_BASE_URL = "https://tax-tracker-backend.onrender.com/api";
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("authToken") || localStorage.getItem("token");

  const recordsContainer = document.getElementById("recordsContainer") || document.querySelector(".records-container");
  const emptyState = document.getElementById("emptyState") || document.querySelector(".empty-state");
  const monthSelect = document.getElementById("monthFilter") || document.querySelector('select[name="month"]');
  const yearSelect = document.getElementById("yearFilter") || document.querySelector('select[name="year"]');
  const tabs = Array.from(document.querySelectorAll(".tab"));

  const summaryEls = {
    total: document.getElementById("totalRecords"),
    paid: document.getElementById("paidCount"),
    unpaid: document.getElementById("unpaidCount"),
    amount: document.getElementById("paidAmount")
  };

  const paymentModal = document.getElementById("paymentModal");
  const modalPeriod = document.getElementById("modalPeriod");
  const modalAmount = document.getElementById("modalAmount");
  const closeModalBtn = document.getElementById("closeModal");
  const confirmPaymentBtn = document.getElementById("confirmPayment");
  const toast = document.getElementById("successToast");

  let activeStatus = "";
  let selectedRecord = null;

  function authHeaders() {
    return token
      ? { 
          Authorization: "Bearer " + token, 
          "Content-Type": "application/json" 
        }
      : { "Content-Type": "application/json" };
  }

  function showEmpty(msg) {
    if (emptyState) emptyState.style.display = "flex";
    if (recordsContainer) recordsContainer.style.display = "none";
    const emptyText = document.getElementById("emptyText");
    if (msg && emptyText) emptyText.textContent = msg;
  }

  function showRecords() {
    if (emptyState) emptyState.style.display = "none";
    if (recordsContainer) recordsContainer.style.display = "block";
  }

  async function fetchTaxRecords() {
    if (!userId || !token) {
      showEmpty("Please log in to view tax history.");
      return;
    }

    try {
      const url = `${API_BASE_URL}/tax/records/${userId}`;
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const payload = await res.json();

      if (!payload.success || !payload.data || payload.data.length === 0) {
        showEmpty("No tax records found. Calculate your first tax to see history.");
        updateSummary([]);
        return;
      }

      // Process records safely
      const records = payload.data.map(record => {
        const totalIncome = parseFloat(record.totalIncome || record.income || record.turnover || 0);
        const taxAmount = parseFloat(record.taxAmount || record.taxPayable || 0);
        const paidStatus = record.isPaid ? "paid" : "unpaid";
        const period = record.month && record.taxYear
          ? `${record.month} ${record.taxYear}`
          : record.createdAt
          ? new Date(record.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          : "N/A";

        return {
          id: record._id || record.id,
          period,
          taxableIncome: `₦${totalIncome.toLocaleString()}`,
          taxAmount: `₦${taxAmount.toLocaleString()}`,
          paidStatus,
          paidAmount: paidStatus === "paid" ? taxAmount : 0,
          rawIncome: totalIncome,
          rawTaxAmount: taxAmount,
          month: record.month,
          year: record.taxYear
        };
      });

      updateSummary(records);
      renderRecords(records);
      showRecords();
    } catch (err) {
      console.error("❌ fetchTaxRecords error:", err);
      showEmpty("Failed to load tax history. Please try again later.");
    }
  }

  function updateSummary(records) {
    const paid = records.filter(r => r.paidStatus === "paid");
    const unpaid = records.filter(r => r.paidStatus === "unpaid");
    const totalPaidAmount = paid.reduce((sum, r) => sum + (r.paidAmount || 0), 0);

    if (summaryEls.total) summaryEls.total.textContent = records.length;
    if (summaryEls.paid) summaryEls.paid.textContent = paid.length;
    if (summaryEls.unpaid) summaryEls.unpaid.textContent = unpaid.length;
    if (summaryEls.amount) summaryEls.amount.textContent = "₦" + totalPaidAmount.toLocaleString();
  }

  function formatCard(record) {
    const isPaid = record.paidStatus === "paid";
    const paidOn = isPaid && record.paidOn !== "Not Paid"
      ? new Date(record.paidOn).toLocaleDateString()
      : "Pending";
    
    return `
      <div class="paid-state" data-id="${record.id}">
        <div class="paid-top">
          <p class="paid-top_head">${record.period}</p>
          <p class="paid-top_body ${isPaid ? "paid_green" : ""}">${isPaid ? "Paid" : "Unpaid"}</p>
        </div>
        <div class="paid-middle">
          <div class="paid-text">
            <p class="paid-text_top">Income</p>
            <p class="paid-text_bottom">${record.taxableIncome}</p>
          </div>
          <div class="paid-text">
            <p class="paid-text_top">Tax Amount</p>
            <p class="paid-text_bottom">${record.taxAmount}</p>
          </div>
        </div>
        <div class="paid-bottom">
          <div class="paid-text">
            <p class="paid-text_top">${isPaid ? "Paid On" : "Due Date"}</p>
            <p class="paid-text_bottom">${paidOn}</p>
          </div>
        </div>
        ${isPaid ? '' : `<button class="paid-btn unpaid-btn mark-as-paid" data-id="${record.id}">
          <i class="ph ph-check"></i> Mark as Paid
        </button>`}
      </div>
    `;
  }

  function renderRecords(records) {
    if (!recordsContainer) return;
    recordsContainer.innerHTML = "";
    records.forEach(record => recordsContainer.insertAdjacentHTML("beforeend", formatCard(record)));

    document.querySelectorAll(".mark-as-paid").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const record = records.find(r => String(r.id) === String(id));
        if (record) openPaymentModal(record);
      });
    });
  }

  function openPaymentModal(record) {
    selectedRecord = record;
    if (modalPeriod) modalPeriod.textContent = record.period;
    if (modalAmount) modalAmount.textContent = record.taxAmount;
    if (paymentModal) {
      paymentModal.classList.add("show");
      paymentModal.setAttribute("aria-hidden", "false");
    }
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      if (paymentModal) {
        paymentModal.classList.remove("show");
        paymentModal.setAttribute("aria-hidden", "true");
      }
      selectedRecord = null;
    });
  }

  async function markAsPaidRequest(recordId) {
    if (!userId || !token) return { success: false, message: "Not authenticated" };
    try {
      const url = `${API_BASE_URL}/tax/mark-paid/${userId}/${recordId}`;
      const requestBody = {
        amount: selectedRecord.rawTaxAmount,
        paidOn: new Date().toISOString().split('T')[0]
      };
      const res = await fetch(url, { method: "PATCH", headers: authHeaders(), body: JSON.stringify(requestBody) });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return await res.json();
    } catch (err) {
      console.error("❌ markAsPaidRequest error:", err);
      return { success: false, message: "Request failed: " + err.message };
    }
  }

  if (confirmPaymentBtn) {
    confirmPaymentBtn.addEventListener("click", async () => {
      if (!selectedRecord) return;
      confirmPaymentBtn.disabled = true;
      confirmPaymentBtn.textContent = "Processing...";
      const resp = await markAsPaidRequest(selectedRecord.id);
      confirmPaymentBtn.disabled = false;
      confirmPaymentBtn.textContent = "Confirm Payment";
      if (resp && resp.success) {
        if (paymentModal) paymentModal.classList.remove("show");
        showToast();
        selectedRecord = null;
        setTimeout(fetchTaxRecords, 500);
      } else {
        alert(`❌ ${resp?.message || "Failed to mark as paid"}`);
      }
    });
  }

  function showToast() {
    if (toast) {
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 3000);
    } else {
      alert("✅ Payment marked successfully!");
    }
  }

  // Tabs
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      activeStatus = tab.getAttribute("data-status") || "";
      fetchTaxRecords();
    });
  });

  if (monthSelect) monthSelect.addEventListener("change", fetchTaxRecords);
  if (yearSelect) yearSelect.addEventListener("change", fetchTaxRecords);

  console.log("🚀 Initializing tax history...");
  fetchTaxRecords();
})();

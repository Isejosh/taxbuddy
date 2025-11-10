(function () {
  const apiBase = "https://tax-tracker-backend.onrender.com/api/tax";
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
      ? { Authorization: "Bearer " + token, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };
  }

  function showEmpty(msg) {
    if (emptyState) {
      emptyState.style.display = "flex";
    }
    if (recordsContainer) {
      recordsContainer.style.display = "none";
    }
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

    const month = monthSelect?.value || "";
    const year = yearSelect?.value || "";
    const params = new URLSearchParams();
    if (month && month !== "Month") params.append("month", month);
    if (year) params.append("year", year);
    if (activeStatus) params.append("status", activeStatus);

    const url = `${apiBase}/records/${userId}?${params.toString()}`;
    
    console.log("📤 Fetching tax records:", url);
    
    try {
      const res = await fetch(url, { headers: authHeaders() });
      const payload = await res.json();

      console.log("📥 Tax records response:", payload);

      if (!payload.success || !payload.data || payload.data.length === 0) {
        showEmpty("No tax records found. Calculate your first tax to see history.");
        updateSummary([]);
        return;
      }

      // Process records to ensure proper format
      const records = payload.data.map(record => ({
        id: record.id || record._id,
        period: record.month ? `${record.month} ${record.taxYear}` : record.period || "N/A",
        taxableIncome: record.totalIncome ? `₦${record.totalIncome.toLocaleString()}` : record.taxableIncome || "₦0",
        taxAmount: record.taxAmount ? `₦${record.taxAmount.toLocaleString()}` : "₦0",
        paidStatus: record.paidStatus || (record.isPaid ? "paid" : "unpaid"),
        paidOn: record.paidOn || record.paidDate || "Not Paid",
        paidAmount: record.paidAmount || record.taxAmount || 0
      }));

      console.log("✅ Processed records:", records);

      updateSummary(records);
      renderRecords(records);
      showRecords();
    } catch (err) {
      console.error("❌ fetchTaxRecords error", err);
      showEmpty("Failed to load tax history. Try again later.");
    }
  }

  function updateSummary(records) {
    const paid = records.filter(r => r.paidStatus === "paid");
    const unpaid = records.filter(r => r.paidStatus === "unpaid");
    const totalPaidAmount = paid.reduce((sum, r) => {
      const amount = typeof r.paidAmount === 'number' ? r.paidAmount : 0;
      return sum + amount;
    }, 0);

    if (summaryEls.total) summaryEls.total.textContent = records.length;
    if (summaryEls.paid) summaryEls.paid.textContent = paid.length;
    if (summaryEls.unpaid) summaryEls.unpaid.textContent = unpaid.length;
    if (summaryEls.amount) summaryEls.amount.textContent = "₦" + totalPaidAmount.toLocaleString();
  }

  function formatCard(record) {
    const isPaid = record.paidStatus === "paid";
    const paidOn = record.paidOn === "Not Paid" ? "Pending" : new Date(record.paidOn).toLocaleDateString();
    
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
        ${isPaid ? "" : `<button class="paid-btn unpaid-btn mark-as-paid" data-id="${record.id}"><i class="ph ph-check"></i> Mark as Paid</button>`}
      </div>
    `;
  }

  function renderRecords(records) {
    if (!recordsContainer) return;
    
    recordsContainer.innerHTML = "";
    records.forEach(r => recordsContainer.insertAdjacentHTML("beforeend", formatCard(r)));

    document.querySelectorAll(".mark-as-paid").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const rec = records.find(x => String(x.id) === String(id));
        if (!rec) return;
        openPaymentModal(rec);
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
      const url = `${apiBase}/mark-paid/${userId}/${recordId}`;
      console.log("📤 Marking as paid:", url);
      
      const res = await fetch(url, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ 
          paidOn: new Date().toISOString(),
          amount: selectedRecord ? parseFloat(selectedRecord.taxAmount.replace(/[₦,]/g, "")) : 0
        })
      });
      
      const data = await res.json();
      console.log("📥 Mark as paid response:", data);
      
      return data;
    } catch (err) {
      console.error("❌ markAsPaidRequest error", err);
      return { success: false, error: "Request failed" };
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
        fetchTaxRecords();
      } else {
        alert(`❌ ${resp.message || "Failed to mark as paid. Try again."}`);
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

  tabs.forEach(t => {
    t.addEventListener("click", () => {
      tabs.forEach(x => x.classList.remove("active"));
      t.classList.add("active");
      activeStatus = t.getAttribute("data-status") || "";
      fetchTaxRecords();
    });
  });

  if (monthSelect) monthSelect.addEventListener("change", fetchTaxRecords);
  if (yearSelect) yearSelect.addEventListener("change", fetchTaxRecords);

  // Initial load
  fetchTaxRecords();
})();
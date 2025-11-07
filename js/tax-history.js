(function () {
  const apiBase = "https://tax-tracker-backend.onrender.com/api/tax";
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("authToken");

  const recordsContainer = document.getElementById("recordsContainer");
  const emptyState = document.getElementById("emptyState");
  const monthSelect = document.getElementById("monthFilter");
  const yearSelect = document.getElementById("yearFilter");
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
    emptyState.style.display = "flex";
    recordsContainer.style.display = "none";
    if (msg) document.getElementById("emptyText").textContent = msg;
  }

  function showRecords() {
    emptyState.style.display = "none";
    recordsContainer.style.display = "block";
  }

  async function fetchTaxRecords() {
    if (!userId || !token) {
      showEmpty("Please log in to view tax history.");
      return;
    }

    const month = monthSelect.value || "";
    const year = yearSelect.value || "";
    const params = new URLSearchParams();
    if (month) params.append("month", month);
    if (year) params.append("year", year);
    if (activeStatus) params.append("status", activeStatus);

    const url = `${apiBase}/records/${userId}?${params.toString()}`;
    try {
      const res = await fetch(url, { headers: authHeaders() });
      const payload = await res.json();

      if (!payload.success || !Array.isArray(payload.data) || payload.data.length === 0) {
        showEmpty("No tax records found. Calculate your first tax to see history.");
        updateSummary([]);
        return;
      }

      updateSummary(payload.data);
      renderRecords(payload.data);
      showRecords();
    } catch (err) {
      console.error("fetchTaxRecords error", err);
      showEmpty("Failed to load tax history. Try again later.");
    }
  }

  function updateSummary(records) {
    const paid = records.filter(r => r.paidStatus === "paid");
    const unpaid = records.filter(r => r.paidStatus === "unpaid");
    const totalPaidAmount = paid.reduce((sum, r) => {
      const n = Number(String(r.paidAmount || r.taxAmount).replace(/[₦,]/g, ""));
      return sum + (isNaN(n) ? 0 : n);
    }, 0);

    summaryEls.total.textContent = records.length;
    summaryEls.paid.textContent = paid.length;
    summaryEls.unpaid.textContent = unpaid.length;
    summaryEls.amount.textContent = "₦" + totalPaidAmount.toLocaleString();
  }

  function formatCard(record) {
    const paidOn = record.paidOn || "Not Paid";
    const isPaid = record.paidStatus === "paid";
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
    modalPeriod.textContent = record.period;
    modalAmount.textContent = record.taxAmount;
    paymentModal.classList.add("show");
    paymentModal.setAttribute("aria-hidden", "false");
  }

  closeModalBtn.addEventListener("click", () => {
    paymentModal.classList.remove("show");
    paymentModal.setAttribute("aria-hidden", "true");
    selectedRecord = null;
  });

  async function markAsPaidRequest(recordId) {
    if (!userId || !token) return;
    try {
      const url = `${apiBase}/mark-paid/${userId}/${recordId}`;
      const res = await fetch(url, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ paidOn: new Date().toISOString() })
      });
      return await res.json();
    } catch (err) {
      console.error("markAsPaidRequest error", err);
      return { success: false, error: "Request failed" };
    }
  }

  confirmPaymentBtn.addEventListener("click", async () => {
    if (!selectedRecord) return;
    confirmPaymentBtn.disabled = true;
    confirmPaymentBtn.textContent = "Processing...";
    const resp = await markAsPaidRequest(selectedRecord.id);
    confirmPaymentBtn.disabled = false;
    confirmPaymentBtn.textContent = "Confirm Payment";
    if (resp && resp.success) {
      paymentModal.classList.remove("show");
      showToast();
      selectedRecord = null;
      fetchTaxRecords();
    } else {
      alert("Failed to mark as paid. Try again.");
    }
  });

  function showToast() {
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
  }

  tabs.forEach(t => {
    t.addEventListener("click", () => {
      tabs.forEach(x => x.classList.remove("active"));
      t.classList.add("active");
      activeStatus = t.getAttribute("data-status") || "";
      fetchTaxRecords();
    });
  });

  monthSelect.addEventListener("change", fetchTaxRecords);
  yearSelect.addEventListener("change", fetchTaxRecords);

  document.addEventListener("DOMContentLoaded", fetchTaxRecords);
})();

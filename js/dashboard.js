const BASE_URL = 'http://localhost:5000/api';
const userId = localStorage.getItem('userId'); // Assuming you store userId after login

// Fetch Income/Expense Summary
async function fetchFinancialSummary(month, year) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/income-expense/${userId}/summary?month=${month}&year=${year}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch summary');

        const data = await response.json();
        updateDashboard(data);
    } catch (error) {
        console.error('Error fetching financial summary:', error);
    }
}

// Update Dashboard with fetched data
function updateDashboard(data) {
    // Update Total Income card
    document.querySelector('.tax-income h1').textContent = `₦${data.totalIncome.toLocaleString()}`;
    
    // You can also calculate and update other cards if needed
    // For example, if you have tax calculation logic:
    // const taxPayable = calculateTax(data.totalIncome);
    // document.querySelector('.tax-payable h1').textContent = `₦${taxPayable.toLocaleString()}`;
}

// Event listeners for month/year filters
document.querySelector('select[name="month"]').addEventListener('change', (e) => {
    const month = e.target.value;
    const year = document.querySelector('select[name="year"]').value;
    fetchFinancialSummary(month, year);
});

document.querySelector('select[name="year"]').addEventListener('change', (e) => {
    const year = e.target.value;
    const month = document.querySelector('select[name="month"]').value;
    fetchFinancialSummary(month, year);
});

// Load data on page load
window.addEventListener('DOMContentLoaded', () => {
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' }).toLowerCase();
    const currentYear = new Date().getFullYear();
    fetchFinancialSummary(currentMonth, currentYear);
});
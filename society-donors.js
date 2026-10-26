if (requireAuthOrRedirect()) {
  loadSocietyDonorsData();
}
renderBackButton();

async function loadSocietyDonorsData() {
  try {
    const homeData = await apiRequest('/home');
    renderAppBar(homeData.user.accountType);
    if (homeData.user.accountType !== ACCOUNT_TYPES.SOCIETY) {
      window.location.href = 'home.html';
      return;
    }
    const data = await apiRequest('/society/donors');
    renderDonorsPageData(data);
  } catch (error) {
    clearToken();
    window.location.href = 'login.html';
  }
}

function renderDonorsPageData(data) {
  document.getElementById('bags-count').textContent = data.bloodBagsCollected + ' bags collected so far';
  const tableBody = document.getElementById('attached-donors');
  tableBody.innerHTML = data.attachedDonorList.map(function (donor) {
    const eligibilityHtml = donor.isEligibleToDonate
      ? '<span class="badge-eligible">Eligible</span>'
      : '<span class="badge-waiting">' + donor.daysUntilEligible + 'd left</span>';
    return '<tr><td>' + donor.fullName + '</td><td>' + donor.email + '</td><td>' + donor.bloodGroup + '</td><td>' + donor.city + '</td><td>' + eligibilityHtml + '</td></tr>';
  }).join('');
}

document.getElementById('add-bag-form').addEventListener('submit', async function (event) {
  event.preventDefault();
  try {
    await apiRequest('/bags/add', { method: 'POST' });
    const data = await apiRequest('/society/donors');
    renderDonorsPageData(data);
  } catch (error) {
    // count stays as-is if this fails
  }
});

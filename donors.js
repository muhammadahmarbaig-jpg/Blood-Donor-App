if (requireAuthOrRedirect()) {
  loadHomeAccountType().then(function () { searchDonors('', ''); });
}
renderBackButton();

async function loadHomeAccountType() {
  try {
    const data = await apiRequest('/home');
    renderAppBar(data.user.accountType);
  } catch (error) {
    clearToken();
    window.location.href = 'login.html';
  }
}

async function searchDonors(bloodGroup, city) {
  const params = new URLSearchParams();
  if (bloodGroup) params.set('bloodGroup', bloodGroup);
  if (city) params.set('city', city);

  const data = await apiRequest('/donors?' + params.toString());
  const resultsBody = document.getElementById('donor-results');

  resultsBody.innerHTML = data.donorList.map(function (donor) {
    const lastDonationText = donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleString() : 'Not donated yet';
    const eligibilityHtml = donor.isEligibleToDonate
      ? '<span class="badge-eligible">Eligible</span>'
      : '<span class="badge-waiting">' + donor.daysUntilEligible + 'd left</span>';
    return '<tr><td>' + donor.fullName + '</td><td>' + donor.email + '</td><td>' + donor.bloodGroup + '</td><td>' + donor.city + '</td><td>' + lastDonationText + '</td><td>' + eligibilityHtml + '</td></tr>';
  }).join('');
}

document.getElementById('search-form').addEventListener('submit', function (event) {
  event.preventDefault();
  searchDonors(document.getElementById('bloodGroup-filter').value, document.getElementById('city-filter').value);
});

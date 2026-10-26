let currentProfileData = null;

if (requireAuthOrRedirect()) {
  loadProfileData();
}
renderBackButton();

const successMessageBox = document.getElementById('success-message');
const errorMessageBox = document.getElementById('error-message');
const editForm = document.getElementById('edit-profile-form');
const donorOnlyFields = document.getElementById('donor-only-fields');
const riderOnlyFields = document.getElementById('rider-only-fields');

async function loadProfileData() {
  try {
    const data = await apiRequest('/profile');
    currentProfileData = data;
    renderAppBar(data.user.accountType);
    renderProfileTable(data);
  } catch (error) {
    clearToken();
    window.location.href = 'login.html';
  }
}

function renderProfileTable(data) {
  const table = document.getElementById('profile-table');
  let rowsHtml =
    '<tr><td>Full Name</td><td>' + data.user.fullName + '</td></tr>' +
    '<tr><td>Email</td><td>' + data.user.email + '</td></tr>' +
    '<tr><td>City</td><td>' + data.user.city + '</td></tr>';

  if (data.user.accountType === ACCOUNT_TYPES.DONOR) {
    const lastDonationText = data.user.lastDonationDate
      ? new Date(data.user.lastDonationDate).toLocaleString()
      : 'Not donated yet';
    const attachedSocietyText = data.user.attachedSociety ? data.user.attachedSociety.fullName : 'Not attached';
    const eligibilityHtml = data.ownEligibility.isEligible
      ? '<span class="badge-eligible">Eligible to donate now</span>'
      : '<span class="badge-waiting">Eligible in ' + data.ownEligibility.daysRemaining + ' day(s)</span>';

    rowsHtml +=
      '<tr><td>Phone Number</td><td>' + (data.user.phoneNumber ? data.user.phoneNumber : '-') + '</td></tr>' +
      '<tr><td>Blood Group</td><td>' + data.user.bloodGroup + '</td></tr>' +
      '<tr><td>Last Donation</td><td>' + lastDonationText + '</td></tr>' +
      '<tr><td>Attached Society</td><td>' + attachedSocietyText + '</td></tr>' +
      '<tr><td>Donation Eligibility</td><td>' + eligibilityHtml + '</td></tr>';
  } else if (data.user.accountType === ACCOUNT_TYPES.SOCIETY) {
    rowsHtml +=
      '<tr><td>Account Type</td><td>Blood Group Society</td></tr>' +
      '<tr><td>Blood Bags Collected</td><td>' + data.user.bloodBagsCollected + '</td></tr>';
  } else if (data.user.accountType === ACCOUNT_TYPES.RIDER) {
    rowsHtml +=
      '<tr><td>Account Type</td><td>Rider</td></tr>' +
      '<tr><td>Phone Number</td><td>' + data.user.phoneNumber + '</td></tr>' +
      '<tr><td>Vehicle Info</td><td>' + (data.user.vehicleInfo ? data.user.vehicleInfo : '-') + '</td></tr>';
  }

  table.innerHTML = rowsHtml;
}

document.getElementById('edit-profile-btn').addEventListener('click', function () {
  const user = currentProfileData.user;

  document.getElementById('edit-fullName').value = user.fullName;
  document.getElementById('edit-city').value = user.city;

  donorOnlyFields.classList.add('page-hidden');
  riderOnlyFields.classList.add('page-hidden');

  if (user.accountType === ACCOUNT_TYPES.DONOR) {
    donorOnlyFields.classList.remove('page-hidden');
    document.getElementById('edit-bloodGroup').value = user.bloodGroup || '';
    document.getElementById('edit-phoneNumber-donor').value = user.phoneNumber || '';

    if (user.lastDonationDate) {
      const localDateTime = new Date(user.lastDonationDate);
      localDateTime.setMinutes(localDateTime.getMinutes() - localDateTime.getTimezoneOffset());
      document.getElementById('edit-lastDonationDate').value = localDateTime.toISOString().slice(0, 16);
    } else {
      document.getElementById('edit-lastDonationDate').value = '';
    }
  } else if (user.accountType === ACCOUNT_TYPES.RIDER) {
    riderOnlyFields.classList.remove('page-hidden');
    document.getElementById('edit-phoneNumber-rider').value = user.phoneNumber || '';
    document.getElementById('edit-vehicleInfo').value = user.vehicleInfo || '';
  }

  editForm.classList.remove('page-hidden');
  this.classList.add('page-hidden');
});

document.getElementById('cancel-edit-btn').addEventListener('click', function () {
  editForm.classList.add('page-hidden');
  document.getElementById('edit-profile-btn').classList.remove('page-hidden');
});

editForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  successMessageBox.classList.add('page-hidden');
  errorMessageBox.classList.add('page-hidden');

  const payload = {
    fullName: document.getElementById('edit-fullName').value,
    city: document.getElementById('edit-city').value
  };

  if (currentProfileData.user.accountType === ACCOUNT_TYPES.DONOR) {
    payload.bloodGroup = document.getElementById('edit-bloodGroup').value;
    payload.lastDonationDate = document.getElementById('edit-lastDonationDate').value || null;
    payload.phoneNumber = document.getElementById('edit-phoneNumber-donor').value || null;
  } else if (currentProfileData.user.accountType === ACCOUNT_TYPES.RIDER) {
    payload.phoneNumber = document.getElementById('edit-phoneNumber-rider').value;
    payload.vehicleInfo = document.getElementById('edit-vehicleInfo').value || null;
  }

  try {
    await apiRequest('/profile', { method: 'PUT', body: payload });
    successMessageBox.textContent = 'Profile updated successfully.';
    successMessageBox.classList.remove('page-hidden');
    editForm.classList.add('page-hidden');
    document.getElementById('edit-profile-btn').classList.remove('page-hidden');
    await loadProfileData();
  } catch (error) {
    errorMessageBox.textContent = error.message;
    errorMessageBox.classList.remove('page-hidden');
  }
});

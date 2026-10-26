renderAppBar(null);
renderBackButton();

const errorMessageBox = document.getElementById('error-message');
const societyDropdown = document.getElementById('attachedSocietyId');

async function loadSocietyOptions() {
  try {
    const data = await apiRequest('/societies');
    data.societyList.forEach(function (society) {
      const option = document.createElement('option');
      option.value = society.id;
      option.textContent = society.fullName;
      societyDropdown.appendChild(option);
    });
  } catch (error) {
    // dropdown stays at "None"
  }
}
loadSocietyOptions();

document.getElementById('donor-signup-form').addEventListener('submit', async function (event) {
  event.preventDefault();
  errorMessageBox.classList.add('page-hidden');

  const payload = {
    fullName: document.getElementById('fullName').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    phoneNumber: document.getElementById('phoneNumber').value || null,
    bloodGroup: document.getElementById('bloodGroup').value,
    city: document.getElementById('city').value,
    lastDonationDate: document.getElementById('lastDonationDate').value || null,
    attachedSocietyId: document.getElementById('attachedSocietyId').value || null
  };

  try {
    const data = await apiRequest('/signup/donor', { method: 'POST', body: payload });
    sessionStorage.setItem('signupMessage', data.message);
    window.location.href = 'login.html';
  } catch (error) {
    errorMessageBox.textContent = error.message;
    errorMessageBox.classList.remove('page-hidden');
  }
});

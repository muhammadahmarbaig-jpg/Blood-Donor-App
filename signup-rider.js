renderAppBar(null);
renderBackButton();

const errorMessageBox = document.getElementById('error-message');

document.getElementById('rider-signup-form').addEventListener('submit', async function (event) {
  event.preventDefault();
  errorMessageBox.classList.add('page-hidden');

  const payload = {
    fullName: document.getElementById('fullName').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    phoneNumber: document.getElementById('phoneNumber').value,
    city: document.getElementById('city').value,
    vehicleInfo: document.getElementById('vehicleInfo').value || null
  };

  try {
    const data = await apiRequest('/signup/rider', { method: 'POST', body: payload });
    sessionStorage.setItem('signupMessage', data.message);
    window.location.href = 'login.html';
  } catch (error) {
    errorMessageBox.textContent = error.message;
    errorMessageBox.classList.remove('page-hidden');
  }
});

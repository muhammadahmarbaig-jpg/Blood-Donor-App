renderAppBar(null);
renderBackButton();

const errorMessageBox = document.getElementById('error-message');
const successMessageBox = document.getElementById('success-message');
const resetForm = document.getElementById('reset-password-form');

const urlParams = new URLSearchParams(window.location.search);
const resetToken = urlParams.get('token');

if (!resetToken) {
  errorMessageBox.textContent = 'This reset link is missing its token. Please request a new one.';
  errorMessageBox.classList.remove('page-hidden');
  resetForm.classList.add('page-hidden');
}

resetForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  errorMessageBox.classList.add('page-hidden');

  const newPassword = document.getElementById('newPassword').value;

  try {
    const data = await apiRequest('/password/reset', { method: 'POST', body: { token: resetToken, newPassword } });
    successMessageBox.textContent = data.message;
    successMessageBox.classList.remove('page-hidden');
    resetForm.classList.add('page-hidden');
  } catch (error) {
    errorMessageBox.textContent = error.message;
    errorMessageBox.classList.remove('page-hidden');
  }
});

renderAppBar(null);
renderBackButton();

const errorMessageBox = document.getElementById('error-message');
const successMessageBox = document.getElementById('success-message');
const devResetLinkBox = document.getElementById('dev-reset-link-box');
const devResetLink = document.getElementById('dev-reset-link');

document.getElementById('forgot-password-form').addEventListener('submit', async function (event) {
  event.preventDefault();
  errorMessageBox.classList.add('page-hidden');
  successMessageBox.classList.add('page-hidden');
  devResetLinkBox.classList.add('page-hidden');

  const email = document.getElementById('email').value;

  try {
    const data = await apiRequest('/password/forgot', { method: 'POST', body: { email } });
    successMessageBox.textContent = data.message;
    successMessageBox.classList.remove('page-hidden');

    if (data.resetToken) {
      const resetUrl = 'reset-password.html?token=' + data.resetToken;
      devResetLink.textContent = resetUrl;
      devResetLink.href = resetUrl;
      devResetLinkBox.classList.remove('page-hidden');
    }
  } catch (error) {
    errorMessageBox.textContent = error.message;
    errorMessageBox.classList.remove('page-hidden');
  }
});

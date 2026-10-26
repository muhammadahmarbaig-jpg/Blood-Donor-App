renderAppBar(null);
renderBackButton();

const loginForm = document.getElementById('login-form');
const errorMessageBox = document.getElementById('error-message');
const successMessageBox = document.getElementById('success-message');

const pendingMessage = sessionStorage.getItem('signupMessage');
if (pendingMessage) {
  successMessageBox.textContent = pendingMessage;
  successMessageBox.classList.remove('page-hidden');
  sessionStorage.removeItem('signupMessage');
}

loginForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  errorMessageBox.classList.add('page-hidden');

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const data = await apiRequest('/login', { method: 'POST', body: { email, password } });
    setToken(data.token);
    setStoredUser(data.user);

    if (data.user.accountType === ACCOUNT_TYPES.ADMIN) {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'home.html';
    }
  } catch (error) {
    errorMessageBox.textContent = error.message;
    errorMessageBox.classList.remove('page-hidden');
  }
});

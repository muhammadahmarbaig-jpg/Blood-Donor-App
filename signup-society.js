renderAppBar(null);
renderBackButton();

const errorMessageBox = document.getElementById('error-message');

document.getElementById('society-signup-form').addEventListener('submit', async function (event) {
  event.preventDefault();
  errorMessageBox.classList.add('page-hidden');

  const payload = {
    fullName: document.getElementById('fullName').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    city: document.getElementById('city').value
  };

  try {
    const data = await apiRequest('/signup/society', { method: 'POST', body: payload });
    sessionStorage.setItem('signupMessage', data.message);
    window.location.href = 'login.html';
  } catch (error) {
    errorMessageBox.textContent = error.message;
    errorMessageBox.classList.remove('page-hidden');
  }
});

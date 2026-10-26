if (requireAuthOrRedirect()) {
  loadAccountType();
}
renderBackButton();

async function loadAccountType() {
  try {
    const data = await apiRequest('/home');
    renderAppBar(data.user.accountType);
  } catch (error) {
    clearToken();
    window.location.href = 'login.html';
  }
}

const errorMessageBox = document.getElementById('error-message');

document.getElementById('new-request-form').addEventListener('submit', async function (event) {
  event.preventDefault();
  errorMessageBox.classList.add('page-hidden');

  const payload = {
    bloodGroup: document.getElementById('bloodGroup').value,
    city: document.getElementById('city').value,
    unitsNeeded: document.getElementById('unitsNeeded').value,
    notes: document.getElementById('notes').value || null,
    isEmergency: document.getElementById('isEmergency').checked
  };

  try {
    await apiRequest('/requests', { method: 'POST', body: payload });
    window.location.href = 'requests.html';
  } catch (error) {
    errorMessageBox.textContent = error.message;
    errorMessageBox.classList.remove('page-hidden');
  }
});

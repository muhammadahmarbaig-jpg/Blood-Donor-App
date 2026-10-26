if (requireAuthOrRedirect()) {
  loadAdminPage();
}

const successMessageBox = document.getElementById('success-message');
const errorMessageBox = document.getElementById('error-message');

function accountTypeLabel(accountType) {
  if (accountType === ACCOUNT_TYPES.DONOR) return 'Donor';
  if (accountType === ACCOUNT_TYPES.SOCIETY) return 'Society';
  if (accountType === ACCOUNT_TYPES.RIDER) return 'Rider';
  return 'Admin';
}

async function loadAdminPage() {
  try {
    const homeData = await apiRequest('/home');
    if (homeData.user.accountType !== ACCOUNT_TYPES.ADMIN) {
      window.location.href = 'home.html';
      return;
    }
    renderAppBar(homeData.user.accountType);
    await loadPendingAccounts();
    await loadAllAccounts();
  } catch (error) {
    clearToken();
    window.location.href = 'login.html';
  }
}

async function loadPendingAccounts() {
  const data = await apiRequest('/admin/pending');
  const tableBody = document.getElementById('pending-accounts');
  const noPendingMessage = document.getElementById('no-pending-message');

  if (data.pendingAccounts.length === 0) {
    tableBody.innerHTML = '';
    noPendingMessage.classList.remove('page-hidden');
    return;
  }
  noPendingMessage.classList.add('page-hidden');

  tableBody.innerHTML = data.pendingAccounts.map(function (account) {
    return '<tr>' +
      '<td>' + account.fullName + '</td>' +
      '<td>' + account.email + '</td>' +
      '<td>' + accountTypeLabel(account.accountType) + '</td>' +
      '<td>' + account.city + '</td>' +
      '<td>' + (account.bloodGroup ? account.bloodGroup : '-') + '</td>' +
      '<td>' + (account.phoneNumber ? account.phoneNumber : '-') + '</td>' +
      '<td>' + new Date(account.createdAt).toLocaleDateString() + '</td>' +
      '<td class="action-buttons">' +
      '<button class="approve-btn" onclick="handleApprove(' + account.id + ')">Approve</button>' +
      '<button class="reject-btn" onclick="handleReject(' + account.id + ')">Reject</button>' +
      '</td></tr>';
  }).join('');
}

async function loadAllAccounts() {
  const data = await apiRequest('/admin/accounts');
  const tableBody = document.getElementById('all-accounts');

  tableBody.innerHTML = data.accounts.map(function (account) {
    const statusHtml = account.isApproved
      ? '<span class="badge-eligible">Approved</span>'
      : '<span class="badge-pending">Pending</span>';
    return '<tr><td>' + account.fullName + '</td><td>' + account.email + '</td><td>' + accountTypeLabel(account.accountType) + '</td><td>' + account.city + '</td><td>' + statusHtml + '</td></tr>';
  }).join('');
}

async function handleApprove(accountId) {
  clearMessages();
  try {
    await apiRequest('/admin/approve/' + accountId, { method: 'POST' });
    successMessageBox.textContent = 'Account approved.';
    successMessageBox.classList.remove('page-hidden');
    await loadPendingAccounts();
    await loadAllAccounts();
  } catch (error) {
    errorMessageBox.textContent = error.message;
    errorMessageBox.classList.remove('page-hidden');
  }
}

async function handleReject(accountId) {
  clearMessages();
  try {
    await apiRequest('/admin/reject/' + accountId, { method: 'POST' });
    successMessageBox.textContent = 'Account rejected and removed.';
    successMessageBox.classList.remove('page-hidden');
    await loadPendingAccounts();
    await loadAllAccounts();
  } catch (error) {
    errorMessageBox.textContent = error.message;
    errorMessageBox.classList.remove('page-hidden');
  }
}

function clearMessages() {
  successMessageBox.classList.add('page-hidden');
  errorMessageBox.classList.add('page-hidden');
}

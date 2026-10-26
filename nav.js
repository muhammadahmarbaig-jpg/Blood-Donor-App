function renderAppBar(accountType) {
  const mount = document.getElementById('app-bar-mount');
  if (!mount) {
    return;
  }

  let linksHtml = '';

  if (accountType === ACCOUNT_TYPES.ADMIN) {
    linksHtml += '<a href="admin.html">Admin Panel</a>';
    linksHtml += '<a href="#" id="logout-link">Logout</a>';
  } else if (accountType === ACCOUNT_TYPES.RIDER) {
    linksHtml += '<a href="home.html">Home</a>';
    linksHtml += '<a href="profile.html">Profile</a>';
    linksHtml += '<a href="rides.html">Rides</a>';
    linksHtml += '<a href="#" id="logout-link">Logout</a>';
  } else if (accountType) {
    const requestsLabel = accountType === ACCOUNT_TYPES.DONOR ? 'Blood Requests' : 'My Requests';
    linksHtml += '<a href="home.html">Home</a>';
    linksHtml += '<a href="profile.html">Profile</a>';
    linksHtml += '<a href="donors.html">Donors</a>';
    linksHtml += '<a href="requests.html">' + requestsLabel + '</a>';
    linksHtml += '<a href="appointments.html">Appointments</a>';
    if (accountType === ACCOUNT_TYPES.DONOR) {
      linksHtml += '<a href="rides.html">Rides</a>';
    }
    if (accountType === ACCOUNT_TYPES.SOCIETY) {
      linksHtml += '<a href="society-donors.html">My Donors</a>';
    }
    linksHtml += '<a href="#" id="logout-link">Logout</a>';
  }

  mount.innerHTML =
    '<header class="app-bar">' +
    '<div class="app-bar-inner">' +
    '<div class="app-bar-title"><span class="brand-mark-mini">♥</span>Blood Bridge</div>' +
    (accountType ? '<nav class="app-bar-links">' + linksHtml + '</nav>' : '') +
    '</div>' +
    '</header>';

  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', async function (event) {
      event.preventDefault();
      try {
        await apiRequest('/logout', { method: 'POST' });
      } catch (error) {
        // logging out locally still proceeds even if the API call fails
      }
      clearToken();
      localStorage.removeItem('currentUser');
      window.location.href = 'login.html';
    });
  }
}

function renderBackButton() {
  const mount = document.getElementById('back-button-mount');
  if (!mount) {
    return;
  }
  mount.innerHTML =
    '<button type="button" class="back-button" onclick="history.back()">' +
    '<span class="material-icons">arrow_back</span>Back</button>';
}

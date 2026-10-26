if (requireAuthOrRedirect()) {
  loadHomeData();
}

async function loadHomeData() {
  try {
    const data = await apiRequest('/home');

    if (data.user.accountType === ACCOUNT_TYPES.ADMIN) {
      window.location.href = 'admin.html';
      return;
    }

    renderAppBar(data.user.accountType);
    document.getElementById('welcome-heading').textContent = 'Welcome, ' + data.user.fullName;
    renderEmergencyAlerts(data.emergencyAlerts);

    const contentBox = document.getElementById('home-content');
    const hintText = document.getElementById('hint-text');

    if (data.user.accountType === ACCOUNT_TYPES.DONOR) {
      const eligibilityHtml = data.ownEligibility.isEligible
        ? '<span class="badge-eligible">Eligible to donate now</span>'
        : '<span class="badge-waiting">Eligible in ' + data.ownEligibility.daysRemaining + ' day(s)</span>';
      contentBox.innerHTML = '<p>Your donation eligibility:</p><p>' + eligibilityHtml + '</p>';
      hintText.textContent = 'Use the menu above to view your profile, search donors, check blood requests, book appointments, or request a pickup ride.';
    } else if (data.user.accountType === ACCOUNT_TYPES.SOCIETY) {
      contentBox.innerHTML =
        '<table class="details-table"><tr><td>Donors Attached</td><td>' + data.attachedDonorsCount + '</td></tr></table>';
      hintText.textContent = 'Use the menu above to view your profile, search donors, post blood requests, or manage appointments.';
    } else if (data.user.accountType === ACCOUNT_TYPES.RIDER) {
      contentBox.innerHTML = '<p>Check the Rides page to see pending pickup requests in your city.</p>';
      hintText.textContent = 'Use the menu above to view your profile or manage rides.';
    }
  } catch (error) {
    clearToken();
    window.location.href = 'login.html';
  }
}

function renderEmergencyAlerts(emergencyAlerts) {
  const mount = document.getElementById('emergency-alerts-mount');
  if (!emergencyAlerts || emergencyAlerts.length === 0) {
    mount.innerHTML = '';
    return;
  }

  const itemsHtml = emergencyAlerts.map(function (alert) {
    return '<div class="emergency-alert-item">' +
      '<strong>' + alert.requestedBySociety.fullName + '</strong> needs ' +
      '<strong>' + alert.bloodGroup + '</strong> blood in ' +
      '<strong>' + alert.city + '</strong> (' + alert.unitsNeeded + ' unit(s) needed)' +
      (alert.notes ? ' — ' + alert.notes : '') +
      '<div style="margin-top: 8px;">' +
      '<button type="button" class="respond-emergency-btn" data-id="' + alert.id + '">' +
      '<span class="material-icons">volunteer_activism</span>I Can Help</button>' +
      '</div>' +
      '</div>';
  }).join('');

  mount.innerHTML =
    '<div class="emergency-banner">' +
    '<div class="emergency-banner-title"><span class="material-icons">warning</span>Active Emergency Blood Alerts</div>' +
    itemsHtml +
    '</div>';

  document.querySelectorAll('.respond-emergency-btn').forEach(function (button) {
    button.addEventListener('click', async function () {
      const requestId = this.getAttribute('data-id');
      const originalText = this.innerHTML;
      this.disabled = true;

      try {
        const data = await apiRequest('/requests/' + requestId + '/respond', { method: 'POST' });
        this.innerHTML = '<span class="material-icons">check</span>Responded';
        alert(data.message);
      } catch (error) {
        this.disabled = false;
        this.innerHTML = originalText;
        alert(error.message);
      }
    });
  });
}

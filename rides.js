let currentAccountType = null;

if (requireAuthOrRedirect()) {
  loadRidesPage();
}
renderBackButton();

const successMessageBox = document.getElementById('success-message');
const errorMessageBox = document.getElementById('error-message');

function clearMessages() {
  successMessageBox.classList.add('page-hidden');
  errorMessageBox.classList.add('page-hidden');
}

function showSuccess(message) {
  clearMessages();
  successMessageBox.textContent = message;
  successMessageBox.classList.remove('page-hidden');
}

function showError(message) {
  clearMessages();
  errorMessageBox.textContent = message;
  errorMessageBox.classList.remove('page-hidden');
}

async function loadRidesPage() {
  try {
    const homeData = await apiRequest('/home');
    currentAccountType = homeData.user.accountType;
    renderAppBar(currentAccountType);

    if (currentAccountType === ACCOUNT_TYPES.DONOR) {
      document.getElementById('donor-request-section').classList.remove('page-hidden');
    } else if (currentAccountType === ACCOUNT_TYPES.RIDER) {
      document.getElementById('rider-section').classList.remove('page-hidden');
    } else {
      window.location.href = 'home.html';
      return;
    }

    await loadRides();
  } catch (error) {
    clearToken();
    window.location.href = 'login.html';
  }
}

function rideStatusBadge(status) {
  if (status === 'completed') return '<span class="badge-eligible"><span class="material-icons badge-icon">check_circle</span>Completed</span>';
  if (status === 'in_progress') return '<span class="badge-eligible"><span class="material-icons badge-icon">directions_car</span>In Progress</span>';
  if (status === 'accepted') return '<span class="badge-eligible"><span class="material-icons badge-icon">check</span>Accepted</span>';
  if (status === 'cancelled') return '<span class="badge-pending"><span class="material-icons badge-icon">cancel</span>Cancelled</span>';
  return '<span class="badge-waiting"><span class="material-icons badge-icon">hourglass_top</span>Pending</span>';
}

async function loadRides() {
  const data = await apiRequest('/rides');

  if (data.role === 'donor') {
    renderDonorRides(data.rides);
  } else if (data.role === 'rider') {
    renderAvailableRides(data.availableRides);
    renderMyAcceptedRides(data.myAcceptedRides);
  }

  attachActionListeners();
}

function renderDonorRides(rides) {
  const table = document.getElementById('donor-rides-table');
  const emptyMessage = document.getElementById('no-donor-rides-message');

  if (rides.length === 0) {
    table.innerHTML = '';
    emptyMessage.classList.remove('page-hidden');
    return;
  }
  emptyMessage.classList.add('page-hidden');

  table.innerHTML =
    '<tr><th>Pickup</th><th>Drop</th><th>Date &amp; Time</th><th>Rider</th><th>Status</th><th>Action</th></tr>' +
    rides.map(function (ride) {
      const riderInfo = ride.rider
        ? ride.rider.fullName + ' (' + ride.rider.phoneNumber + (ride.rider.vehicleInfo ? ', ' + ride.rider.vehicleInfo : '') + ')'
        : 'Not assigned yet';
      const canCancel = ride.status === 'pending' || ride.status === 'accepted';
      const actionHtml = canCancel
        ? '<div class="action-buttons"><button class="reject-btn" data-type="ride" data-action="update" data-id="' + ride.id + '" data-status="cancelled" data-confirm="Cancel this ride request?"><span class="material-icons">close</span>Cancel</button></div>'
        : '-';

      return '<tr><td>' + ride.pickupAddress + '</td><td>' + ride.dropAddress + '</td><td>' + new Date(ride.requestedTime).toLocaleString() + '</td><td>' + riderInfo + '</td><td>' + rideStatusBadge(ride.status) + '</td><td>' + actionHtml + '</td></tr>';
    }).join('');
}

function renderAvailableRides(rides) {
  const table = document.getElementById('available-rides-table');
  const emptyMessage = document.getElementById('no-available-rides-message');

  if (rides.length === 0) {
    table.innerHTML = '';
    emptyMessage.classList.remove('page-hidden');
    return;
  }
  emptyMessage.classList.add('page-hidden');

  table.innerHTML =
    '<tr><th>Donor</th><th>Pickup</th><th>Drop</th><th>Date &amp; Time</th><th>Action</th></tr>' +
    rides.map(function (ride) {
      return '<tr><td>' + ride.donor.fullName + ' (' + ride.donor.phoneNumber + ')</td><td>' + ride.pickupAddress + '</td><td>' + ride.dropAddress + '</td><td>' + new Date(ride.requestedTime).toLocaleString() + '</td>' +
        '<td><div class="action-buttons"><button class="approve-btn" data-type="ride" data-action="accept" data-id="' + ride.id + '"><span class="material-icons">check</span>Accept</button></div></td></tr>';
    }).join('');
}

function renderMyAcceptedRides(rides) {
  const table = document.getElementById('my-rides-table');
  const emptyMessage = document.getElementById('no-my-rides-message');

  if (rides.length === 0) {
    table.innerHTML = '';
    emptyMessage.classList.remove('page-hidden');
    return;
  }
  emptyMessage.classList.add('page-hidden');

  table.innerHTML =
    '<tr><th>Donor</th><th>Pickup</th><th>Drop</th><th>Date &amp; Time</th><th>Status</th><th>Action</th></tr>' +
    rides.map(function (ride) {
      let actionHtml = '-';
      if (ride.status === 'accepted') {
        actionHtml = '<div class="action-buttons">' +
          '<button class="approve-btn" data-type="ride" data-action="update" data-id="' + ride.id + '" data-status="in_progress"><span class="material-icons">directions_car</span>Start</button>' +
          '<button class="reject-btn" data-type="ride" data-action="update" data-id="' + ride.id + '" data-status="cancelled" data-confirm="Cancel this ride?"><span class="material-icons">close</span>Cancel</button></div>';
      } else if (ride.status === 'in_progress') {
        actionHtml = '<div class="action-buttons">' +
          '<button class="approve-btn" data-type="ride" data-action="update" data-id="' + ride.id + '" data-status="completed" data-confirm="Mark this ride as completed?"><span class="material-icons">check_circle</span>Complete</button></div>';
      }

      return '<tr><td>' + ride.donor.fullName + ' (' + ride.donor.phoneNumber + ')</td><td>' + ride.pickupAddress + '</td><td>' + ride.dropAddress + '</td><td>' + new Date(ride.requestedTime).toLocaleString() + '</td><td>' + rideStatusBadge(ride.status) + '</td><td>' + actionHtml + '</td></tr>';
    }).join('');
}

function attachActionListeners() {
  document.querySelectorAll('button[data-type="ride"]').forEach(function (button) {
    button.addEventListener('click', async function () {
      const rideId = this.getAttribute('data-id');
      const action = this.getAttribute('data-action');
      const confirmMessage = this.getAttribute('data-confirm');

      if (confirmMessage && !window.confirm(confirmMessage)) {
        return;
      }

      try {
        if (action === 'accept') {
          await apiRequest('/rides/' + rideId + '/accept', { method: 'POST' });
          showSuccess('Ride accepted.');
        } else {
          const status = this.getAttribute('data-status');
          await apiRequest('/rides/' + rideId, { method: 'PUT', body: { status } });
          showSuccess('Ride updated.');
        }
        await loadRides();
      } catch (error) {
        showError(error.message);
      }
    });
  });
}

const requestRideForm = document.getElementById('request-ride-form');
if (requestRideForm) {
  requestRideForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    clearMessages();

    const payload = {
      pickupAddress: document.getElementById('pickupAddress').value,
      dropAddress: document.getElementById('dropAddress').value,
      requestedTime: document.getElementById('requestedTime').value,
      notes: document.getElementById('notes').value || null
    };

    try {
      const data = await apiRequest('/rides', { method: 'POST', body: payload });
      showSuccess(data.message);
      requestRideForm.reset();
      await loadRides();
    } catch (error) {
      showError(error.message);
    }
  });
}

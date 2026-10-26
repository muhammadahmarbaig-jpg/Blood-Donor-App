let currentAccountType = null;
let allAppointments = [];
let currentRole = null;

if (requireAuthOrRedirect()) {
  loadAppointmentsPage();
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

async function loadAppointmentsPage() {
  try {
    const homeData = await apiRequest('/home');
    currentAccountType = homeData.user.accountType;
    renderAppBar(currentAccountType);

    if (currentAccountType === ACCOUNT_TYPES.DONOR) {
      document.getElementById('donor-booking-section').classList.remove('page-hidden');
      await loadSocietyOptions();
    }

    await loadAppointments();
  } catch (error) {
    clearToken();
    window.location.href = 'login.html';
  }
}

async function loadSocietyOptions() {
  const dropdown = document.getElementById('societyId');
  try {
    const data = await apiRequest('/societies');
    data.societyList.forEach(function (society) {
      const option = document.createElement('option');
      option.value = society.id;
      option.textContent = society.fullName;
      dropdown.appendChild(option);
    });
  } catch (error) {
    // dropdown stays with only the placeholder option
  }
}

async function loadAppointments() {
  const data = await apiRequest('/appointments');
  allAppointments = data.appointments;
  currentRole = data.role;

  renderStatPills(allAppointments);

  const now = new Date();
  const upcoming = allAppointments.filter(function (appointment) {
    return new Date(appointment.appointmentDate) >= now && appointment.status !== 'cancelled';
  });
  const past = allAppointments.filter(function (appointment) {
    return new Date(appointment.appointmentDate) < now || appointment.status === 'cancelled';
  });

  renderAppointmentsTable('upcoming-appointments-table', 'no-upcoming-message', upcoming);
  renderAppointmentsTable('past-appointments-table', 'no-past-message', past);
  attachActionListeners();
}

function renderStatPills(appointments) {
  const counts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  appointments.forEach(function (appointment) {
    counts[appointment.status] = (counts[appointment.status] || 0) + 1;
  });

  document.getElementById('stat-pills').innerHTML =
    '<span class="stat-pill">Total: ' + appointments.length + '</span>' +
    '<span class="stat-pill stat-pill-waiting">Pending: ' + counts.pending + '</span>' +
    '<span class="stat-pill stat-pill-eligible">Confirmed: ' + counts.confirmed + '</span>' +
    '<span class="stat-pill stat-pill-eligible">Completed: ' + counts.completed + '</span>' +
    '<span class="stat-pill stat-pill-pending">Cancelled: ' + counts.cancelled + '</span>';
}

function renderAppointmentsTable(tableId, emptyMessageId, appointments) {
  const table = document.getElementById(tableId);
  const emptyMessage = document.getElementById(emptyMessageId);

  if (appointments.length === 0) {
    table.innerHTML = '';
    emptyMessage.classList.remove('page-hidden');
    return;
  }
  emptyMessage.classList.add('page-hidden');

  if (currentRole === 'donor') {
    table.innerHTML =
      '<tr><th>Society</th><th>City</th><th>Date &amp; Time</th><th>Notes</th><th>Status</th><th>Action</th></tr>' +
      appointments.map(function (appointment) {
        return '<tr><td>' + appointment.society.fullName + '</td><td>' + appointment.society.city + '</td><td>' + new Date(appointment.appointmentDate).toLocaleString() + '</td><td>' + (appointment.notes ? appointment.notes : '-') + '</td><td>' + statusBadge(appointment.status) + '</td><td>' + donorActionButtons(appointment) + '</td></tr>';
      }).join('');
  } else {
    table.innerHTML =
      '<tr><th>Donor</th><th>Blood Group</th><th>Date &amp; Time</th><th>Notes</th><th>Status</th><th>Action</th></tr>' +
      appointments.map(function (appointment) {
        return '<tr><td>' + appointment.donor.fullName + ' (' + appointment.donor.email + ')</td><td>' + appointment.donor.bloodGroup + '</td><td>' + new Date(appointment.appointmentDate).toLocaleString() + '</td><td>' + (appointment.notes ? appointment.notes : '-') + '</td><td>' + statusBadge(appointment.status) + '</td><td>' + societyActionButtons(appointment) + '</td></tr>';
      }).join('');
  }
}

function statusBadge(status) {
  if (status === 'completed') return '<span class="badge-eligible"><span class="material-icons badge-icon">check_circle</span>Completed</span>';
  if (status === 'confirmed') return '<span class="badge-eligible"><span class="material-icons badge-icon">event_available</span>Confirmed</span>';
  if (status === 'cancelled') return '<span class="badge-pending"><span class="material-icons badge-icon">cancel</span>Cancelled</span>';
  return '<span class="badge-waiting"><span class="material-icons badge-icon">hourglass_top</span>Pending</span>';
}

function donorActionButtons(appointment) {
  if (appointment.status === 'pending' || appointment.status === 'confirmed') {
    return '<div class="action-buttons"><button class="reject-btn" data-type="appointment" data-id="' + appointment.id + '" data-status="cancelled" data-confirm="Cancel this appointment?"><span class="material-icons">close</span>Cancel</button></div>';
  }
  return '-';
}

function societyActionButtons(appointment) {
  if (appointment.status === 'pending') {
    return '<div class="action-buttons">' +
      '<button class="approve-btn" data-type="appointment" data-id="' + appointment.id + '" data-status="confirmed"><span class="material-icons">check</span>Confirm</button>' +
      '<button class="reject-btn" data-type="appointment" data-id="' + appointment.id + '" data-status="cancelled" data-confirm="Cancel this appointment?"><span class="material-icons">close</span>Cancel</button></div>';
  }
  if (appointment.status === 'confirmed') {
    return '<div class="action-buttons">' +
      '<button class="approve-btn" data-type="appointment" data-id="' + appointment.id + '" data-status="completed" data-confirm="Mark this appointment as completed? This will update the donor\'s last donation date and your blood bag count."><span class="material-icons">check_circle</span>Mark Completed</button>' +
      '<button class="reject-btn" data-type="appointment" data-id="' + appointment.id + '" data-status="cancelled" data-confirm="Cancel this appointment?"><span class="material-icons">close</span>Cancel</button></div>';
  }
  return '-';
}

function attachActionListeners() {
  document.querySelectorAll('button[data-type="appointment"]').forEach(function (button) {
    button.addEventListener('click', async function () {
      const appointmentId = this.getAttribute('data-id');
      const status = this.getAttribute('data-status');
      const confirmMessage = this.getAttribute('data-confirm');

      if (confirmMessage && !window.confirm(confirmMessage)) {
        return;
      }

      try {
        await apiRequest('/appointments/' + appointmentId, { method: 'PUT', body: { status } });
        showSuccess('Appointment updated.');
        await loadAppointments();
      } catch (error) {
        showError(error.message);
      }
    });
  });
}

const bookAppointmentForm = document.getElementById('book-appointment-form');
if (bookAppointmentForm) {
  bookAppointmentForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    clearMessages();

    const payload = {
      societyId: document.getElementById('societyId').value,
      appointmentDate: document.getElementById('appointmentDate').value,
      notes: document.getElementById('notes').value || null
    };

    try {
      const data = await apiRequest('/appointments', { method: 'POST', body: payload });
      showSuccess(data.message);
      bookAppointmentForm.reset();
      await loadAppointments();
    } catch (error) {
      showError(error.message);
    }
  });
}

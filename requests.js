if (requireAuthOrRedirect()) {
  loadRequestsData();
}
renderBackButton();

async function loadRequestsData() {
  try {
    const data = await apiRequest('/requests');
    renderAppBar(data.accountType);
    const table = document.getElementById('requests-table');
    const heading = document.getElementById('requests-heading');

    if (data.accountType === ACCOUNT_TYPES.DONOR) {
      heading.textContent = 'Blood Requests Matching Your Blood Group';
      table.innerHTML =
        '<tr><th>Society</th><th>City</th><th>Units Needed</th><th>Notes</th><th>Priority</th></tr>' +
        data.matchingBloodRequests.map(function (request) {
          const priorityHtml = request.isEmergency
            ? '<span class="badge-emergency">Emergency</span>'
            : '<span class="badge-eligible">Normal</span>';
          return '<tr><td>' + request.requestedBySociety.fullName + '</td><td>' + request.city + '</td><td>' + request.unitsNeeded + '</td><td>' + (request.notes ? request.notes : '-') + '</td><td>' + priorityHtml + '</td></tr>';
        }).join('');
    } else {
      heading.textContent = 'My Blood Requests';
      table.innerHTML =
        '<tr><th>Blood Group</th><th>City</th><th>Units Needed</th><th>Notes</th><th>Priority</th><th>Status</th><th>Action</th></tr>' +
        data.postedBloodRequests.map(function (request) {
          const priorityHtml = request.isEmergency
            ? '<span class="badge-emergency">Emergency</span>'
            : '<span class="badge-eligible">Normal</span>';
          const statusHtml = request.isFulfilled
            ? '<span class="badge-eligible">Fulfilled</span>'
            : '<span class="badge-waiting">Active</span>';

          let actionHtml = '-';
          if (request.isEmergency) {
            actionHtml = '<div class="action-buttons">' +
              '<button class="approve-btn" data-action="view-responders" data-id="' + request.id + '"><span class="material-icons">people</span>Responders</button>';
            if (!request.isFulfilled) {
              actionHtml += '<button class="reject-btn" data-action="fulfill" data-id="' + request.id + '" data-confirm="Mark this request as fulfilled? It will stop showing on donor home pages."><span class="material-icons">check_circle</span>Fulfilled</button>';
            }
            actionHtml += '</div>';
          }

          return '<tr id="request-row-' + request.id + '">' +
            '<td>' + request.bloodGroup + '</td><td>' + request.city + '</td><td>' + request.unitsNeeded + '</td>' +
            '<td>' + (request.notes ? request.notes : '-') + '</td><td>' + priorityHtml + '</td><td>' + statusHtml + '</td>' +
            '<td>' + actionHtml + '</td></tr>' +
            '<tr id="responders-row-' + request.id + '" class="page-hidden"><td colspan="7"><div id="responders-box-' + request.id + '"></div></td></tr>';
        }).join('');

      attachSocietyActionListeners();
    }
  } catch (error) {
    clearToken();
    window.location.href = 'login.html';
  }
}

function attachSocietyActionListeners() {
  document.querySelectorAll('button[data-action]').forEach(function (button) {
    button.addEventListener('click', async function () {
      const requestId = this.getAttribute('data-id');
      const action = this.getAttribute('data-action');

      if (action === 'view-responders') {
        toggleResponders(requestId);
        return;
      }

      const confirmMessage = this.getAttribute('data-confirm');
      if (confirmMessage && !window.confirm(confirmMessage)) {
        return;
      }

      try {
        await apiRequest('/requests/' + requestId + '/fulfill', { method: 'POST' });
        await loadRequestsData();
      } catch (error) {
        alert(error.message);
      }
    });
  });
}

async function toggleResponders(requestId) {
  const row = document.getElementById('responders-row-' + requestId);
  const box = document.getElementById('responders-box-' + requestId);

  if (!row.classList.contains('page-hidden')) {
    row.classList.add('page-hidden');
    return;
  }

  try {
    const data = await apiRequest('/requests/' + requestId + '/responders');

    if (data.responders.length === 0) {
      box.innerHTML = '<p style="margin: 10px 0;">No donors have responded yet.</p>';
    } else {
      box.innerHTML =
        '<table class="details-table" style="margin-top: 8px;">' +
        '<tr><th>Name</th><th>Blood Group</th><th>Email</th><th>Phone</th></tr>' +
        data.responders.map(function (response) {
          return '<tr><td>' + response.donor.fullName + '</td><td>' + response.donor.bloodGroup + '</td><td>' + response.donor.email + '</td><td>' + (response.donor.phoneNumber ? response.donor.phoneNumber : '-') + '</td></tr>';
        }).join('') +
        '</table>';
    }

    row.classList.remove('page-hidden');
  } catch (error) {
    alert(error.message);
  }
}

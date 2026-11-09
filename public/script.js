async function createAccount() {
  const userVal = document.getElementById('newUsername').value;
  const passVal = document.getElementById('newPassword').value;

  // show alert if field(s) are empty
  if (userVal === "" || passVal === "") {
    alert("Error: Username and Password cannot be empty.");
    return;
  }

  // send values to backend if not empty
  const response = await fetch('/api/create-account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username: userVal, password: passVal })
  });

  const data = await response.json();

  // account creation confirmation
  if (data.success) {
    alert(data.message);
    window.location.href = "index.html";
  }

}

// check local storage for 'Remember  Username'
window.onload = () => {
  const savedUser = localStorage.getItem('savedUsername');
  const rememberCheck = document.getElementById('rememberUser');

  // run only if on 'login' page
  if (rememberCheck && savedUser) {
    document.getElementById('loginUsername').value = savedUser;
    rememberCheck.checked = true;
  }
};

async function attemptLogin() {
  const userVal = document.getElementById('loginUsername').value;
  const passVal = document.getElementById('loginPassword').value;
  const rememberCheck = document.getElementById('rememberUser').checked;

  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: userVal, password: passVal })
  });

  const data = await response.json();

  // store credentials if checkbox selected
  if (data.success) {
    if (rememberCheck) {
      localStorage.setItem('savedUsername', userVal);
    } else {
      localStorage.removeItem('savedUsername');
    }

    sessionStorage.setItem('loggedInUserFile', data.accountFile);

    // load 'form.html' 
    window.location.href = "form.html";
  } else {
    alert(data.message);
  }
}

// Save data
async function submitSurvey() {
  const accountFile = sessionStorage.getItem('loggedInUserFile');

  if (!accountFile) {
    alert("Error: You are not logged in.");
    return;
  }

  // get value of checked radio button
  const beverageElement = document.querySelector('input[name="beverage"]:checked');
  const beverageValue = beverageElement ? beverageElement.value : "";

  // create data object
  const formData = {
    color: document.getElementById('favoriteColor').value,
    pet: document.getElementById('petPreference').value,
    beverage: beverageValue,
    bio: document.getElementById('userBio').value,
    luckyNumber: document.getElementById('luckyNumber').value
  };

  // send data to Express server
  const response = await fetch('/api/save-form', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accountFile: accountFile, formData: formData })
  });

  const data = await response.json();
  if (data.success) {
    alert(data.message);
  }

}

// Load data
async function loadSurveyData() {
  const accountFile = sessionStorage.getItem('loggedInUserFile');
  if (!accountFile) return;

  // request user's data from server
  const response = await fetch('/api/load-form', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accountFile: accountFile })
  });

  const data = await response.json();

  // fill inputs if data exists
  if (data.success && data.formData) {
    document.getElementById('favoriteColor').value = data.formData.color || "";
    document.getElementById('petPreference').value = data.formData.pet || "";
    document.getElementById('userBio').value = data.formData.bio || "";
    document.getElementById('luckyNumber').value = data.formData.luckyNumber || "";

    if (data.formData.beverage) {
      const radio = document.querySelector(`input[name="beverage"][value="${data.formData.beverage}"]`);
      if (radio) radio.checked = true;
    }
  }

}


// records page
let globalRecords = [];

async function loadRecordsPage() {
  const response = await fetch('/api/get-records');
  const data = await response.json();

  if (data.success) {
    globalRecords = data.records;
    const select = document.getElementById('accountSelect');

    // populate dropdown with all account IDs
    globalRecords.forEach(record => {
      const option = document.createElement('option');
      option.value = record.id;
      option.textContent = record.id;
      select.appendChild(option);
    });
  }
}

// function fires when dropdown selection changes
function displayRecord() {
  const selectedId = document.getElementById('accountSelect').value;
  const table = document.getElementById('recordsTable');
  const tbody = document.getElementById('tableBody');

  // clear previous rows
  tbody.innerHTML = "";

  if (!selectedId) {
    table.style.display = "none";
    return;
  }

  // find data for selected account ID
  const record = globalRecords.find(r => r.id === selectedId);

  if (record) {
    table.style.display = "table";

    const fields = [
      { label: 'Username', value: record.username },
      { label: 'Favorite Color', value: record.formData?.color },
      { label: 'Pet Preference', value: record.formData?.pet },
      { label: 'Beverage', value: record.formData?.beverage },
      { label: 'Short Bio', value: record.formData?.bio },
      { label: 'Lucky Number', value: record.formData?.luckyNumber }
    ];

    // generate table rows
    fields.forEach(field => {
      const tr = document.createElement('tr');
      const tdLabel = document.createElement('td');
      tdLabel.textContent = field.label;

      const tdValue = document.createElement('td');

      // reports if lableany entry is left empty
      if (field.value === "" || field.value === undefined || field.value === null) {
        tdValue.textContent = "(User left this empty)";
        tdValue.style.color = "red";
      } else {
        tdValue.textContent = field.value;
      }

      tr.appendChild(tdLabel);
      tr.appendChild(tdValue);
      tbody.appendChild(tr);
    });

  }
}

// run specific load functions
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('userDataForm')) {
    loadSurveyData();
  }

  if (document.getElementById('accountSelect')) {
    loadRecordsPage();
  }
});

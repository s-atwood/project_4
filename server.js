const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// JSON data parsing middleware
app.use(express.json());

// Serve all 'public' files automatically via express
app.use(express.static("public"));

// create account api
app.post("/api/create-account", (req, res) => {
  // retrieve username/password from frontend
  const { username, password } = req.body;

  // generate unnique account ID
  const accountId = "user_" + Date.now();

  // account file's name/path
  const accountFile = `users/${accountId}.json`;
  const accountFilePath = path.join(__dirname, "data", accountFile);

  // create new account file
  const newUserData = {
    id: accountId,
    username: username,
    password: password,
  };

  fs.writeFileSync(accountFilePath, JSON.stringify(newUserData));

  // open and read existing account list
  const accountListPath = path.join(__dirname, "data", "accounts.json");
  const rawData = fs.readFileSync(accountListPath, "utf8");
  const accounts = JSON.parse(rawData);

  // add new object to account list
  const newAccountEntry = {
    username: username,
    password: password,
    accountFile: accountFile,
  };

  accounts.push(newAccountEntry);

  fs.writeFileSync(accountListPath, JSON.stringify(accounts, null, 2));

  // send confirmation message to frontend
  res.json({ success: true, message: "Account created successfully" });
});

//
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const accountListPath = path.join(__dirname, "data", "accounts.json");

  // read account list json file during login
  const rawData = fs.readFileSync(accountListPath, "utf8");
  const accounts = JSON.parse(rawData);

  // check if account exists by reading json file
  const matchedAccount = accounts.find(
    (acc) => acc.username === username && acc.password === password,
  );

  if (matchedAccount) {
    res.json({ success: true, accountFile: matchedAccount.accountFile });
  } else {
    res.json({ success: false, message: "Login information is incorrect." });
  }
});

// Save form data
app.post("/api/save-form", (req, res) => {
  // record file path, form answers
  const { accountFile, formData } = req.body;
  const fileaPath = path.join(__dirname, "data", accountFile);

  // read account file
  const rawData = fs.readFileSync(fileaPath, "utf8");
  const userData = JSON.parse(rawData);

  // add/update form data
  userData.formData = formData;

  // save file with new data
  fs.writeFileSync(fileaPath, JSON.stringify(userData, null, 2));

  res.json({ success: true, message: "Survey saved successfully" });
});

// Load form data
app.post("/api/load-form", (req, res) => {
  const { accountFile } = req.body;
  const fileaPath = path.join(__dirname, "data", accountFile);

  // read file and send form data if it exists
  const rawData = fs.readFileSync(fileaPath, "utf8");
  const userData = JSON.parse(rawData);

  res.json({ success: true, formData: userData.formData || null });
});

// Get all records
app.get('/api/get-records', (req, res) => {
  const usersDir = path.join(__dirname, 'data', 'users');

  const files = fs.readdirSync(usersDir);
  const allRecords = [];

  files.forEach(file => {
    if (file.endsWith('.json')) {
      const rawData = fs.readFileSync(path.join(usersDir, file), 'utf8');
      const usersData = JSON.parse(rawData);

      delete usersData.password;

      allRecords.push(usersData);
    }
  })

  res.json({ success: true, records: allRecords });
});

// /Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

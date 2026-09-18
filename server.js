const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const usersFilePath = path.join(__dirname, "users.json");

function readUsers() {
  const data = fs.readFileSync(usersFilePath, "utf8");
  return JSON.parse(data);
}

function writeUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

// 1. Add a new user (ensure that the email doesn't exist before)
app.post("/user", (req, res) => {
  const users = readUsers();
  const { name, age, email } = req.body;

  const emailExists = users.some((user) => user.email === email);
  if (emailExists) {
    return res.json({ message: "Email already exists." });
  }

  const newUser = {
    id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
    name,
    age,
    email,
  };

  users.push(newUser);
  writeUsers(users);

  res.json({ message: "User added successfully." });
});

// 2. Update an existing user's name, age, or email by their ID (from params)
app.patch("/user/:id", (req, res) => {
  const users = readUsers();
  const userId = Number(req.params.id);
  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex === -1) {
    return res.json({ message: "User ID not found." });
  }

  const { name, age, email } = req.body;

  if (name !== undefined) {
    users[userIndex].name = name;
  }
  if (age !== undefined) {
    users[userIndex].age = age;
  }
  if (email !== undefined) {
    users[userIndex].email = email;
  }

  writeUsers(users);

  if (age !== undefined) {
    return res.json({ message: "User age updated successfully." });
  }
  res.json({ message: "User updated successfully." });
});

// 3. Delete a User by ID (from request body or optional params)
app.delete("/user{/:id}", (req, res) => {
  const users = readUsers();
  const userId = Number(req.params.id ?? req.body.id);
  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex === -1) {
    return res.json({ message: "User ID not found." });
  }

  users.splice(userIndex, 1);
  writeUsers(users);

  res.json({ message: "User deleted successfully." });
});

// 4. Get a user by their name (name provided as a query parameter)
app.get("/user/getByName", (req, res) => {
  const users = readUsers();
  const { name } = req.query;
  const user = users.find((user) => user.name === name);

  if (!user) {
    return res.json({ message: "User name not found." });
  }

  res.json(user);
});

// 6. Filter users by minimum age
app.get("/user/filter", (req, res) => {
  const users = readUsers();
  const minAge = Number(req.query.minAge);
  const filteredUsers = users.filter((user) => user.age >= minAge);

  if (filteredUsers.length === 0) {
    return res.json({ message: "no user found" });
  }

  res.json(filteredUsers);
});

// 5. Get all users from the JSON file
app.get("/user", (req, res) => {
  const users = readUsers();
  res.json(users);
});

// 7. Get User by ID
app.get("/user/:id", (req, res) => {
  const users = readUsers();
  const userId = Number(req.params.id);
  const user = users.find((user) => user.id === userId);

  if (!user) {
    return res.json({ message: "User not found." });
  }

  res.json(user);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

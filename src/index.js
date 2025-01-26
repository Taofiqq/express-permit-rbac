require("dotenv").config();
const express = require("express");
const documents = require("./routes/documents");

const app = express();
app.use(express.json());

// Mock auth middleware for demo
app.use((req, res, next) => {
  // Normally would verify token/session
  req.user = {
    id: req.headers["x-user-id"],
    tenantId: req.headers["x-tenant-id"],
  };
  next();
});

app.use("/documents", documents);

app.get("/health", (req, res) => {
  res.send("Server is up and running");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

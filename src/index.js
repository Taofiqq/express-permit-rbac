require("dotenv").config();
const express = require("express");
const cors = require("cors");
const permit = require("./permit");
const permitMiddleware = require("./middleware/permitMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

// In-memory storage to mimic DB
const tenants = [];
const users = [];

app.post("/create-tenant", async (req, res) => {
  try {
    const { tenantName, adminEmail, adminFirstName, adminLastName } = req.body;

    if (!tenantName || !adminEmail) {
      return res
        .status(400)
        .send({ error: "Tenant name and admin email are required." });
    }

    // Create A Tenant
    const tenantKey = tenantName.toLowerCase().replace(/\s+/g, "-");
    const tenantPayload = {
      key: tenantKey,
      name: tenantName,
      description: `Tenant for ${tenantName}`,
    };
    const createdTenant = await permit.api.createTenant(tenantPayload);

    // Save tenant in memory
    tenants.push(createdTenant);

    // Create Default Admin User
    const adminKey = `admin-${tenantKey}`;
    const userPayload = {
      key: adminKey,
      email: adminEmail,
      first_name: adminFirstName || "Admin",
      last_name: adminLastName || tenantName,
      attributes: { tenantKey },
    };
    const createdUser = await permit.api.syncUser(userPayload);

    // Save user in memory
    users.push({ ...createdUser, tenantKey, role: "admin" });

    // Assign Role to Admin User
    await permit.api.assignRole({
      user: adminKey,
      role: "admin",
      tenant: tenantKey,
    });

    res.status(201).send({
      message: "Tenant and admin user created successfully",
      tenant: createdTenant,
      adminUser: createdUser,
    });
  } catch (error) {
    console.error("Error registering tenant and admin user:", error);
    res.status(500).send({ error: "Failed to register tenant and admin user" });
  }
});

app.post("/users", permitMiddleware, async (req, res) => {
  const { key, email, first_name, last_name, role_assignments } = req.body;

  try {
    const userPayload = {
      key,
      email,
      first_name,
      last_name,
      role_assignments,
    };

    const user = await permit.api.createUser(userPayload);
    res.status(201).send({ message: "User created successfully.", user });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send({ error: "Failed to create user. Please try again." });
  }
});

app.get("/health", (req, res) => {
  console.log("permit", permit);
  res.send("Server is up and running");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

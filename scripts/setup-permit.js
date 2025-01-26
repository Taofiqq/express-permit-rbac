// scripts/setup-permit.js
require("dotenv").config();
const { Permit } = require("permitio");

const permit = new Permit({
  token: process.env.PERMIT_API_KEY,
  pdp: process.env.PERMIT_PDP_URL,
});

// Configuration for tenants and users. This can be modified according to your own tenant and users
const CONFIG = {
  tenants: [
    {
      key: "techcorp",
      name: "TechCorp",
      description: "Technical Documentation Management",
    },
    {
      key: "financehub",
      name: "FinanceHub",
      description: "Financial Document Management",
    },
  ],
  users: [
    // TechCorp Users
    {
      key: "tech_admin",
      email: "tech_admin@techcorp.com",
      firstName: "Tech",
      lastName: "Admin",
      tenant: "techcorp",
      role: "admin",
    },
    {
      key: "tech_editor",
      email: "tech_editor@techcorp.com",
      firstName: "Tech",
      lastName: "Editor",
      tenant: "techcorp",
      role: "editor",
    },
    {
      key: "tech_viewer",
      email: "tech_viewer@techcorp.com",
      firstName: "Tech",
      lastName: "Viewer",
      tenant: "techcorp",
      role: "viewer",
    },
    // FinanceHub Users
    {
      key: "finance_admin",
      email: "finance_admin@financehub.com",
      firstName: "Finance",
      lastName: "Admin",
      tenant: "financehub",
      role: "admin",
    },
    {
      key: "finance_editor",
      email: "finance_editor@financehub.com",
      firstName: "Finance",
      lastName: "Editor",
      tenant: "financehub",
      role: "editor",
    },
    {
      key: "finance_viewer",
      email: "finance_viewer@financehub.com",
      firstName: "Finance",
      lastName: "Viewer",
      tenant: "financehub",
      role: "viewer",
    },
  ],
};

async function setupResource() {
  try {
    console.log("Creating Document resource...");
    await permit.api.createResource({
      key: "document",
      name: "Document",
      description: "Document resource for multi-tenant management",
      actions: [
        { key: "create", name: "Create Document" },
        { key: "read", name: "Read Document" },
        { key: "update", name: "Update Document" },
        { key: "delete", name: "Delete Document" },
      ],
    });
    console.log("✓ Document resource created");
  } catch (error) {
    if (error.message.includes("already exists")) {
      console.log("ℹ Document resource already exists");
    } else {
      throw error;
    }
  }
}

async function setupTenants() {
  for (const tenant of CONFIG.tenants) {
    try {
      console.log(`Creating tenant: ${tenant.name}...`);
      await permit.api.createTenant(tenant);
      console.log(`✓ Created tenant: ${tenant.name}`);
    } catch (error) {
      if (error.message.includes("already exists")) {
        console.log(`ℹ Tenant ${tenant.name} already exists`);
      } else {
        throw error;
      }
    }
  }
}

async function setupUsers() {
  for (const user of CONFIG.users) {
    try {
      console.log(`Creating user: ${user.email}...`);

      // Sync user to Permit.io
      await permit.api.syncUser({
        key: user.key,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        attributes: { tenantId: user.tenant },
      });

      // Assign role to user
      await permit.api.assignRole({
        user: user.key,
        role: user.role,
        tenant: user.tenant,
      });

      console.log(`✓ Created user: ${user.email} with role: ${user.role}`);
    } catch (error) {
      if (error.message.includes("already exists")) {
        console.log(`ℹ User ${user.email} already exists`);
      } else {
        throw error;
      }
    }
  }
}

async function setupPermit() {
  try {
    console.log("Starting Permit.io setup...\n");

    // Setup in sequence
    await setupResource();
    console.log("");

    await setupTenants();
    console.log("");

    await setupUsers();
    console.log("\n✓ Permit.io setup completed successfully");
  } catch (error) {
    console.error("\n❌ Setup failed:", error.message);
    if (error.response?.data) {
      console.error("Error details:", error.response.data);
    }
    process.exit(1);
  }
}

// Run setup
setupPermit();

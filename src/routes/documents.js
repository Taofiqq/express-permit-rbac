const router = require("express").Router();
const checkPermission = require("../middleware/permit");

// In-memory document store for demo
const documents = [
  {
    id: 1,
    title: "Tech Roadmap 2025",
    content: "AI integration plans and cloud migration strategy",
    tenantId: "techcorp",
    createdBy: "tech_admin@techcorp.com",
  },
  {
    id: 2,
    title: "Q1 Financial Report",
    content: "First quarter financial analysis and projections",
    tenantId: "financehub",
    createdBy: "finance_admin@financehub.com",
  },
  {
    id: 3,
    title: "Development Guidelines",
    content: "Coding standards and best practices",
    tenantId: "techcorp",
    createdBy: "tech_editor@techcorp.com",
  },

  {
    id: 4,
    title: "Investment Strategy",
    content: "2025 investment guidelines and portfolio allocation",
    tenantId: "financehub",
    createdBy: "finance_editor@financehub.com",
  },
];

// Get all documents (tenant-specific)
router.get("/", checkPermission("read"), (req, res) => {
  const tenantDocs = documents.filter(
    (doc) => doc.tenantId === req.user.tenantId
  );
  res.json(tenantDocs);
});

// Create document
router.post("/", checkPermission("create"), (req, res) => {
  const { title, content } = req.body;
  const doc = {
    id: Date.now(),
    title,
    content,
    tenantId: req.user.tenantId,
    createdBy: req.user.id,
  };

  documents.push(doc);
  res.status(201).json(doc);
});

// Update document
router.put("/:id", checkPermission("update"), (req, res) => {
  const { title, content } = req.body;
  const docIndex = documents.findIndex(
    (d) => d.id === parseInt(req.params.id) && d.tenantId === req.user.tenantId
  );

  if (docIndex === -1) {
    return res.status(404).json({ error: "Document not found" });
  }

  documents[docIndex] = {
    ...documents[docIndex],
    title: title || documents[docIndex].title,
    content: content || documents[docIndex].content,
  };

  res.json(documents[docIndex]);
});

// Delete document
router.delete("/:id", checkPermission("delete"), (req, res) => {
  const docIndex = documents.findIndex(
    (d) => d.id === parseInt(req.params.id) && d.tenantId === req.user.tenantId
  );

  if (docIndex === -1) {
    return res.status(404).json({ error: "Document not found" });
  }

  documents.splice(docIndex, 1);
  res.status(204).send();
});

module.exports = router;

const router = require("express").Router();
const { requireAuth, allowRoles } = require("../middleware/auth");
const { myRegistrations } = require("../controllers/eventController");

router.get("/mine", requireAuth, allowRoles("student"), myRegistrations);

module.exports = router;

const router = require("express").Router();
const controller = require("../controllers/eventController");
const { requireAuth, allowRoles } = require("../middleware/auth");

router.get("/", controller.listEvents);
router.get("/manage", requireAuth, allowRoles("organizer", "admin"), controller.manageEvents);
router.get("/:id/registrations", requireAuth, allowRoles("organizer", "admin"), controller.eventRegistrations);
router.post("/:id/check-in", requireAuth, allowRoles("organizer", "admin"), controller.checkInParticipant);
router.patch("/:id/approve", requireAuth, allowRoles("admin"), controller.approveEvent);
router.post("/:id/register", requireAuth, allowRoles("student"), controller.registerForEvent);
router.delete("/:id/register", requireAuth, allowRoles("student"), controller.cancelRegistration);
router.get("/:id", controller.getEvent);
router.post("/", requireAuth, allowRoles("organizer", "admin"), controller.createEvent);
router.patch("/:id", requireAuth, allowRoles("organizer", "admin"), controller.updateEvent);

module.exports = router;

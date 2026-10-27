const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const controller = require("../controllers/notificationController");
router.use(requireAuth);
router.get("/", controller.listNotifications);
router.patch("/read-all", controller.markAllAsRead);
router.patch("/:id/read", controller.markAsRead);
module.exports = router;

import express from "express";
import multer from "multer";
import MyResturantController from "../controllers/MyResturantController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyResturantRequest } from "../middleware/validation";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.get(
  "/order",
  jwtCheck,
  jwtParse,
  MyResturantController.getMyResturantOrders
);

router.patch(
  "/order/:orderId/status",
  jwtCheck,
  jwtParse,
  MyResturantController.updateOrderStatus
);

router.get("/", jwtCheck, jwtParse, MyResturantController.getMyResturant);

router.post(
  "/",
  upload.single("imageFile"),
  validateMyResturantRequest,
  jwtCheck,
  jwtParse,
  MyResturantController.createMyResturant
);

router.put(
  "/",
  upload.single("imageFile"),
  validateMyResturantRequest,
  jwtCheck,
  jwtParse,
  MyResturantController.updateMyResturant
);

export default router;

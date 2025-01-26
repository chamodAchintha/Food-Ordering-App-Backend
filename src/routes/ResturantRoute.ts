import express from "express";
import { param } from "express-validator";
import ResturantController from "../controllers/ResturantContrller";

const router = express.Router();

router.get(
  "/:resturantId",
  param("resturantId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("ResturantId paramenter must be a valid string"),
  ResturantController.getResturant
);

router.get(
  "/search/:city",
  param("city")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("City paramenter must be a valid string"),
  ResturantController.searchResturant
);

export default router;

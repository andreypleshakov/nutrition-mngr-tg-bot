import express from "express";
import { getProducts } from "./productsController";

const router = express.Router();

router.get("/:tgId", getProducts);

export default router;

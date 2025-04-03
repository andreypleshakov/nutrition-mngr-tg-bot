import express from "express";
import { getUsers, getUser } from "./userController";

const router = express.Router();

router.get("/", getUsers);
router.get("/:tgId", getUser);

export default router;

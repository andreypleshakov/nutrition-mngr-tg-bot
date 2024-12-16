import express from "express";
import { getUser, getUsers } from "./userController";

const router = express.Router();

router.get("/", getUsers);
router.get("/:tgId", getUser);

export default router;
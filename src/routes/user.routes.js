import express from "express";
import {  getUserAccount, getAllUsers } from "../controllers/user.controller.js";

const router = express.Router();



router.get("/allUsers", getAllUsers);
router.post("/user", getUserAccount);



export default router;

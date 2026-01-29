import express from "express";
import Account from "../models/Account.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const accounts = await Account.find().sort({ createdAt: 1 });
    res.json(accounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch accounts" });
  }
});

router.post("/", async (req, res) => {
  try {
    const account = await Account.create(req.body);
    res.status(201).json(account);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to create account", error: err.message });
  }
});

export default router;


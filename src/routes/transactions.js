import express from "express";
import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";


const router = express.Router();

// Helper to apply account balance effects
async function applyAccountEffects(transaction, isReversal = false) {
  const factor = isReversal ? -1 : 1;
  const amount = transaction.amount * factor;

  if (transaction.type === "income" && transaction.toAccount) {
    await Account.findByIdAndUpdate(transaction.toAccount, {
      $inc: { balance: amount },
    });
  } else if (transaction.type === "expense" && transaction.fromAccount) {
    await Account.findByIdAndUpdate(transaction.fromAccount, {
      $inc: { balance: -amount },
    });
  } else if (transaction.type === "transfer" && transaction.fromAccount && transaction.toAccount) {
    await Account.findByIdAndUpdate(transaction.fromAccount, {
      $inc: { balance: -amount },
    });
    await Account.findByIdAndUpdate(transaction.toAccount, {
      $inc: { balance: amount },
    });
  }
}

// Create transaction
router.post("/", async (req, res) => {
  try {
    const payload = req.body;
    const occurredAt = payload.occurredAt ? new Date(payload.occurredAt) : new Date();

    const tx = await Transaction.create({
      ...payload,
      occurredAt,
    });

    await applyAccountEffects(tx, false);

    const populatedTx = await Transaction.findById(tx._id)
      .populate("fromAccount", "name type balance")
      .populate("toAccount", "name type balance");

    res.status(201).json(populatedTx);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to create transaction", error: err.message });
  }
});

// List / filter transactions
router.get("/", async (req, res) => {
  try {
    const {
      division,
      category,
      type,
      fromDate,
      toDate,
      limit = 100,
      sort = "desc",
    } = req.query;

    const query = {};
    if (division) query.division = division;
    if (category) query.category = category;
    if (type) query.type = type;

    if (fromDate || toDate) {
      query.occurredAt = {};
      if (fromDate) query.occurredAt.$gte = new Date(fromDate);
      if (toDate) query.occurredAt.$lte = new Date(toDate);
    }

    const txs = await Transaction.find(query)
      .populate("fromAccount", "name type balance")
      .populate("toAccount", "name type balance")
      .sort({ occurredAt: sort === "asc" ? 1 : -1 })
      .limit(Number(limit));

    res.json(txs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

// Update transaction (only if within 12 hours)
router.put("/:id", async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const now = new Date();
    const diffHours = (now - tx.createdAt) / (1000 * 60 * 60);
    if (diffHours > 12) {
      return res.status(403).json({ message: "Transaction cannot be edited after 12 hours" });
    }

    // reverse previous account effects
    await applyAccountEffects(tx, true);

    Object.assign(tx, req.body);
    if (req.body.occurredAt) {
      tx.occurredAt = new Date(req.body.occurredAt);
    }
    await tx.save();

    // apply new account effects
    await applyAccountEffects(tx, false);

    const populatedTx = await Transaction.findById(tx._id)
      .populate("fromAccount", "name type balance")
      .populate("toAccount", "name type balance");

    res.json(populatedTx);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to update transaction", error: err.message });
  }
});

// Delete transaction (optional helper)
router.delete("/:id", async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    await applyAccountEffects(tx, true);
    await tx.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete transaction" });
  }
});

export default router;


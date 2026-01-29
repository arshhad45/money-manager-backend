import express from "express";
import Transaction from "../models/Transaction.js";

const router = express.Router();

// Helpers to build date ranges
function getMonthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function getWeekRange(date = new Date()) {
  const day = date.getDay(); // 0 = Sunday
  const diffToMonday = (day + 6) % 7;
  const start = new Date(date);
  start.setDate(date.getDate() - diffToMonday);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function getYearRange(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 1);
  const end = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
  return { start, end };
}

async function aggregateIncomeExpense(range) {
  const matchStage = { occurredAt: { $gte: range.start, $lte: range.end } };
  const result = await Transaction.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
      },
    },
  ]);

  const summary = { income: 0, expense: 0, transfer: 0 };
  result.forEach((r) => {
    summary[r._id] = r.total;
  });
  return summary;
}

router.get("/summary", async (req, res) => {
  try {
    const now = new Date();
    const month = await aggregateIncomeExpense(getMonthRange(now));
    const week = await aggregateIncomeExpense(getWeekRange(now));
    const year = await aggregateIncomeExpense(getYearRange(now));

    res.json({ month, week, year });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch summary" });
  }
});

// Category-wise summary
router.get("/categories", async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const match = {};
    if (fromDate || toDate) {
      match.occurredAt = {};
      if (fromDate) match.occurredAt.$gte = new Date(fromDate);
      if (toDate) match.occurredAt.$lte = new Date(toDate);
    }

    const result = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: { category: "$category", type: "$type" },
          total: { $sum: "$amount" },
        },
      },
    ]);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch categories summary" });
  }
});

export default router;


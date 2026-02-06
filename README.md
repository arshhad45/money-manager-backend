# Money Manager – Backend

A RESTful backend API for the Money Manager web application that manages income, expenses, accounts, and financial summaries.  
Built using Node.js, Express, and MongoDB Atlas, this backend handles all business logic and data persistence.

---
##  Live Application

**Frontend (Vercel):**  
https://money-manager-frontend-eight.vercel.app/

**Backend API:**  
https://money-manager-backend-1-51q8.onrender.com/


> Note: The backend is hosted on a free tier. The first request may take a few seconds due to cold start.

---

##  Money Manager – Project Description
## What Was Built
Money Manager is a full-stack web application for managing personal and business finances. It helps users record transactions, track spending, manage accounts, and view financial summaries.

## Problem It Solves
-Managing income and expenses manually is time-consuming and error-prone. Users need a single place to:
Record income and expenses with clear categorization
Separate personal and office spending
See financial summaries across different time periods
Correct recent mistakes in a controlled way
Move money between accounts and track balances
Filter and analyze spending by category and date
## How It Solves the Problem
Transaction Management
Users can add income and expenses through a modal with two tabs (Income and Expense). Each transaction includes date and time, a short description, category (e.g., fuel, food, medical, loan), and division (Personal or Office). This keeps records structured and easy to analyze.
## Financial Tracking
A dashboard shows income and expenses for monthly, weekly, and yearly periods, with net amounts. Users can quickly see their financial position over different time ranges.
## Filtering and Search
Filters let users narrow down transactions by division (Personal/Office), category, and date range (from–to), so they can analyze specific subsets of their finances without manual sorting.
## Controlled Editing
Transactions can be edited only within 12 hours of creation. This allows quick corrections while preventing long-term changes that could affect financial reporting.
## Category Summary
A summary panel shows totals per category (income and expense), helping users see where money is spent or earned.
## Account Management and Transfers
Users can create accounts (e.g., Cash, Bank, Card) and:
Link income/expense to specific accounts
Transfer money between accounts
See balances update automatically
## Result
The app centralizes personal and business financial data, supports quick corrections, and provides a clear view of spending and income through filters, summaries, and account tracking, making financial management simpler and more accurate.
---

## 🧩 Project Overview

This backend provides APIs to:

- Create and manage income and expense transactions  
- Categorize transactions (food, fuel, medical, etc.)  
- Separate transactions into Personal and Office divisions  
- Track transactions with date and time  
- Enforce a 12-hour edit restriction for transactions  
- Manage account balances and transfers between accounts  
- Support filtered and date-based transaction queries  
- Provide aggregated data for weekly, monthly, and yearly reports  

This repository contains only the backend of the application.

---

## 🛠 Tech Stack

- Node.js  
- Express.js  
- MongoDB Atlas  
- Mongoose  
- Render  

---

## 📁 Project Structure

- src/
- ├── models/
- │ ├── Transaction.js
- │ └── Account.js
- ├── routes/
- │ ├── transactions.js
- │ ├── accounts.js
- │ └── stats.js
- ├── index.js


---

## 🔐 Environment Variables

The backend uses environment variables for configuration.

### Required Variables

Create a `.env` file in the project root:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/money_manager
PORT=4000
.env is ignored and must not be committed to GitHub.

▶️ Running Locally
Clone the repository:

git clone https://github.com/<your-username>/money-manager-backend.git
cd money-manager-backend
Install dependencies:

npm install
Start the server:

npm start
The API will run on:

http://localhost:4000

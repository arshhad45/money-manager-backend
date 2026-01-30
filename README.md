# Money Manager – Backend

A RESTful backend API for the Money Manager web application that manages income, expenses, accounts, and financial summaries.  
Built using Node.js, Express, and MongoDB Atlas, this backend handles all business logic and data persistence.

---

## 🔗 Live API

**Backend (Render):**  
https://money-manager-backend-1-51q8.onrender.com/

> Note: The backend is hosted on a free tier. The first request may take a few seconds due to cold start.

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

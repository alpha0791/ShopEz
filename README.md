# ShopEZ — Virtual Stock Trading Platform 📈

<div align="center">

![ShopEZ Banner](https://img.shields.io/badge/ShopEZ-Stock%20Trading%20Simulator-3b82f6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTV6TTIgMTdsOSA1IDEwLTV2LTVsLTEwIDV6Ii8+PC9zdmc+)

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7+-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)

**Experience the thrill of the stock market without risking a dime.**

</div>

---

## 📖 About The Project

**What is ShopEZ?**  
ShopEZ is a full-stack web application that simulates a real-world stock trading environment. It is designed for beginners who want to learn how stock trading works, or experienced traders who want to test out strategies in a safe, risk-free setting.

**How does it work?**  
When you create an account, you are instantly granted a virtual bankroll of **₹1,00,000**. You can browse a live market dashboard featuring top companies, analyze their historical price charts, and execute buy or sell orders. The platform automatically tracks your portfolio's value, calculating your profits and losses in real-time as simulated stock prices fluctuate.

---

## ✨ What Can You Do? (Key Features)

### 🧑‍💻 For Users (Traders)
- **Start Trading Instantly:** Get ₹1,00,000 in virtual capital upon sign-up.
- **Explore the Market:** View a live dashboard of stocks with simulated price updates auto-refreshing every 30 seconds.
- **Analyze Trends:** View interactive price history charts (choose between 7, 14, 30, or 60 days) to make informed decisions.
- **Execute Trades:** Buy and sell shares instantly. The system ensures you have enough balance or stock holdings before completing the trade.
- **Track Your Portfolio:** Monitor your active holdings, total invested amount, and see your Unrealized (current) and Realized (cashed out) Profit & Loss.
- **Review History:** Access a complete audit trail of every transaction you've made.

### 🛡️ For Administrators
- **Platform Overview:** View high-level statistics including total users, active stocks, and total trade volume across the app.
- **User Management:** See who is trading on the platform, promote users to admins, or remove accounts.
- **Market Control:** Manually trigger price simulations for specific stocks to keep the market dynamic.
- **Activity Feed:** Monitor all buy and sell transactions happening across the platform in real-time.

---

## 📸 Sneak Peek

*(Note: Add your actual screenshots here before publishing to GitHub!)*

* **Market Dashboard:** Where you discover stocks and watch prices move.
* **Stock Details:** Where you analyze charts and place orders.
* **My Portfolio:** Where you track your wealth and performance.
* **Admin Panel:** Where you oversee the entire platform.

---

## 🛠 Built With (Tech Stack)

ShopEZ is built using the **MERN** stack, ensuring high performance, scalability, and a modern developer experience.

* **Frontend:** React 18, Vite, React Router v6, Recharts (for beautiful data visualization), Vanilla CSS (custom dark theme design system).
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB, Mongoose ODM.
* **Security & Auth:** JSON Web Tokens (JWT) for stateless authentication, bcryptjs for secure password hashing.

---

## 🚀 Getting Started

Want to run this project locally on your machine? Follow these simple steps.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) installed locally, or a MongoDB Atlas URI.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/shopez.git
cd shopez
```

### 2. Set Up the Backend
Navigate to the backend folder and install the dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory and add your configuration:
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/shopez
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
VIRTUAL_BALANCE=100000
```

### 3. Seed the Database with Initial Data
This command populates your database with 20 stocks and two demo user accounts so you can start testing immediately.
```bash
node utils/seed.js
```

### 4. Set Up the Frontend
Open a new terminal window, navigate to the frontend folder, and install its dependencies:
```bash
cd ../frontend
npm install
```

### 5. Run the Application
You'll need two terminal windows open to run both the backend and frontend simultaneously.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Open your browser and navigate to `http://localhost:5173`. Happy trading! 🎉

---

## 🔑 Demo Accounts

If you ran the database seed script in step 3, you can log in using these credentials to explore the platform without creating a new account:

* **Trader Account:** `demo@shopez.com` / `Demo@123`
* **Admin Account:** `admin@shopez.com` / `Admin@123`

---

## 📁 Project Architecture

The repository is structured as a monorepo containing both the client and server code:

* `/backend` - Contains the Express.js API, MongoDB models, authentication logic, and trade execution controllers.
* `/frontend` - Contains the React single-page application, API client (Axios), context providers for state management, and all UI components.

---

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).

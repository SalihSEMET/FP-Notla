# 🚀 NOTLA. | The Ultimate Academic Note Marketplace

<div align="center">
  <img src="./notla-frontend/public/logo.png" alt="Notla Logo" width="120" height="120">
  <br/>
  <br/>
  <p>
    <b>A peer-to-peer digital marketplace empowering students to buy, sell, and discover high-quality academic notes.</b>
  </p>
  
  [![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)]()
  [![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)]()
  [![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)]()
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)]()
  [![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?style=for-the-badge&logo=microsoft-sql-server&logoColor=white)]()
</div>

---

## 📖 About The Project

**Notla** is a comprehensive, full-stack e-commerce platform built specifically for the academic ecosystem. It bridges the gap between successful students and those seeking reliable study materials. Sellers can monetize their hard work, while buyers gain instant access to a curated library of resources.

Built with an unwavering commitment to **Clean Architecture** principles, the backend provides a robust, scalable, and secure RESTful API using ASP.NET Core. The frontend, powered by React and Tailwind CSS, delivers a seamless, highly interactive, and intuitive user experience.

---

## ✨ Key Features & Technical Highlights

### 🛍️ Dynamic Marketplace & Cart System
* **Advanced Filtering & Sorting:** Browse notes by category, price range, and upload date. Sort by "Trending", "Newest", "Price (Asc/Desc)", and "Highest Rated".
* **Secure Checkout Flow:** Add items to cart, calculate dynamic subtotals, and process purchases via a robust backend transaction system.
* **Discount Engine:** Support for dynamic discount codes (Percentage & Fixed Amount) with complex rules (minimum cart limits, expiration dates, specific seller scopes).

### 📈 Advanced Seller Dashboard
* **Real-time Analytics:** Sellers have access to a dedicated dashboard tracking Total Earnings, Total Sales, Active Notes, and View Counts.
* **Data Visualization:** Integrated **Recharts** to display interactive Bar Charts (Top 5 Most Viewed Notes) and Pie Charts (Sales Distribution).

### 🛡️ Admin Command Center
* **Note Moderation:** Every uploaded note goes through an admin pipeline. Admins can inspect cover images, sample pages, and original/demo PDFs securely in-browser before Approving or Rejecting.
* **Platform Control:** Admins manage categories and oversee the overall health of the marketplace.

### ✉️ Automated SMTP Email Workflows
Fully integrated dynamic email notifications keeping users in the loop:
* **Onboarding:** "Welcome" emails upon successful registration.
* **Moderation Flow:** "Under Review", "Approved", and "Rejected" notifications for sellers.
* **Transactions:** Detailed "Order Receipt" emails post-checkout, detailing the purchased notes and total amounts.

### 👥 Interactive Social Ecosystem
* **User Reviews & Ratings:** Buyers can leave 1-5 star ratings and comments on purchased notes.
* **Store Following:** Users can follow their favorite sellers to keep track of their latest uploads.
* **Favorites Library:** Bookmark notes for quick access later.

### 🏗️ Enterprise-Grade Architecture
* **Clean Architecture:** Strict separation of concerns (Core, Repository, Service, API) ensuring maintainability.
* **Performance Optimization:** Implemented `IMemoryCache` for high-traffic endpoints (Trending Notes, Approved Notes) to drastically reduce database load.
* **Security:** JWT (JSON Web Token) Authentication, Role-based Authorization (Admin, User), and secure file handling for sensitive PDFs.

---

## 💻 Tech Stack

### Backend
* **Framework:** ASP.NET Core Web API (.NET 8)
* **ORM:** Entity Framework Core
* **Database:** Microsoft SQL Server
* **Authentication:** ASP.NET Core Identity & JWT Bearer
* **Architecture:** Clean Architecture, Repository Pattern, Unit of Work
* **Tools:** AutoMapper, MemoryCache, SMTP Client

### Frontend
* **Library:** React (Functional Components, Hooks)
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **Routing:** React Router DOM
* **State Management/Requests:** Axios
* **Data Visualization:** Recharts
* **Utility:** JWT-Decode

---

## 🛠️ Getting Started

Follow these steps to set up the project locally for development and testing.

### Prerequisites
* [.NET 8 SDK](https://dotnet.microsoft.com/download)
* [Node.js](https://nodejs.org/) (v18 or higher)
* Microsoft SQL Server

### 1. Backend Setup (API)
1. Clone the repository and navigate to the backend folder:
   ```bash
   git clone [https://github.com/SalihSEMET/FP-Notla.git](https://github.com/SalihSEMET/FP-Notla.git)
   cd Notla/Notla.API
Update the appsettings.json file with your SQL Server connection string and SMTP details:

JSON
"ConnectionStrings": {
  "SqlConnection": "Server=.\\SQLEXPRESS;Database=NotlaDB;Trusted_Connection=True;TrustServerCertificate=True;"
},
"EmailSettings": {
  "SmtpServer": "smtp.gmail.com",
  "SmtpPort": 587,
  "SenderEmail": "your-admin-email",
  "SenderPassword": "your-app-password"
}
Apply database migrations to create the schema:

Bash
dotnet ef database update --project ../Notla.Repository
Run the API:

Bash
dotnet run
The API will typically run on http://localhost:5261.

2. Frontend Setup (Client)
Open a new terminal and navigate to the frontend directory:

Bash
cd Notla/notla-frontend
Install the required NPM packages:

Bash
npm install
Start the Vite development server:

Bash
npm run dev
The frontend will typically run on http://localhost:5173.

🧹 Database Reset (Development Mode)
If you need to completely wipe the database and start fresh for testing, run the following commands in the backend directory:

Bash
dotnet ef database drop --project ../Notla.Repository
dotnet ef database update --project ../Notla.Repository
🤝 Contributing
Contributions, issues, and feature requests are welcome!

1. Fork the Project

2. Create your Feature Branch (git checkout -b feature/AmazingFeature)

3. Commit your Changes (git commit -m 'feat: Add some AmazingFeature')

4. Push to the Branch (git push origin feature/AmazingFeature)

5. Open a Pull Request

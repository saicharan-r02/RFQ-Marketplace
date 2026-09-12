<h2>Live Demo</h2>

  [Click here to view the live demo](https://b2b-rfq-marketplace.netlify.app/)

<h1>User Login – Buyer & Supplier Authentication</h1>

![Alt Text](https://github.com/saicharan-r02/RFQ-Marketplace/blob/main/public/User%20Login%20%E2%80%93%20Buyer%20and%20Supplier%20Authentication.png)

<h1>User Registration – Account Creation</h1>

![Alt Text](https://github.com/saicharan-r02/RFQ-Marketplace/blob/main/public/User%20Registration%20%E2%80%93%20Buyer%26Supplier%20Account%20Creation.png)

<h1>Buyer Command Center – RFQ Management Dashboard</h1>

![Alt Text](https://github.com/saicharan-r02/RFQ-Marketplace/blob/main/public/Buyer%20Command%20Center%20%E2%80%93%20RFQ%20Management%20Dashboard.png)

<h1>Buyer Analytics – Procurement Insights Dashboard</h1>

![Alt Text](https://github.com/saicharan-r02/RFQ-Marketplace/blob/main/public/Buyer%20Analytics%20%E2%80%93%20Procurement%20Insights%20Dashboard.png)

<h1>Buyer Procurement Analytics – Category Spend & Status Overview</h1>

![Alt Text](https://github.com/saicharan-r02/RFQ-Marketplace/blob/main/public/Buyer%20Procurement%20Analytics%20%E2%80%93%20Category%20Spend%20%26%20Status%20Overview.png)

<h1>Create RFQ – Request for Quotation Form</h1>

![Alt Text](https://github.com/saicharan-r02/RFQ-Marketplace/blob/main/public/Create%20RFQ%20%E2%80%93%20Request%20for%20Quotation%20Form.png)

<h1>RFQ Marketplace – Supplier RFQ Discovery</h1>

![Alt Text](https://github.com/saicharan-r02/RFQ-Marketplace/blob/main/public/RFQ%20Marketplace%20%E2%80%93%20Supplier%20RFQ%20Discovery.png)

<h1>Supplier Quotations – Quote Management Dashboard</h1>

![Alt Text](https://github.com/saicharan-r02/RFQ-Marketplace/blob/main/public/Supplier%20Quotations%20%E2%80%93%20Quote%20Management%20Dashboard.png)

<h1>Supplier Analytics – Bid Performance Dashboard</h1>

![Alt Text](https://github.com/saicharan-r02/RFQ-Marketplace/blob/main/public/Supplier%20Analytics%20%E2%80%93%20Bid%20Performance%20Dashboard.png)

## Installation and Setup

### Backend Repository Setup

1. **Clone the Backend Repository:**
   ```bash
   git clone https://github.com/saicharan-r02/RFQ-Marketplace
   cd RFQ-Marketplace/server
   ```
   
2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables Setup:**
   ```bash
   PORT=5000
   DATABASE_URL="file:./dev.db"
   JWT_SECRET=your_super_secret_jwt_key_here
   CLIENT_URL=http://localhost:5173
   ```

4. **Database Migration and Seeder:**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run seed
   ```
     
5. **Start the Backend Server:**
   ```bash
   npm run dev
   # The backend will run on: http://localhost:5000
   ```

### Frontend Repository Setup

1. **Clone the Frontend Repository:**
   ```bash
   git clone https://github.com/saicharan-r02/RFQ-Marketplace
   cd RFQ-Marketplace/client
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables Setup:**
   ```bash
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the Frontend Development Server:**
   ```bash
   npm run dev
   # The frontend will run on: http://localhost:5173
   ```

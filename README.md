<h2>Live Demo</h2>

  [Click here to view the live demo](https://b2b-rfq-marketplace.netlify.app/)

<h1>User Login – Buyer & Supplier Authentication</h1>

![Login Page](<public/User Login – Buyer and Supplier Authentication.png>)

<h1>User Registration – Account Creation</h1>

![Registration Page](<public/User Registration – Buyer and Supplier Account Creation.png>)

<h1>Buyer Command Center – RFQ Management Dashboard</h1>

![Buyer Command Center](<public/Buyer Command Center – RFQ Management Dashboard.png>)

<h1>Buyer Analytics – Procurement Insights Dashboard</h1>

![Buyer Analytics](<public/Buyer Analytics – Procurement Insights Dashboard.png>)

<h1>Buyer Procurement Analytics – Category Spend & Status Overview</h1>

![Buyer Procurement Analytics](<public/Buyer Procurement Analytics – Category Spend & Status Overview.png>)

<h1>Create RFQ – Request for Quotation Form</h1>

![Create RFQ](<public/Create RFQ – Request for Quotation Form.png>)

<h1>RFQ Marketplace – Supplier RFQ Discovery</h1>

![RFQ Marketplace](<public/RFQ Marketplace – Supplier RFQ Discovery.png>)

<h1>Supplier Quotations – Quote Management Dashboard</h1>

![Supplier Quotations](<public/Supplier Quotations – Quote Management Dashboard.png>)

<h1>Supplier Analytics – Bid Performance Dashboard</h1>

![Supplier Analytics](<public/Supplier Analytics – Bid Performance Dashboard.png>)

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

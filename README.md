# Stock Management System

A comprehensive front-end stock management application built with React.js that allows users to manage products, categories, invoices, and generate reports.

## Features

### User Authentication

- Login and Sign up functionality
- Manager privileges for advanced features

### Product Management

- Add new products
- Edit existing products
- Delete products
- Assign products to categories

### Category Management

- Create main categories
- Create subcategories
- Edit categories/subcategories
- Delete categories/subcategories

### Invoice Management

- Create new invoices
- Update existing invoices
- Delete invoices
- Track advanced payments
- Add products to invoices

### Reporting

- Generate daily reports
- View sales and inventory statistics
- Track business performance

## Tech Stack

- **Framework**: React.js with Vite
- **State Management**: React Context API/Redux
- **HTTP Client**: Axios
- **UI Components**: Custom components with icon libraries
- **Chat Functionality**: Integrated chat system

## Project Structure

All components are organized in their respective folders within the `src` directory:

```
src/
├── assets/
├── components/
│   ├── Auth/
│   ├── Products/
│   ├── Categories/
│   ├── Invoices/
│   ├── Reports/
│   ├── Dashboard/
├── App.jsx
└── main.jsx
```

## Installation and Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd stock-management-system
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Install additional packages:

   ```bash
   # Vite
   npm install vite --save-dev

   # Axios for API requests
   npm install axios

   # Icons
   npm install @fortawesome/react-fontawesome
   npm install @fortawesome/free-solid-svg-icons

   # Chat functionality
   npm install socket.io-client
   npm install chart.js react-chartjs-2
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Usage

### Authentication

- Sign up with your email and password
- Login with your credentials
- User: GipsZ1
- Email: bantargipson@gmail.com

### Managing Products

1. Navigate to the Products section
2. Add new products by filling out the product form
3. Edit products by clicking the edit button
4. Delete products by clicking the delete button
5. Assign products to specific categories

### Managing Categories

1. Navigate to the Categories section
2. Create new categories and subcategories
3. Edit categories by clicking the edit button
4. Delete categories by clicking the delete button

### Creating Invoices

1. Navigate to the Invoices section
2. Click "New Invoice"
3. Add products to the invoice
4. Enter advanced payment information
5. Save the invoice
6. Print or download as needed

### Generating Reports

1. Navigate to the Reports section
2. Select the date range
3. Generate comprehensive reports of sales and inventory

## API Reference

The application uses multiple API endpoints for different functionalities:

- Authentication APIs
- Product management APIs
- Category management APIs
- Invoice management APIs
- Reporting APIs

All API calls are made through Axios.

## Contact

- Developer: Banter Gipson
- Email: bantargipson@gmail.com
- Username: GipsZ1

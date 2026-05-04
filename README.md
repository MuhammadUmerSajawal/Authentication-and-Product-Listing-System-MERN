# Authentication and Product Listing System MERN

A full-stack MERN application with user authentication and a product listing dashboard. Users can sign up, log in, add products, view all products, and delete only the products they created.

## Features

- User signup and login
- Password hashing with bcrypt
- JWT-based authentication
- Protected dashboard route on the frontend
- Product creation and listing
- Product deletion restricted to the product creator
- Server-side validation with Joi
- Toast notifications for user feedback
- Responsive React UI with Bootstrap

## Tech Stack

**Frontend**

- React
- React Router
- React Bootstrap
- Bootstrap
- React Toastify
- React Icons

**Backend**

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Joi

## Project Structure

```text
mern-auth-app/
├── backend/
│   ├── Controllers/
│   ├── Middlewares/
│   ├── Models/
│   ├── Routes/
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── Pages/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── package.json
└── README.md
```

## Prerequisites

- Node.js
- npm
- MongoDB database connection string

## Environment Variables

Create a `.env` file inside the `backend` folder:

```env
PORT=8080
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## Installation

Clone the repository:

```bash
git clone https://github.com/MuhammadUmerSajawal/Authentication-and-Product-Listing-System-MERN.git
cd Authentication-and-Product-Listing-System-MERN
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

## Run the Application

Start the backend server:

```bash
cd backend
npm start
```

The backend runs on:

```text
http://localhost:8080
```

Start the frontend app in a second terminal:

```bash
cd frontend
npm start
```

The frontend runs on:

```text
http://localhost:3000
```

## API Endpoints

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/signup` | Register a new user |
| POST | `/auth/login` | Log in an existing user |

### Products

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/products` | Get all products |
| POST | `/products` | Create a new product |
| DELETE | `/products/:id?requester=userName` | Delete a product created by the requester |

## Usage

1. Sign up with your name, email, and password.
2. Log in with your registered email and password.
3. Add products from the dashboard.
4. View the product list.
5. Delete products that were created by your logged-in user.

## Notes

- The backend `.env` file is intentionally ignored by Git.
- `node_modules` folders are not committed. Run `npm install` after cloning.
- The frontend currently calls the backend at `http://localhost:8080`.

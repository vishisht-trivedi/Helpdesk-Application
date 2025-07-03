# Acompworld Helpdesk System

Empowering Businesses with Cutting-Edge Application Development, Data Analytics, AI, and Automation Solutions.

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [User Roles & Permissions](#user-roles--permissions)
- [Setup Instructions](#setup-instructions)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [API Endpoints](#api-endpoints)
- [Seeding & Environment Variables](#seeding--environment-variables)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Overview
Acompworld Helpdesk is a full-stack ticketing and support system designed for organizations to manage customer queries, technical issues, and internal support requests. It features role-based access for Admins, Agents, and Users, and provides a modern, responsive UI for efficient ticket management.

## Features
- User registration and authentication (JWT-based)
- Role-based dashboards (Admin, Agent, User)
- Ticket creation, assignment, status tracking, and commenting
- Category management (Admin only)
- Agent management (Admin only)
- File upload for ticket attachments
- Email notifications (via nodemailer)
- Data analytics and charts (ticket stats)
- Responsive, modern frontend (React + MUI + Bootstrap)

## Tech Stack
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Multer, Nodemailer  
**Frontend:** React, React Router, MUI, Bootstrap, Chart.js, Axios

## Project Structure
```
Cursor_helpdesk/
  backend/         # Node.js/Express API
    config/        # DB config
    controllers/   # Route controllers
    middleware/    # Auth, role checks
    models/        # Mongoose schemas
    routes/        # API endpoints
    uploads/       # Ticket attachments
    utils/         # Helpers
    seed.js        # DB seeder
    server.js      # Entry point
  frontend/        # React app
    public/        # Static assets
    src/           # Source code
      components/  # Reusable UI
      contexts/    # React context
      pages/       # App pages
      utils/       # API helpers
      global.css   # Styles
```

## User Roles & Permissions
- **Admin:** Full access. Manage users, agents, categories, all tickets.
- **Agent:** View and manage tickets assigned to them.
- **User:** Submit and track their own tickets.

## Setup Instructions
### Backend
1. `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file with:
   ```
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   (Optional: ADMIN_PASSWORD, AGENT1_PASSWORD, etc. for seeding)
   ```
4. Seed the database (optional): `node seed.js`
5. Start server: `npm run dev` (nodemon) or `npm start`

### Frontend
1. `cd frontend`
2. Install dependencies: `npm install`
3. Start app: `npm start`
4. The app runs on [http://localhost:3000](http://localhost:3000) and proxies API to backend.

## API Endpoints
### Auth
- `POST /api/auth/login` — User login
- `POST /api/auth/register` — Register user (Admin only)

### Users
- `GET /api/users/` — List users (Admin only)
- `DELETE /api/users/:id` — Delete user (Admin only)
- `GET /api/users/me` — Get current user profile
- `POST /api/users/register` — Public registration
- `PUT /api/users/me` — Update profile
- `PUT /api/users/me/password` — Change password

### Tickets
- `POST /api/tickets/create` — Create ticket (with attachment)
- `GET /api/tickets/list` — List tickets (role-based)
- `PUT /api/tickets/update/:id` — Update ticket
- `GET /api/tickets/stats` — Ticket statistics
- `GET /api/tickets/:id` — Get ticket details

### Categories
- `GET /api/categories/` — List categories
- `POST /api/categories/` — Add category (Admin only)
- `DELETE /api/categories/:id` — Delete category (Admin only)

## Seeding & Environment Variables
- Use `node seed.js` in backend to populate demo users, agents, categories, and tickets.
- Set passwords and Mongo URI in `.env`.

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)

## Contact
- [Acompworld](https://www.acompworld.com)
- Project maintained by the Acompworld team.

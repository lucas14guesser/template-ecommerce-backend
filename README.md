🛒 E-commerce Backend API
This repository contains the backend for an e-commerce project built with Node.js and Express, designed to be scalable, organized, and easy to integrate with any frontend.

It provides RESTful API endpoints to manage products, users, and orders, as well as shipping cost calculations using Melhor Envio and payments via Mercado Pago.

✨ Key Features
Modular architecture (services, controllers, routes)

Integration with Melhor Envio API for shipping calculations

Integration with Mercado Pago API for payments

PostgreSQL database support

Easy integration with any frontend (e.g., React)

Clear and maintainable code structure

🚀 Technologies Used
Node.js

Express.js

PostgreSQL

pg

Dotenv

Axios

Melhor Envio API

Mercado Pago SDK

📁 Project Structure
ecommerce-backend/
├── db/                 # Database connection and configuration
├── controllers/        # Request handling logic
├── routes/             # API route definitions
├── services/           # Business logic and external integrations
├── utils/              # Helper functions (e.g., formatting, validation)
├── index.js            # Main entry point of the application
├── .env                # Environment variables
├── package.json
└── README.md

🔐 Environment Variables
PORT=3000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=ecommerce_db
DB_PORT=5432

MP_ACCESS_TOKEN=your_mercado_pago_token
MELHOR_ENVIO_TOKEN=your_melhor_envio_token

▶️ Getting Started

1. Clone the repository:
git clone https://github.com/lucasguesser/ecommerce-backend.git

2. Install dependencies:
npm install
# or
yarn

3. Set up your .env file with the correct values.

4. Run the development server:
npm start
# or
yarn start

🧩 Integrations
📦 Melhor Envio
Used for real-time shipping cost calculations based on cart content and shipping address.

💳 Mercado Pago
Used for generating payment preferences, handling secure checkout, and processing transaction statuses.

🎯 Purpose
This backend is built to provide full support for a professional e-commerce system, focusing on maintainability, scalability, and clean integration with modern frontends like React.

👨‍💻 Author
Developed by Lucas Guesser 💻
# Nightlife Coordination App

A full-stack JavaScript web application built as a project for [Free Code Camp (fCC)](https://www.freecodecamp.org/) as part of their Backend Development and APIs curriculum. The application allows users to search for bars in a specific location using the Yelp API and indicate which bars they plan to visit tonight. Authenticated users can manage their "going" status and have their last search location remembered upon logging in.

## 🌟 Features

This app implements the following user stories as required by the fCC challenge:

* **Unauthenticated User:** You can view all bars in your area by searching a location.
* **Authenticated User:** You can add yourself to a bar to indicate you are going there tonight.
* **Authenticated User:** You can remove yourself from a bar if you no longer want to go there.
* **Authenticated User:** When you login, you should not have to search again; the app remembers your last searched location and displays results for it.

## 🚀 Demo

[Live Demo (Coming Soon) - Link will be added here once deployed to Netlify and Render]

## 💻 Technologies Used

* **Frontend:**
    * React (with Vite)
    * Axios (for API calls)
    * [Any other significant frontend libraries you add later, e.g., React Router, state management like Context API, Redux, Zustand, etc.]
* **Backend:**
    * Node.js
    * Express.js (Web Framework)
    * Mongoose (MongoDB Object Data Modeling)
    * Passport.js (Authentication Middleware - using `passport-local` strategy)
    * bcrypt (for password hashing)
    * dotenv (for environment variables)
    * cors (for enabling Cross-Origin Resource Sharing)
    * [Any other significant backend libraries]
* **Database:**
    * MongoDB
* **External API:**
    * [Yelp Fusion API](https://docs.developer.yelp.com/docs/fusion-api) (for searching bars)
* **Deployment (Planned):**
    * Frontend: Netlify
    * Backend: Render or Heroku

## 🛠️ Setup and Installation

Follow these steps to get the project running locally on your machine.

### Prerequisites

* Node.js installed ([https://nodejs.org/](https://nodejs.org/))
* npm or yarn package manager
* A MongoDB database (either local or a cloud service like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
* A Yelp Fusion API Key ([https://docs.developer.yelp.com/docs/fusion-api](https://docs.developer.yelp.com/docs/fusion-api) - requires creating an app)

### Steps

1.  **Clone the repository:**
    ```bash
    git clone <your_repo_url>
    cd nightlife-app
    ```

2.  **Backend Setup:**
    * Navigate into the server directory:
        ```bash
        cd server
        ```
    * Install backend dependencies:
        ```bash
        npm install
        # or
        # yarn install
        ```
    * Create a `.env` file in the `server` directory and add the following environment variables. Replace the placeholder values with your actual credentials and keys.
        ```dotenv
        PORT=5000
        MONGO_URI=<Your MongoDB Connection String> # e.g., from MongoDB Atlas
        YELP_API_KEY=<Your Yelp Fusion API Key>
        SESSION_SECRET=<A long, random string for session security> # Generate a strong, unique string
        ```
        * ***Note:*** Do not commit your `.env` file to Git. Ensure `.env` is included in your `.gitignore` file within the `server` directory.

3.  **Frontend Setup:**
    * Navigate into the client directory:
        ```bash
        cd ../client
        ```
    * Install frontend dependencies:
        ```bash
        npm install
        # or
        # yarn install
        ```
    * Create a `.env` file in the `client` directory and add the following environment variable, pointing to your backend's local address:
        ```dotenv
        VITE_API_BASE_URL=http://localhost:5000
        ```
        * ***Note:*** Do not commit your `client/.env` file to Git. Ensure `.env` is included in your `.gitignore` file within the `client` directory. (Vite expects client-side variables to be prefixed with `VITE_`).

4.  **Database Setup:**
    * Ensure your MongoDB database is running or accessible (if using Atlas).
    * Make sure the `MONGO_URI` in your `server/.env` file is correct and includes the necessary authentication details.

## ▶️ Running the Application

You need to run the backend and frontend servers concurrently.

1.  **Start the Backend Server:**
    * Open a terminal, navigate to the `server` directory.
    * Run:
        ```bash
        npm start
        # or
        # yarn start
        ```
    * The server should start on the port specified in your `server/.env` file (defaulting to 5000) and connect to your MongoDB database.

2.  **Start the Frontend Development Server:**
    * Open *another* terminal, navigate to the `client` directory.
    * Run:
        ```bash
        npm run dev
        # or
        # yarn dev
        ```
    * The React development server will start, usually on `http://localhost:5173`.

3.  Open your web browser and visit the address where the frontend is running (e.g., `http://localhost:5173`).

## 🤝 API Attribution

This product uses the Yelp Fusion API.

## ☁️ Deployment

The application is planned to be deployed with:

* Frontend (React) hosted on Netlify.
* Backend (Node.js/Express) hosted on Render or Heroku, connected to a MongoDB Atlas database.

Instructions for deployment will be added later.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

**Note:** As you build features, remember to update the `README.md` to reflect the current state of the application, add instructions for any new setup steps, or update the technologies list. Good luck with your project!
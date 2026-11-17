# Website Monitoring System

## 1. Project Overview

The Website Monitoring System is a web-based application designed to monitor website availability and performance automatically.

The system allows users to register, log in, add websites for monitoring, and configure how frequently each website should be checked. It automatically checks registered websites, records their HTTP status codes and response times, and displays monitoring results through a dashboard.

The application also generates alerts when a website becomes unavailable, recovers, or responds slowly, helping users identify potential website performance and availability issues.

## 2. Key Features

- **User Authentication:** Secure user registration and login using password hashing and JWT authentication.
- **Website Management:** Add, view, edit, delete, and deactivate monitored websites.
- **Automated Monitoring:** Periodically checks website availability using a background scheduler.
- **Performance Tracking:** Records HTTP status codes, response times, availability, and error messages.
- **Dashboard:** Displays website monitoring information and summary statistics.
- **Alert Management:** Automatically generates alerts when:
  - A website goes down.
  - A website recovers.
  - A website responds slowly.
- **Notification Preferences:** Allows users to configure their notification preferences.
- **Monitoring Logs:** Stores historical monitoring results for each website.

## 3. Technologies Used

### Backend
- Python
- Flask
- Flask-JWT-Extended
- SQLAlchemy
- Flask-Migrate
- APScheduler
- Requests

### Frontend
- Next.js
- React
- JavaScript
- Tailwind CSS

### Database
- PostgreSQL

### Development Tools
- Visual Studio 2022
- Git and GitHub
- pgAdmin 4
- PowerShell

## 4. System Architecture

The application consists of four main components:

1. **Frontend:** Next.js provides the user interface and communicates with the backend through REST API requests.
2. **Backend:** Flask handles authentication, website management, monitoring data, alerts, and API operations.
3. **Database:** PostgreSQL stores user accounts, websites, monitoring logs, alerts, and notification settings.
4. **Scheduler:** APScheduler runs independently in the background and triggers automatic website checks according to configured monitoring intervals.

## 5. Installation and Setup

### Prerequisites

Make sure the following are installed:

- Python
- Node.js and npm
- PostgreSQL
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/ruthzhou/website-monitoring-system.git

cd website-monitoring-system
```

### Step 2: Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate it on Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install the required Python packages:

```bash
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables

Create a `.env` file in the backend directory.

Configure your database connection and application secrets.

Example:

```env
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=website_monitoring

SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret_key
```

Do not upload your actual `.env` file or credentials to GitHub.

### Step 4: Database Setup

Create a PostgreSQL database named:

```text
website_monitoring
```

Run database migrations:

```bash
flask --app run db upgrade
```

### Step 5: Start the Backend

From the backend directory:

```bash
flask --app run run --debug
```

Backend URL:

`http://127.0.0.1:5000`

### Step 6: Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the Next.js development server:

```bash
npm run dev
```

Frontend URL:

`http://localhost:3000`

### Step 7: Start the Monitoring Scheduler

Open another terminal and navigate to the backend directory:

```bash
cd backend
```

Activate the virtual environment:

```powershell
.\venv\Scripts\Activate.ps1
```

Start the scheduler:

```bash
python scheduler.py
```

The scheduler runs independently and automatically checks websites according to their configured monitoring intervals.

**Note:** Keep the backend, frontend and scheduler running in separate terminals while using the application.

## 6. How to Use the Application

1. Open the application at `http://localhost:3000`.
2. Register a new account.
3. Log in using your account details.
4. Navigate to the dashboard.
5. Add a website by providing its name, URL, and monitoring interval.
6. View its availability, HTTP status code, and response time.
7. Manage websites by editing, deleting, or deactivating monitoring.
8. Open the Alerts and Notifications section to view generated alerts and manage notification preferences.

## 7. Monitoring and Alert Logic

The monitoring service checks whether a website is accessible and records its response information.

The system generates alerts for the following events:

| Event | Description |
|---|---|
| Website Down | Generated when a previously available website becomes unavailable. |
| Website Recovered | Generated when a previously unavailable website becomes available again. |
| Slow Response | Generated when the response time exceeds the configured threshold. |

The current slow-response threshold is 2000 milliseconds.

## 8. Future Improvements

Potential future improvements include:

- Email notification delivery.
- Monitoring performance graphs and historical trends.
- Exporting monitoring reports.
- Improved dashboard visualisations.
- Additional monitoring metrics.
- More advanced alert configuration.

## 9. Author

Developed as an academic and software development project.

**GitHub:** [ruthzhou](https://github.com/ruthzhou)

---

## License

This project is intended for educational and demonstration purposes.
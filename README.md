
# CodeSquad - SOEN 341 Project

## Team Members (Lab Section: FL, TA: Krupali Dobariya)

| Name | Student ID|
|----------|----------|
| Reema	Aboudraz (reemaaboudraz) |  40253549  |
| Griffin	Bonomo-Clough (GriffinBonomo) |  40316007  | 
| Patricia	Dsouza (something67) |  40284086  |
| Rim	Echahbi (Rimec100) |  40227779  | 
| Chandler	Higgins (GoingBarDown) |  40156534  | 
| Noorjahan	Kazi (noorkaazi3) |  40311131  |
| Sunidhi	Sharma (sunidhi-16) |  40190615  |

## Description
We are designing a space for students to find campus events that match their interests while providing organizers with the tools to reach their audience. Students will be able to easily claim tickets and receive a scannable QR code granting them access to the event.
## Core Features
### Student Experience
- Students using our website will be able to search for events and narrow their search using date, category and organization.
- Users can save events to a personal calendar and claim tickets online.
- Tickets will be managed via QR codes that can be scanned online.
- Users can access their event feed and ticket by logging in / signing up to our website.
- Students may select their seats for special events.

### Organizer Event Management
- Event organizers can customize their event posting with a description, date/time, location, ticket capacity, ticket type (paid or otherwise).
- Detailed event analytics including a dashboard displaying # of tickets issued, attendance rates and remaining capacity.
- Event organizers can export their attendee list as a CSV.
- Integrated QR code scanning for easy ticket validation.
- Organizers may view the remaining seats of an event if seats can be reserved.
- Organizers must complete a form before scheduling an event, notifying campus security of the event details.
### Administrator Dashboard & Moderation
- Administrators can approve and add organizations / organizer accounts.
- Edit / remove event listings that do not comply with policy.
- Global dashboard for viewing total ticket sales, event participation and the number of active events.
### Miscellaneous
- All users can log in / sign up to the website. Page layout and available features will adjust dynamically to their current permission level.
## Programming Languages and Frameworks
### Frontend
- HTML
- CSS
- JavaScript
### Backend
- Python 
- Flask
- SQLAlchemy

## Extra Feature
- Students who have claimed a ticket may see a countdown to the event start on the ticket info page.

# Instructions for Running Flask Backend
## Setup and Initialization
This backend uses Flask and SQLite to handle routing and data persistence. You'll need Python as well as some form of environment manager for the best experience. It is **highly** recommended to use Miniconda for managing dependencies. 

A guide will be provided for a basic Conda environment setup however, users are presumed to have some rudimentary knowledge of setting up Python environments and managing package downloads.
### Environment
It is helpful to contain the dependencies we use for the project in a separate environment.
>We use Miniconda for managing environments, it's very easy to use and lightweight. ([Download](https://www.anaconda.com/docs/getting-started/miniconda/main))
>You can also use the basic Python venv tools.

> Note: Windows users need to run this and all future conda related commands from the Anaconda prompt (a newly installed custom terminal). It may be named some variation like "Miniconda prompt" or something.
> 
Using the terminal, initialize your environment with:

    conda create -n SOEN341 python=3.12

Next to activate the environment, run:

    conda activate SOEN341

From now on, you should **always** be activating your environment before running or installing **anything**.
### Dependencies
To install the dependencies, move to the "src/backend/" directory in the repo, **make sure your environment is activated** and run the command:

    pip install -r requirements.txt

Alternatively, you can run the app and it will tell you what packages you are missing, sometimes the command above has errors.
>When installing missing packages (if any) using the Conda environment manager, ALWAYS search for the exact package using the Anaconda.org website; these packages are vetted and safe.
### Creating the Database
The project does not include an initialized .db file, by default one will be generated on startup. From an **active** environment **and** inside the same directory as the requirements.txt file, run the setup_db.py file with:
>This creates an **initialized** database with existing Concordia organizations. If you prefer a database **without** any organizations, skip this step and just run the app normally.

    python setup_db.py

>Note that this command ^ also **resets** the database, use it with caution.

## Running the App
You can start the backend by running:

    python app.py

You'll get something like:

    * Serving Flask app 'app'
    * Debug mode: on
    WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
    * Running on http://127.0.0.1:5000
    Press CTRL+C to quit
    * Restarting with stat
    * Debugger is active!
    
The app is now running at the http address listed in the message.

# Instructions for Running Frontend
## Prerequisites
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- The Flask backend must be running on http://127.0.0.1:5000

## Setup
The frontend is built using vanilla HTML, CSS, and JavaScript. There is no build process or dependencies to install.

To navigate to the frontend directory:
   ```
   cd src/frontend
   ```
The frontend is organized into three separate user roles:
   - **student-frontend/** - Student-facing pages and features
   - **organizer-frontend/** - Organizer event management pages
   - **admin-frontend/** - Administrator dashboard and controls

## User Roles and Features

### Student Features
- Browse published events by category, date, and organization
- Create an account and login
- Claim tickets for events with automatic QR code generation
- View personal calendar with claimed events
- Download event details as .ics files for calendar integration
- View ticket countdown timers
- Access personal ticket collection

### Organizer Features
- Create and manage events
- Set ticket prices and capacities
- View event analytics and attendance rates
- Scan QR codes to verify ticket holders
- Export attendee lists
- Manage organization profile

### Administrator Features
- Approve/deny organizer account requests
- Manage organizations and their members
- Assign roles to users
- Monitor global platform analytics
- Remove events that violate policies

## Important Notes
- The backend API is expected to run on `http://127.0.0.1:5000`
- All API endpoints use CORS-enabled requests
- User authentication is managed via localStorage and cookies
- The application is designed as a single-page application with client-side routing

## Running the Frontend
You can serve the frontend files using a simple HTTP server. If using VS Code, install the "Live Server" extension and right-click on `index.html` to open it.

## Accessing the Application

### Student
1. Open your browser and navigate to `src/frontend/student-frontend/login.html`
2. **New User**: Click "Sign Up" to create a new account
   - Enter your name, email, student ID (format: letter + digits, e.g., S123456)
   - Create a password
   - Click "Sign Up" to create your account
   - You'll be redirected to login page
3. **Existing User**: Enter your email and password, then click "Login"
4. After login, you'll access the student dashboard where you can:
   - Browse events by category and date
   - Claim tickets for events
   - View your personal calendar
   - Manage your ticket collection

### Organizer
1. Open your browser and navigate to `src/frontend/organizer-frontend/organizer-login.html`
2. **New User**: Click "Sign Up" to create a new organizer account
   - Enter your name, email, and password
   - Choose to either join an existing organization or create a new one
   - If creating a new organization: enter the organization name and select a category
   - Click "Sign Up" to complete registration
   - You'll be redirected to login page
3. **Existing User**: Enter your email and password, then click "Login"
4. After login, you'll access the organizer dashboard where you can:
   - Create and manage events
   - Set ticket prices and capacities
   - View event analytics
   - Scan QR codes for ticket verification

### Administrator
1. **Account Creation**: Admin accounts cannot be created through the UI. Instead, use Postman to create an admin user via the backend API:
   - Start the Flask backend (it should be running on http://127.0.0.1:5000)
   - In Postman, create a POST request to `http://127.0.0.1:5000/users`
   - Set the Body to raw JSON:
     ```json
     {
       "username": "admin",
       "email": "admin@admin.com",
       "password": "yourpassword",
       "role": "admin"
     }
     ```
   - Click "Send" to create the admin account
2. **Login**: Navigate to `src/frontend/admin-frontend/admin-login.html` in your browser
   - Enter your admin email and password, then click "Login"
3. After login, you'll access the admin dashboard where you can:
   - Approve/deny organizer account requests
   - Manage organizations and members
   - View and remove events that violate policies
   - Monitor global platform analytics

## Testing with Sample Data
If you ran `setup_db.py`, the database includes sample Concordia organizations. You can:
- Create test student accounts with any student ID format (e.g., A123456, S7891011)
- Create organizer accounts and choose existing organizations for testing
- Use the admin account to manage organizations and review organizer requests
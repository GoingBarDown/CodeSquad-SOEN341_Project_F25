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
- SQLite database for user logging, authentication and event tracking. 
- Python 

# Instructions for Running Flask Backend
## Setup and Initialization
This backend uses Flask and SQLite to handle routing and data persistence. You'll need Python as well as a libraries to initialize the project and run the app. 
### Environment
It is helpful to contain the dependencies we use for the project in a separate environment.
>I use Miniconda for managing environments, it's very easy to use and lightweight. ([Download](https://www.anaconda.com/docs/getting-started/miniconda/main))
>You can also use the basic Python venv tools. You just need to have Python on your computer.

> Note: Windows users need to run this and all future conda related commands from the Anaconda prompt (custom terminal). It may be named some variation like Miniconda prompt or something.
Using the terminal, initialize your environment with:

    conda create -n SOEN341
Or if you're not using conda

    python -m venv SOEN341
    # note that this creates the environment in the current directory
Next to activate the environment, run:

    conda activate SOEN341

Or with basic Python:
>Note: On Windows, you have to navigate to the environment directory, this wont run if you just run it from wherever.

    SOEN341\Scripts\activate 
> Note: Same rules as above for mac.

    source SOEN341/bin/activate

From now on, you should **always** be activating your environment before running or installing **anything**.
### Dependencies
To install the dependencies, copy over the **requirements.txt** file in the repo and **make sure your environment is activated!**

Conda and Python:

    pip install -r requirements.txt

Alternatively, you can run the app and it will tell you what packages you are missing, sometimes the command above has errors.
### Creating the Database
The project does not include an initialized .db file as it can cause merge conflicts and corruption. For now each person will have to initialize their own.
From an **active** environment **and** inside the repo, run the setup_db.py file.
This creates a .db file that you can use for storing all the data for testing purposes. It is purposefully excluded from any commits.
## Running the App
You can start the backend by running:

    python app.py

> Note: On mac, you may need to use "python3" to run the app. You can figure this out, I don't know why I'm writing this.

You'll get something like:

    * Serving Flask app 'app'
    * Debug mode: on
    WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
    * Running on http://127.0.0.1:5000
    Press CTRL+C to quit
    * Restarting with stat
    * Debugger is active!
The app is now running at the http address listed in the message.
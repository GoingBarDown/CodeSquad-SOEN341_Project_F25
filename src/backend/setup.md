# Deprecated, instructions are now listed in the README

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
    & .\SOEN341\Scripts\Activate.ps1
From now on, you should **always** be activating your environment before running or installing **anything**.
### Dependencies
To install the dependencies, copy over the **requirements.txt** file in the repo and **make sure your environment is activated!**

Conda and Python:

    pip install -r requirements.txt
Whenever you install a new library for the backend, write:

    pip freeze > requirements.txt
and replace the current requirements file in the repo.
### Creating the Database
The project does not include an initialized .db file as it can cause merge conflicts and corruption. For now each person will have to initialize their own.
From an **active** environment **and** inside the repo, write:

    sqlite3 app.db < schema.sql
>Note: You can re-run this to reset the database.

This creates a .db file that you can use for storing all the data for testing purposes. It is purposefully excluded from any commits.
## Running the App
You can start the app backend by running:

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
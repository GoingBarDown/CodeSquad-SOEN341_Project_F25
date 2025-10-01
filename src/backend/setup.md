# Instructions for Running Flask Backend
## Setup and Initialization
This backend uses Flask and SQLite to handle routing and data persistence. 
You'll need Python as well as a few addons to initialize the project and run the app. 
### Environment
It is helpful to contain the dependencies we use for the project in a separate environment. 
>I use Miniconda for managing environments, it's very easy to use and lightweight. ([Download](https://www.anaconda.com/docs/getting-started/miniconda/main))
>You can also use the basic Python venv tools. You just need to have Python on your computer.

Using the terminal, initialize your environment with:

    conda create -n SOEN341
Or if you're not using conda

    python -m venv SOEN341
    # note that this creates the environment in the current directory
Next to activate the environment,

    conda activate SOEN341
Or with Python

    # On Windows
    # you have to navigate to the environment directory
    # this wont run if you just run it from wherever
    SOEN341\Scripts\activate 
    # On Mac
    # same rules as above
    source SOEN341/bin/activate
### Dependencies
To install the dependencies, copy over the **requirements.txt** file in the repo and **make sure your environment is activated!**

Conda and Python:

    pip install -r requirements.txt
Whenever you install a new library for the backend, write:

    pip freeze > requirements.txt
and replace the current requirements file in the repo.
### Creating the Database
The project does not include an initialized .db file as it can cause merge conflicts and corruption. For now each person will likely have to initialize their own.
From within your environment and inside the repo, write:

    sqlite3 app.db < schema.sql
>Note: You can re-run this to reset the database.

This creates a .db file that you can use for storing all the data for testing purposes.
## Running the App
You can start the app backend by running:

    python app.py
You'll get something like:

    * Serving Flask app 'app'
    * Debug mode: on
    WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
    * Running on http://127.0.0.1:5000
    Press CTRL+C to quit
    * Restarting with stat
    * Debugger is active!
You can now visit or send requests to the http address.
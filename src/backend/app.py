from flask import Flask, flash, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return jsonify({"message": "Hello world from flask."})

if __name__ == '__main__':
    app.run(debug=True)
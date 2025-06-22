from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import hashlib
import jwt
import datetime

app = Flask(__name__)
CORS(app)
app.config["SECRET_KEY"] = "mySuperSecretKey123!"

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["orderDB"]
users_collection = db["users"]
feedback_collection = db["feedbacks"]

# Function to hash passwords
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Function to generate JWT token
def generate_token(email):
    payload = {
        "email": email,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }
    return jwt.encode(payload, app.config["SECRET_KEY"], algorithm="HS256")

# Middleware to verify JWT token
def verify_token(token):
    try:
        decoded_token = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        return decoded_token["email"]
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

@app.route('/auth/register', methods=['POST'])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if users_collection.find_one({"email": email}):
        return jsonify({"msg": "User already exists"}), 400

    hashed_password = hash_password(password)
    users_collection.insert_one({"email": email, "password": hashed_password})

    return jsonify({"msg": "User registered successfully"}), 201

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get("email")
    password = hash_password(data.get("password"))

    user = users_collection.find_one({"email": email, "password": password})

    if user:
        token = generate_token(email)
        return jsonify({"token": token}), 200
    else:
        return jsonify({"msg": "Invalid credentials"}), 401

@app.route('/auth/logout', methods=['POST'])
def logout():
    return jsonify({"msg": "Logged out successfully"}), 200  # JWT logout is handled on frontend


if __name__ == '__main__':
    app.run(debug=True)

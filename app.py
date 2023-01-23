from flask import Flask, session, abort, redirect, request, render_template, jsonify
from flask_pymongo import MongoClient
import requests
from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow
from pip._vendor import cachecontrol
import google.auth.transport.requests
import os
import pathlib
from mongoengine import connect
from mongoengine import StringField, DictField, ListField, BooleanField, IntField
from tkinter import messagebox
import json

from functions import *
from cloud import *

app = Flask(__name__,template_folder="templates")
app.secret_key = "your-secret-key"


#########################
# MongoDB
#########################

# Connects to MongoDB database using the MongoClient class (database is named Geocaching)
client = MongoClient("mongodb+srv://Grupo03:Grupo@geocachingapp.0sxhylv.mongodb.net/test")["Geocaching"]

users = client.db.users
users_schema = {
    'name': StringField,
    'google_id': StringField, 
}

games = client.db.games
games_schema = {
    'name': StringField, # Overview
    'owner': StringField, # Creation
    'state': StringField, # Overview, Supervition
    'winner': StringField, # Overview
    'finalists': ListField, # Overview
    'view': DictField, # Creation
    'caches': ListField, # Creation, Supervition
}

caches = client.db.caches
caches_schema = {
    'name': StringField,
    'location': DictField,
    'hint': DictField,
    'state': StringField,
    'finder': StringField,
    'game_id': StringField,
}

# Create collection "users" in the Geocaching database
# users = client.db.users
# users_schema = {
#     'name': StringField,
#     'google_id': StringField, 
# }

# Create collection "games" in the Geocaching database
# games = client.db.games
# games_schema = {
#     'name': StringField,
#     'locatiton': DictField,
#     'caches': DictField,
#     'zoom': IntField,
#     'owner': StringField,
#     'state': BooleanField,
#     'winner': StringField,
# }

# Create collection "user_games" in the Geocaching database
# user_games = client.db.caches
# user_games_schema = {
#     'user': StringField,
#     'name': StringField,
#     'game_id': StringField,
#     'caches': DictField,
# }


#########################
# Google OAuth 
#########################

# Setting enviroment variable
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1" 
GOOGLE_CLIENT_ID = "585245209475-ga6dg0vr7i5qjk1mopn8tgeb6ag5mv7j.apps.googleusercontent.com"
client_secrets_file = os.path.join(pathlib.Path(__file__).parent, "client_secrets.json")

flow = Flow.from_client_secrets_file(
    client_secrets_file=client_secrets_file,
    scopes=["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email", "openid"],
    redirect_uri="http://127.0.0.1:5000/callback"
)

# Check authentificated user
def user_authentificated():
    if session["google_id"]:
        return True
    else: 
        return login()

# Protect app from unauthorized users
def login_is_required(function):
    def wrapper(*args, **kwargs): 
        if "google_id" not in session:
            return abort(401)  
        else:
            return function()
    return wrapper

# Redirect user to the Google authentificator
@app.route("/login", methods=['POST'])
def login():
    authorization_url, state = flow.authorization_url() # Security feature
    session["state"] = state # Ensures no third party has hooked on the request by savin state and session
    return redirect(authorization_url)

# Clear user session
@app.route("/logout",methods=['GET'])
def logout():
    session.clear()
    return redirect("/")

# Recieve data from the Google endpoint
@app.route("/callback")
def callback():
    flow.fetch_token(authorization_response=request.url) # Trades the recieved info for an access token to the api
    #<if not session["state"] == request.args["state"]: # Cecks if recieved state is the same as the state of the session
    #    abort(500) 
    credentials = flow.credentials # Safes credentials if successfull
    request_session = requests.session()
    cached_session = cachecontrol.CacheControl(request_session)
    token_request = google.auth.transport.requests.Request(session=cached_session)
    id_info = id_token.verify_oauth2_token(
        id_token=credentials._id_token,
        request=token_request,
        audience=GOOGLE_CLIENT_ID
    )
    result = list(client["users"].find(
        filter= {"google_id": id_info.get("sub")}
    ))
    if len(result) == 0: 
        client["users"].insert_one({"google_id":id_info.get("sub"), "name":id_info.get("name")})
    session["google_id"] = id_info.get("sub")
    session["name"] = id_info.get("name")
    # Once logged in, the users can navigate in a protected area
    return redirect("/join_game")


#########################
# Interface & Functions 
#########################

# App homepage
@app.route("/")
def index():
    return render_template("index.html")


# Participate in a game
@app.route("/join_game", methods=["GET", "POST"])
def join_game():
    if request.method == "GET":
        # Get all games in the database
        return render_template("game_overview.html", gamesOn=user_games(True), gamesOff=user_games(False), logged = True)
    else:
        # Get id of the selected game
        game_id = request.form.get("game_id")
        # Verify authentication of the user
        if "google_id" not in session:
            return redirect("/login")
        # Add id of the current user to the list of players in the selected game     
        user=dict(client["users"].find_one(filter={"google_id":session["google_id"]}))
        client["user_games"].insert_one({"user": user["google_id"], "name": user["name"], "game": game_id, "caches": []})
        return redirect("/join_game")

# Participate in a game
@app.route("/play_game", methods=["POST"])
def play_game():             
    id = request.form.get("game_id")
    game = dict(client["games"].find_one(filter={"_id":ObjectId(id)}))
    localizacion = game["location"]
    cachesGame = game["caches"]
    cachesFound =  (client["user_games"].find_one(filter={"user":session["google_id"],"game":id}))["caches"]
    cacheNames = []
    cacheHints = []
    for cache in cachesFound:
        cacheNames.append(cache["name"])
    for cache in cachesGame:
        if cache["name"] not in cacheNames:
            cacheHints.append(cache["hint"])
    imagenes = obtiene_urls(session["google_id"],id)      
    return render_template("play_game.html", game = game, localizacion = localizacion, cachesGame = cachesGame, cachesFound = cachesFound, cacheHints = cacheHints, image_urls=imagenes,logged = True)

#Create in a game
@app.route("/create_game", methods=["GET"])
def create_game():     
    if request.method == "GET":   
        return render_template("create_game.html", logged = True)

# Save key-variables of the game
@app.route("/save_game", methods=["POST"])
def save_game():
    game = request.json
    client['games'].insert_one({
        'name': game.get("name"),   
        'location': game.get("location"),
        'caches':  game.get("caches"),
        'zoom': game.get("zoom"),
        'owner':session['google_id'],
        'state': True,
        'winner':""
    })
    return jsonify({"status": "success", "message": "Juego guardado"})

# Supervise a game
@app.route("/supervise_game", methods=["GET", "POST"])
def supervise_game():
    if request.method == "POST":
        # Get all selected game ids
        game_id = request.form.get("game_id")
        # Get all games of the data base
        game, users = game_to_supervise(game_id)
        return render_template("supervise_game.html", game = game, in_game = users , logged = True)

# Upload Image 
@app.route('/upload-image', methods=['POST'])
def upload_image():
    cache_name = request.form.get('cache-name')
    game_id = request.form.get('game_id')
    # Obtain the current user's game data
    google_id = session["google_id"]    
    game_data = client["games"].find_one(filter={"_id":ObjectId(game_id)})
    game_state = game_data["state"]
    game_data = game_data["caches"]
    user_name = (client["users"].find_one(filter={"google_id":google_id}))["name"]
    user_caches = client["user_games"].find_one(filter={"user": google_id, "game": game_id})
    caches_totales = len(client["games"].find_one(filter={ "_id": ObjectId(game_id)})["caches"])
    for cache in game_data:
        if(cache["name"] == cache_name and game_state and compare_caches(cache_name, user_caches["caches"])):
            # Upload image
            folder_name = put_image(game_id,user_name,cache["name"])
            # Create new cache
            new_cache = {
                "name": cache_name,
                "image_path": folder_name,
                "location":cache["location"]
            }
            # Add new cache to the list of game caches
            user_caches["caches"].append(new_cache)
            # Update game information in the database
            client["user_games"].update_one(
                filter={"user": google_id, "game": game_id},
                update={"$set": {"caches": user_caches["caches"]}}
            )  
            caches_user= len(client["user_games"].find_one(filter={ "game": game_id, "name":user_name})["caches"])
            if(caches_totales==caches_user):
                client["games"].update_one(
                filter={"_id": ObjectId(game_id)},
                update={"$set": {"state": False, "winner":user_name}}
            )  
    return play_game()

# Delete all logged data of founded caches 
@app.route("/reset_game", methods=["POST"])
def reset_game():
    if request.method == "POST":
        game_id = request.form.get("game_id")
        client["games"].update_many({"_id":ObjectId(game_id)},{"$set":{"winner":'', "state":True}})
        client["user_games"].update_many({"game":game_id},{"$set":{"caches":[]}})
         # Delete images
        folder_name = 'geocaching/game_'+game_id+'/'
        delete_folder(folder_name)
        game, users = game_to_supervise(game_id)   
        return render_template("supervise_game.html", game = game, in_game = users , logged = True)

# Overview of all caches in a game
@app.route('/view_caches', methods=["POST"])
def view_caches():
    game_id = request.form.get("game_id")
    google_id = request.form.get("user_id")
    imagenes = obtiene_urls(google_id,game_id)
    return render_template('view_caches.html', image_urls=imagenes)
# Get all corresponding urls
def obtiene_urls(google_id,game_id):
    user_caches = (client["user_games"].find_one(filter={"user": google_id, "game": game_id}))["caches"]
    image_urls = []
    for image in  user_caches:      
        path = image["image_path"]
        image_urls.append( read_image(path))   
    return image_urls


if __name__ == "__main__":
    app.run(debug=True)
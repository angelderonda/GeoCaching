from flask import Flask, session, abort, redirect, request, send_from_directory, render_template, url_for
from flask_pymongo import PyMongo, MongoClient
import requests
from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow
from pip._vendor import cachecontrol
import google.auth.transport.requests
import os
import pathlib
from mongoengine import connect
from mongoengine import StringField, DictField, ListField


from functions import *

app = Flask(__name__,template_folder="templates")
app.secret_key = "your-secret-key"


#########################
# MongoDB
#########################
client = MongoClient("mongodb+srv://Elena:Elena@geocachingapp.0sxhylv.mongodb.net/test")["Geocaching"]

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


#########################
# Google OAuth 
#########################

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1" # Setting enviroment variable
GOOGLE_CLIENT_ID = "585245209475-ga6dg0vr7i5qjk1mopn8tgeb6ag5mv7j.apps.googleusercontent.com"
client_secrets_file = os.path.join(pathlib.Path(__file__).parent, "client_secrets.json")

flow = Flow.from_client_secrets_file(
    client_secrets_file=client_secrets_file,
    scopes=["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email", "openid"],
    redirect_uri="http://127.0.0.1:5000/callback"
)

# ??
#@app.route('/<path:path>')
def send_report(path):
    return send_from_directory(str(path))

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







#########################
# Interface & Functions 
#########################

# App homepage
@app.route("/")
def index():
    return render_template("index.html")


# Redirect user to the Google authentificator
@app.route("/login", methods=['POST'])
def login():
    authorization_url, state = flow.authorization_url() # Security feature
    session["state"] = state # Esures no third party has hooked on the request by savin state and session
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
    if not session["state"] == request.args["state"]: # Cecks if recieved state is the same as the state of the session
        abort(500) 
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



@app.route("/join_game", methods=["GET", "POST"])
def join_game():
    if request.method == "GET":
        # Obtén todos los juegos de la base de datos
        return render_template("game_overview.html", gamesOn=user_games(True), gamesOff=user_games(False))
    else:
        # Obtiene el id del juego seleccionado
        game_id = request.form.get("game_id")
        # Verifica que el usuario esté autenticado
        if "google_id" not in session:
            return redirect("/login")
        # Agrega el id del usuario actual a la lista de jugadores del juego seleccionado        
        user=dict(client["users"].find_one(filter={"google_id":session["google_id"]}))
        client["user_games"].insert_one({"user":user["google_id"], "game":game_id})
        return redirect("/join_game")


@app.route("/play_game", methods=["GET", "POST"])
def play_game():
    if request.method == "GET":
         # Obtiene el id del juego seleccionado
        game_id = request.form.get("game_id")
        # Obtén todos los juegos de la base de datos
        return render_template("play_game.html", game = game_id)
    else:   
        name = request.form.get("game_name")
        print(name)
        return render_template("play_game.html", game = name)


@app.route("/create_game", methods=["GET", "POST"])
def create_game():     
    if request.method == "GET":   
        return render_template("create_game.html")
    else:   
        coordinates = request.form["coordinates-input"]
        # Procesar las coordenadas
        lonlat = coordinates.split(',')
        lon = float(lonlat[0])
        lat = float(lonlat[1])
        print(lat)
        print(lon)
        # Hacer algo con las coordenadas, como guardarlas en la base de datos
        # ...
        # Mostrar un mensaje de éxito
        mensaje = "Coordenadas guardadas exitosamente!"
        #return render_template("create_game.html", mensaje=mensaje)
        return render_template("play_game.html")




if __name__ == "__main__":
    app.run(debug=True)
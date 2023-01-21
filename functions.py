
from flask import session
from flask_pymongo import MongoClient
from bson.objectid import ObjectId




#########################
# MongoDB
#########################
client = MongoClient("mongodb+srv://Elena:Elena@geocachingapp.0sxhylv.mongodb.net/test")["Geocaching"]


# List of user games 
def user_games(active):
    games=list(client["games"].find(filter={"state":active}))
    for game in games:
        participating= list(client["user_games"].find(filter={"game":str(game["_id"]), "user":session["google_id"]}))
        if len(participating)>0:
            game["participate"] = 'yes'
        else:
            game["participate"] = 'no'
        if "winner" in game and game["state"]==False:
            user = dict(client["users"].find_one(filter={"_id":ObjectId(game["winner"])}))
            game["winner"] = user["name"]
        if game["owner"]==session["google_id"]:
            game["supervise"] = 'yes'
    return games




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

def game_to_supervise(game_id):
    players = []
    game = client["games"].find_one(filter={"_id":ObjectId(game_id)})
    users=list(client["user_games"].find(filter={"game":game_id}))

    #caches_count = games.find_one({'name': game_name}, {"$size": "$caches"})
    #caches_size = len(game["caches"])

    

    for user in users:
        name=client["users"].find_one(filter={"google_id":user["user"]})
        players.append(name)
    print(players)
    return game, players, users

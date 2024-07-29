import base64
import functions_framework
import os
from pymongo import MongoClient
from datetime import datetime
import json


# Triggered from a message on a Cloud Pub/Sub topic.
@functions_framework.cloud_event
def getData(cloud_event):

    # Print out the data from Pub/Sub, to prove that it worked

    ## Access URI in secrets
    MONGO_URI = os.environ.get('MONGO_URI', "MONGO_URI is not set.")
    MONGO_DATABASE = os.environ.get('MONGO_DATABASE', "MONGO_DATABASE is not set.")
    MONGO_COLLECTION = os.environ.get('MONGO_COLLECTION', "MONGO_COLLECTION is not set.")

    client = MongoClient(MONGO_URI)
    db = client[MONGO_DATABASE]
    collection = db[MONGO_COLLECTION]

    ##print(base64.b64decode(cloud_event.data["message"]["data"]))

    byte_message = base64.b64decode(cloud_event.data["message"]["data"])

    # Decode the byte string
    json_str = byte_message.decode('utf-8')

    # Parse the JSON string into a dictionary
    data_dict = json.loads(json_str)
    print(data_dict)

    # Work with the dictionary fields
    flight_id = data_dict.get("flight_id")
    timestamp = data_dict.get("ts") + "Z"
    location = data_dict.get("location")

    # Create the new dict thats going to be sent to mongo
    new_data = {"ts": datetime.fromisoformat(timestamp),
                 "flight_id" : flight_id, 
                 "location" : location,
                 "CF_insertion" : "Correct"}

    print("New processed message: ", new_data )

    try:
        result = collection.insert_one(new_data)
        print("Document inserted with _id:", result.inserted_id)
    except Exception as e:
        print("Error inserting document:", e)

    return

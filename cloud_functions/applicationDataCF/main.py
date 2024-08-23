# import base64
# import json
# from bson import ObjectId
# import os
# from pymongo import MongoClient
# import functions_framework

# # Triggered from a message on a Cloud Pub/Sub topic.
# @functions_framework.cloud_event
# def postPath(cloud_event):

#     # Access URI in secrets
#     MONGO_URI = os.environ.get('MONGO_URI', "MONGO_URI is not set.")
#     MONGO_DATABASE = os.environ.get('MONGO_DATABASE', "MONGO_DATABASE is not set.")
#     MONGO_COLLECTION = os.environ.get('MONGO_COLLECTION', "MONGO_COLLECTION is not set.")


#     if not all([MONGO_URI, MONGO_DATABASE, MONGO_COLLECTION]):
#         print("Error: One or more environment variables are not set.")
#         return

#     client = MongoClient(MONGO_URI)
#     db = client[MONGO_DATABASE]
#     collection = db[MONGO_COLLECTION]

#     try:
#         # Parse the data in the message
#         byte_message = base64.b64decode(cloud_event.data["message"]["data"])
#         json_str = byte_message.decode('utf-8')
#         data_dict = json.loads(json_str)
#         print(data_dict)

#         # Work with the dictionary fields
#         flight_id = data_dict.get("flight_id")
#         initial_path = data_dict.get("initial_path_airps")
#         new_path = data_dict.get("new_path_airps")
#         disrup_coordinates = data_dict.get("disruption_coords")

#         # Check if all required fields are present
#         if not flight_id:
#             print("Error: flight_id is missing.")
#             return
#         if initial_path is None or new_path is None:
#             print("Error: One or more path fields are missing.")
#             return

#         # Find the document in the MongoDB collection and update the path field
#         result = collection.update_one(
#             {"_id": ObjectId(flight_id)},
#             {"$set": {"initial_path": initial_path, "new_path": new_path,"disruption_coords": {"lat" : disrup_coordinates[0],
#                                                                                                "long": disrup_coordinates[1]}}}
#         )

#         if result.matched_count > 0:
#             print("Document successfully updated.")
#         else:
#             print("No document found with the specified flight_number.")

#     except Exception as e:
#         print(f"Error updating document: {e}")

#     finally:
#         client.close()

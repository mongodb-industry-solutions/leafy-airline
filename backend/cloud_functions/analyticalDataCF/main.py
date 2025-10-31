# import base64
# import json
# import os
# import logging
# import traceback
# from google.cloud import aiplatform
# from google.protobuf import json_format
# from google.protobuf.struct_pb2 import Value
# from pymongo import MongoClient
# from bson import ObjectId
# import certifi

# # Initialize logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# # Initialize Vertex AI client
# project_id = 'connected-aircraft-ist'
# location = 'europe-west1'
# endpoint_id = '4030743656729149440'
# api_endpoint = 'europe-west1-aiplatform.googleapis.com'

# aiplatform.init(project=project_id, location=location)

# # Initialize MongoDB client
# MONGO_URI = os.environ.get('MONGO_URI')
# MONGO_DATABASE = os.environ.get('MONGO_DATABASE')
# MONGO_COLLECTION = os.environ.get('MONGO_COLLECTION')

# mongo_client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
# db = mongo_client[MONGO_DATABASE]
# collection = db[MONGO_COLLECTION]

# def convert_message_to_df_row(message):
#     ts = message['ts']
#     distance_to_destination = message['distance_to_arrival']
#     estimated_time_left = distance_to_destination / message['velocity']['speed']
#     delay_time = message['extra_length'] / message['velocity']['speed']
#     delay_cost = delay_time * 100 * 60
#     extra_fuel_cost = delay_time * 1200
#     fuel_cost_per_hour = 1200 * estimated_time_left
#     total_cost_per_hour = fuel_cost_per_hour + delay_cost
#     lat = message['location']['lat']
#     long = message['location']['long']
#     speed = message['velocity']['speed'] * 3.6
#     extra_length = message['extra_length']
#     total_cost = fuel_cost_per_hour + delay_cost

#     row = {
#         'Timestamp': ts,
#         'Distance_to_Destination': distance_to_destination,
#         'Estimated_Time_Left': estimated_time_left,
#         'Delay_Time': delay_time,
#         'Delay_Cost': delay_cost,
#         'Fuel_Cost_per_Hour': fuel_cost_per_hour,
#         'Extra_Fuel_Cost' : extra_fuel_cost,
#         'Total_Cost_per_Hour': total_cost_per_hour,
#         'Latitude': lat,
#         'Longitude': long,
#         'Speed': speed,
#         'Extra_Length': extra_length,
#         'Total_Cost': total_cost,
#         '_id': ObjectId()
#     }

#     return row

# def predict_and_store(event, context):
#     try:
#         pubsub_message = event['data']
#         message_data = base64.b64decode(pubsub_message).decode('utf-8')

#         # Parse the input data
#         input_data = json.loads(message_data)
#         df_row = convert_message_to_df_row(input_data)

#          # Extract delay_cost and extra_fuel_cost before making predictions
#         delay_cost = df_row['Delay_Cost']
#         extra_fuel_cost = df_row['Extra_Fuel_Cost']

#         # Prepare the payload for Vertex AI - using only the relevant features
#         instance_dict = [
#             df_row["Speed"],
#             df_row["Distance_to_Destination"],
#             df_row["Extra_Length"]
#         ]

#         # Create the client and configure the API endpoint
#         client_options = {"api_endpoint": api_endpoint}
#         client = aiplatform.gapic.PredictionServiceClient(client_options=client_options)
        
#         # Convert the instance dictionary to protobuf Value
#         instance = json_format.ParseDict(instance_dict, Value())
#         instances = [instance]
#         parameters_dict = {}
#         parameters = json_format.ParseDict(parameters_dict, Value())
        
#         # Build the endpoint path
#         endpoint_path = client.endpoint_path(project=project_id, location=location, endpoint=endpoint_id)
        
#         # Make the prediction request
#         response = client.predict(
#             endpoint=endpoint_path,
#             instances=instances,
#             parameters=parameters
#         )


#         # Extract and format predictions
#         predictions = response.predictions
#         formatted_predictions = [
#             pred[0] + delay_cost + extra_fuel_cost for pred in predictions
#         ]
        
#         logger.info(f"Predictions received: {formatted_predictions}")

#         # Write to MongoDB
#         document = {
#             'input': df_row,
#             'predictions': formatted_predictions
#         }

#         collection.insert_one(document)
#         logger.info("Document inserted into MongoDB")
    
#     except Exception as e:
#         logger.error(f"Error during prediction or MongoDB insertion: {e}")
#         logger.error(traceback.format_exc())

import time
from concurrent.futures import TimeoutError
from google.cloud import pubsub_v1
import json
from datetime import datetime
import math
import os
import sys
from pymongo import MongoClient
import configparser
import certifi
import pandas as pd
from IPython.display import clear_output
from config.config import MONGO_URI, DATABASE_NAME, COLLECTION_NAME1

# Global variables to keep track of the previous speed and fuel consumption rate
prev_speed = None
prev_fcr = None
delay_cost_per_minute = 105

#MongoDB setup
# Connect to the MongoDB server
client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
# Select the database and collection
db = client[DATABASE_NAME]
collection = db[COLLECTION_NAME1]

# Function to process received messages
def callback(message):
    data = message.data.decode('utf-8')
    try:
        json_data = json.loads(data)
        print(f"Received message: {json_data}")
        # Process the message data
        process_message(json_data)

    except json.JSONDecodeError as e:
        print(f"Failed to decode JSON: {e}")
    message.ack()

# Pub/Sub setup
project_id = "connected-aircraft-ist"
subscription_id = "flight_data-sub"
service_account_file = "/Users/tamar.alphaidze/Desktop/airline_dashboard/leafy_airline/cost_calculator/json-keys-for-connect-aircraft-ist/connected-aircraft-ist-4fa26b67848a.json"
subscriber = pubsub_v1.SubscriberClient.from_service_account_file(service_account_file)
subscription_path = subscriber.subscription_path(project_id, subscription_id)
streaming_pull_future = subscriber.subscribe(subscription_path, callback=callback)
print(f"Listening for messages on {subscription_path}...\n")

# Functions from the notebook
def parse_data(flight_data):
    flight_id = flight_data['flight_id']
    timestamp = datetime.fromisoformat(flight_data['ts'])
    lat = flight_data['location']['lat']
    lon = flight_data['location']['long']
    speed = flight_data['velocity']['speed']
    heading = flight_data['velocity']['heading']
    distance_db = flight_data['distance_to_arrival']
    delay_length = flight_data['extra_length']

    return {
        'FlightID': flight_id,
        'Timestamp': timestamp,
        'Latitude': lat,
        'Longitude': lon,
        'Speed': speed,
        'Heading': heading,
        'Distance': distance_db,
        'Delay_length': delay_length
    }

def haversine(lat1, lon1, lat2, lon2):
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.asin(math.sqrt(a))
    km = 6371 * c
    return km

def time_left(distance, speed):
    if speed > 0:
        return distance / speed
    else:
        return float('inf')  # Infinite time if speed is zero

def calculate_cost(speed, distance, delay_cost_per_minute, delay_time, prev_speed, prev_fcr):
    time_left_in_hours = time_left(distance, speed)
    fuel_cost = fuel_consumption_price_to_speed(speed, prev_speed, prev_fcr)[0] * time_left_in_hours
    delay_cost = delay_cost_per_minute * delay_time
    total_cost = fuel_cost + delay_cost
    return total_cost

def fuel_consumption_price_to_speed(speed, prev_speed, prev_fcr=None):
    c = 2600 / (870**3)  # constant
    if prev_fcr is None:
        fcr_prev = c * (prev_speed**3)  # initial fuel consumption rate for the first record
    else:
        fcr_prev = prev_fcr
    fcr = fcr_prev * (prev_speed / speed)**3  # iterative calculation for subsequent records
    gallons = fcr * 2.84  # approx. 1 gallon = 2.84kg
    price = gallons * 3.5  # 1 gallon price = 3.5 EUR
    return price, fcr

def process_message(message_data):
    global prev_speed, prev_fcr
    
    current_entry = parse_data(message_data)

    distance_to_destination = current_entry['Distance']
    speed = current_entry['Speed']
    
    if prev_speed is not None:
        estimated_time_left = time_left(distance_to_destination, speed)

        # Calculate total cost for the current data point
        delay_time = time_left(current_entry['Delay_length'], speed)
        price, prev_fcr = fuel_consumption_price_to_speed(speed, prev_speed, prev_fcr)
        total_cost = calculate_cost(speed, distance_to_destination, delay_cost_per_minute, delay_time, prev_speed, prev_fcr)
        delay_cost = delay_time * delay_cost_per_minute
        fuel_cost = total_cost - delay_cost

        # Prepare the data to be inserted into MongoDB
        document = {
            "Timestamp": current_entry['Timestamp'],
            "Distance_to_Destination": distance_to_destination,
            "Estimated_Time_Left": estimated_time_left,
            "Delay_Time": delay_time,
            "Delay_Cost": delay_cost,
            "Fuel_Cost_per_Hour": fuel_cost,
            "Total_Cost_per_Hour": total_cost
        }

        # Insert the document into MongoDB
        collection.insert_one(document)
        print(f"Inserted document: {document}")

        # Display the results
        print(f"Timestamp: {current_entry['Timestamp']}")
        print(f"Distance to Destination: {distance_to_destination:.2f} km")
        print(f"Estimated Time Left: {estimated_time_left:.2f} hours")
        print(f"Delay Time: {delay_time:.2f} hours")
        print(f"Delay Cost: {delay_cost:.2f} EUR")
        print(f"Fuel Cost per Hour: {fuel_cost:.2f} EUR")
        print(f"Total Cost per Hour: {total_cost:.2f} EUR")
        print("-----")
    
    # Update previous speed for the next message
    prev_speed = speed

# Keep the script running to listen for messages
try:
    while True:
        time.sleep(5)
        print("Waiting for messages...")

except KeyboardInterrupt:
    streaming_pull_future.cancel()
    streaming_pull_future.result()

except Exception as e:
    print(f"An error occurred: {e}")

finally:
    subscriber.close()

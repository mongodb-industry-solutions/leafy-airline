import time
from concurrent.futures import TimeoutError
from google.cloud import pubsub_v1
import json

# Configure project, topic, subscription, and service account details
project_id = "connected-aircraft-ist"
subscription_id = "flight_data-sub"
service_account_file = "/Users/tamar.alphaidze/Desktop/airline_dashboard/leafy_airline/cost_calculator/json-keys-for-connect-aircraft-ist/connected-aircraft-ist-4fa26b67848a.json"

# Create the Pub/Sub subscriber client with the service account credentials
subscriber = pubsub_v1.SubscriberClient.from_service_account_file(service_account_file)
subscription_path = subscriber.subscription_path(project_id, subscription_id)

# Function to process received messages
def callback(message):
    print(f"Received message: {message.data}")
    
    # Decode the message data
    data = message.data.decode('utf-8')
    try:
        # Parse the data as JSON (if applicable)
        json_data = json.loads(data)
        print("Parsed JSON data:", json_data)
        
        # Process the JSON data as required
        # For example, store it in a database, run some calculations, etc.
        
    except json.JSONDecodeError as e:
        print(f"Failed to decode JSON: {e}")
    
    # Acknowledge the message
    message.ack()

# Subscribe to the subscription with the callback
streaming_pull_future = subscriber.subscribe(subscription_path, callback=callback)
print(f"Listening for messages on {subscription_path}...\n")

# Loop to keep the script running and print a message every 5 seconds
try:
    while True:
        time.sleep(5)
        print("Waiting for messages...")

except KeyboardInterrupt:
    # Cancel the streaming pull future if the script is interrupted
    streaming_pull_future.cancel()
    streaming_pull_future.result()

except Exception as e:
    print(f"An error occurred: {e}")

finally:
    # Close the subscriber client
    subscriber.close()

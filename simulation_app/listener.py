# SIMPLE EXAMPLE OF PULL SUBSCRIPTION TO THE TOPIC SO WE CAN USE IT 
# ON VERTEX AI OPTIMIZATION MODEL

import time
from concurrent.futures import TimeoutError
from google.cloud import pubsub_v1
import json

# Configura las variables del proyecto, topic y suscripción
project_id = "connected-aircraft-ist"
topic_id = "leafyAirlineData"
service_account_file = "json-keys-for-connect-aircraft-ist/connected-aircraft-ist-4fa26b67848a.json"
subscription_id = "leafyAirlineData-sub"
# Crea el cliente de suscripción
subscriber = pubsub_v1.SubscriberClient()
subscription_path = subscriber.subscription_path(project_id, subscription_id)

# Función para procesar los mensajes recibidos
def callback(message):

    print(f"Received message: {message}")
    data_json = message.data.decode('utf-8')

    # Convert the JSON string back to a dictionary
    data_dict = json.loads(data_json)

    # Work with the dictionary fields
    flight_id = data_dict.get("flight_id")
    timestamp = data_dict.get("ts") + "Z"
    location = data_dict.get("location")

    # Create the new dict thats going to be sent to mongo
    new_data = {"ts": { "$date": timestamp},
                "flight_id" : flight_id, 
                "location" : location}

    print(f"New processed message : {new_data}")

    message.ack()

# Suscribe el callback a la suscripción
streaming_pull_future = subscriber.subscribe(subscription_path, callback=callback)
print(f"Listening for messages on {subscription_path}...\n")

# Loop para mantener el script corriendo e imprimir un mensaje cada 5 segundos
try:
    while True:
        time.sleep(5)
        print("Esperando mensajes...")

except KeyboardInterrupt:
    # Cierra el flujo al interrumpir el script
    streaming_pull_future.cancel()
    streaming_pull_future.result()

except Exception as e:
    print(f"An error occurred: {e}")
finally:
    subscriber.close()

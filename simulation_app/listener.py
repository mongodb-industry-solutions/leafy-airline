# SIMPLE EXAMPLE OF PULL SUBSCRIPTION TO THE TOPIC SO WE CAN USE IT 
# ON VERTEX AI OPTIMIZATION MODEL


import time
from concurrent.futures import TimeoutError
from google.cloud import pubsub_v1

# Configura las variables del proyecto, topic y suscripción
project_id = "connected-aircraft-ist"
topic_id = "flight_data"
service_account_file = "json-keys-for-connect-aircraft-ist/connected-aircraft-ist-4fa26b67848a.json"
subscription_id = "flight_data-sub"
# Crea el cliente de suscripción
subscriber = pubsub_v1.SubscriberClient()
subscription_path = subscriber.subscription_path(project_id, subscription_id)

# Función para procesar los mensajes recibidos
def callback(message):
    print(f"Received message: {message.data}")
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

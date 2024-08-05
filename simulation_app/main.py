from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from simulator import DataSimulator
from path_finder import find_path
from apscheduler.schedulers.background import BackgroundScheduler
import logging
import os
import json
from google.cloud import pubsub_v1

# Resources:
# https://medium.com/@mouaazfarrukh99/getting-started-with-pub-sub-using-python-305a19901f1a
# https://www.youtube.com/watch?v=ML6P1ksHcqo&list=PLIivdWyY5sqKwVLe4BLJ-vlh9r9zCdOse&index=4 


# MongoDB connection : Data API - Custom endpoints


# INITIALIZE THE APP WITH COMMAND : fastapi dev main.py
app = FastAPI()

origins = [
    "http://localhost:3000",
    "https://airplanedashboard-65jcrv6puq-ew.a.run.app"
    # Add other origins if needed
]

# origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# LOGGING CONFIG TO ANALYZE DATA
logging.basicConfig(
    filename='logs/app.log',
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)

# SCHEDULER : Calls my function (simulator) every x seconds
measurement_interval = 2.5
scheduler = BackgroundScheduler()
scheduler_active = False
# resume_needed = False

docs = []

# PUBSUB INFO
project_id = "connected-aircraft-ist"
topic_id = "leafyAirlineData"
service_account_file = "json-keys-for-connect-aircraft-ist/connected-aircraft-ist-4fa26b67848a.json"

publisher = pubsub_v1.PublisherClient.from_service_account_file(service_account_file)
topic_path = publisher.topic_path(project_id, topic_id)

# GENERAL LIMITS
doc_limit = 200


# FUNCTIONS
def publish_data(simulator : DataSimulator):

    (finished, data)= simulator.generate_data()

    if len(docs) <= doc_limit:
        docs.append(data)

    if finished:

        global scheduler
        logging.info("ARRIVED TO DESTINATION")
        logging.info("Scheduler stopped due to finished flight")
        scheduler.pause()
        
    # Uncomment when using pubsub
    data = json.dumps(data).encode("utf-8")
    future = publisher.publish(topic_path, data)
    logging.info(future)

    return {"status": "New data published"}


# ENDPOINTS FOR FAST API APP 

@app.post("/start-scheduler")
async def start_scheduler(flight_info:dict):
    '''
    This function will trigger the start of the data simulator using the data
    for the selected flight.
    This data will be provided in the POST call that will trigger this function
    and it will be a dictionary containing:
        - flight_id
        - dep_code
        - arr_code
        - dep_loc
        - arr_loc

    This data will be the one from the flight that we had selected in our tab

    This function will first find the new path for our flight (taking
    disruption into account). 
    Then it will instantiate the DataSimulator for our current flight
    anf finally will start the scheduler that will begin to produce data
    calling the generate_data function from our simulator every 5 seconds
    '''
    logging.info("Data received")

    # Find the path between the departure and arrival locations
    (disrupted, path_data) = find_path(flight_info)

    # Create our Data Simulator for this flight
    simulator = DataSimulator(flight_info["flight_id"],
                              disruption = disrupted,
                              path_atrib = path_data, 
                              seconds_per_iter= 250)
    
    logging.info("Simulator created")

    global scheduler, scheduler_active

    if not scheduler_active:

        scheduler.add_job(publish_data, 'interval', 
                            seconds = measurement_interval ,
                            args = (simulator,)) 
        scheduler.start()
        scheduler_active = True
        logging.info("Scheduler started")

        return {"status": "Scheduler started"}
    
    else:
        return {"status": "Scheduler is already running"}

@app.get("/reset-scheduler")
async def reset_scheduler():

    global scheduler, scheduler_active
    if scheduler_active:

        scheduler.shutdown()
        scheduler_active = False


    scheduler = BackgroundScheduler()

    return {"status": "Reset complete"}





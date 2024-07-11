from fastapi import FastAPI
from simulator import DataSimulator
from path_finder import find_path
from apscheduler.schedulers.background import BackgroundScheduler
import logging
import os
import json
#from google.cloud import pubsub_v1


# INITIALIZE THE APP WITH COMMAND : fastapi dev main.py
app = FastAPI()

# INITIALIZE PUBSUB PUBLISHER (with venv)
# Should be global so we don't have to create it every time that we enter the get_measurements func
'''publisher = pubsub_v1.PublisherClient()
topic_name = 'projects/{project_id}/topics/telemetry_data'.format(
    project_id=os.getenv('GOOGLE_CLOUD_PROJECT'),
    topic='telemetry_data', 
)
publisher.create_topic(name=topic_name)
'''

# LOGGING CONFIG TO ANALYZE DATA
logging.basicConfig(
    filename='logs/app.log',
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)

# SCHEDULER : Calls my function (simulator) every x seconds
measurement_interval = 5
scheduler = BackgroundScheduler()
docs = []

def publish_data(simulator : DataSimulator):

    data = simulator.generate_data()
    docs.append(data)
        
    # Uncomment when using pubsub
    #publisher.publish(topic_name, data)
    #logging.info("Measurement published")

    return {"status": "New data published"}



# ENDPOINTS FOR FAST API APP

# Eventually, the simulation should be triggered by using fetch('http://localhost:8000/start-scheduler')
# in our next.js app

def log_info(dic:dict):
    
    for key in dic.keys():
        logging.info(dic[key])
    return



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
    log_info(flight_info)

    # Find the path between the departure and arrival locations
    (disrupted, paths) = find_path(flight_info)

    # Create our Data Simulator for this flight
    simulator = DataSimulator(flight_info["flight_id"],
                              disruption = disrupted,
                              paths = paths)
    
    logging.info("Simulator created")

    # Start the scheduler that will get the data every second
    if not scheduler.running:
        scheduler.add_job(publish_data, 'interval', 
                        seconds = measurement_interval ,
                        args = (simulator,)) 
        scheduler.start()
        logging.info("Scheduler started")

    return {"status": "Scheduler already running"}


# Eventually, the simulation should be triggered by using fetch('http://localhost:8000/stop-scheduler')
# in our next.js app

@app.get("/stop-scheduler")
async def stop_scheduler():
    '''
    This function will trigger the stop of the scheduler that was calling periodically
    our get_measurements function'''

    if scheduler.running:
        scheduler.shutdown()
        logging.info("Scheduler stopped")

        # Create json doc with all the records
        logging.info(f"Docs recorded {len(docs)}")

        with open(f'sim_data/flight_telemetry_data.json', 'w') as f:
            json.dump(docs, f, indent=4)
        
        return {"status": "Scheduler stopped"}
    
    
    return {"status": "Scheduler already stopped"}




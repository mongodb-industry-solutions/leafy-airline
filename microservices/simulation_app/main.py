from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler

from files.path_finder import find_path
from files.simulator import DataSimulator

import uvicorn
import logging
import os
import json
from google.cloud import pubsub_v1
import threading


# INITIALIZE THE APP WITH COMMAND : fastapi dev main.py
app = FastAPI()

origins = [
    "http://localhost:3000",
    "https://airplanedashboard-65jcrv6puq-ew.a.run.app",
    "https://airplanedashboard-test-502454695591.europe-west1.run.app"
    # "*"
    # Add other origins if needed
]

app.add_middleware(
    CORSMiddleware,
    # allow_origins=["*"],
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("/logs", exist_ok=True)

# LOGGING CONFIG TO ANALYZE DATA
logging.basicConfig(
    filename='/logs/app.log',
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)

# SCHEDULER : Calls my function (simulator) every x seconds
measurement_interval = 2.5
sessions = {}
sessions_lock = threading.Lock()

scheduler = BackgroundScheduler()
scheduler.start()

# PUBSUB INFO - leafyAirlineData + leafyAirlinePath Subscriptions
project_id = "connected-aircraft-ist"

data_topic_id = "leafyAirlineData"
path_topic_id = "leafyAirlinePath"

# Use this to avoid using service accounts
data_publisher = pubsub_v1.PublisherClient()
path_publisher = pubsub_v1.PublisherClient()

data_topic = data_publisher.topic_path(project_id, data_topic_id)
path_topic = path_publisher.topic_path(project_id, path_topic_id)

# GENERAL LIMITS
# doc_limit = 200


# FUNCTIONS

def publish_data(simulator : DataSimulator):

    (finished, data)= simulator.generate_data()

    data_bytes = json.dumps(data).encode("utf-8")
    data_publisher.publish(data_topic, data_bytes)
    # print(f"[{simulator.SID}] Data published")

    # IMPORTANT - IF THREADING ISSUES, UNCOMMENT THIS AND COMMENT BELOW
    # if finished:

    #     sid = simulator.SID
    #     if sid in sessions:
    #         try:
    #             sessions[sid]["scheduler"].remove_job(sid)
    #             del sessions[sid]
    #             logging.info(f"Session {sid} finished — job removed and session cleared.")
    #         except Exception as e:
    #             logging.error(f"Error stopping finished session {sid}: {e}")


    # return {"status": "New data published"}

    if finished:
        sid = simulator.SID
        # Use scheduler.remove_job directly and protect sessions dict with a lock
        with sessions_lock:
            if sid in sessions:
                try:
                    # remove job by id
                    scheduler.remove_job(sid)
                except Exception as e:
                    logging.error(f"Error removing job {sid}: {e}")
                try:
                    del sessions[sid]
                    logging.info(f"Session {sid} finished — job removed and session cleared.")
                except KeyError:
                    logging.error(f"Tried to delete session {sid} but it was already removed.")
    return {"status": "New data published"}

def publish_path(flight_id, path_data):

    # Create the new message
    msg = {"flight_id" : flight_id, 
           "initial_path_airps" : path_data["initial_path_airps"],
           "new_path_airps" : path_data["new_path_airps"],
           "disruption_coords" : path_data["disruption_coords"]
           }
    
    data = json.dumps(msg).encode("utf-8")
    path_publisher.publish(path_topic, data)


    # print("Path published: ", data)

    return {"status": "New path published"}


# ENDPOINTS FOR FAST API APP 

@app.post("/start-scheduler")
async def start_scheduler(flight_info:dict):
    '''
    This function will trigger the start of the data simulator using the data
    for the selected flight.
    This data will be provided in the POST call that will trigger this function
    and it will be a dictionary containing:
        - session_id
        - flight_id
        - dep_code
        - arr_code
        - dep_loc
        - arr_loc

    This data will be the one from the flight that we had selected in our tab

    This function will first find the new path for our flight (taking
    disruption into account). 
    Then it will instantiate the DataSimulator for our current flight
    and finally will start the scheduler that will begin to produce data
    calling the generate_data function from our simulator every 5 seconds
    '''

    session_id = flight_info["session_id"]
    logging.info(f"Start request for session {session_id}")

    if session_id in sessions:
        return {"status": f"Session {session_id} already running"}

    # Find the path between the departure and arrival locations
    (disrupted, path_data) = find_path(flight_info)

    # Publish the initial and new path in path topic
    publish_path(flight_info["flight_id"], path_data)

    # Check session id
    # logging.info("Session ID: %s", flight_info["session_id"])

    # Create our Data Simulator for this flight
    simulator = DataSimulator(session_ID = session_id,
                              flight_ID = flight_info["flight_id"],
                              disruption = disrupted,
                              path_atrib = path_data, 
                              seconds_per_iter= 300)
    

    # Store simulator in global sessions
    sessions[session_id] = simulator

    # Add new independent job for this session
    scheduler.add_job(
        publish_data,
        "interval",
        seconds=measurement_interval,
        args=[simulator],
        id=session_id,  # unique job per session
        replace_existing=True,
    )

    logging.info(f"✅ Scheduler job started for session {session_id}")
    return {"status": f"Scheduler started for session {session_id}"}


@app.get("/reset-scheduler/{session_id}")
async def reset_scheduler(session_id: str):

    if session_id not in sessions:
        return {"status": f"No active session found for {session_id}"}

    try:
        scheduler.remove_job(session_id)
        del sessions[session_id]
        logging.info(f"🛑 Session {session_id} reset and job removed.")
        return {"status": f"Session {session_id} reset complete"}
    except Exception as e:
        logging.error(f"Error resetting session {session_id}: {e}")
        return {"status": f"Error resetting session {session_id}: {e}"}
    

@app.get("/list-sessions")
async def list_sessions():
    """Optional helper to debug running simulators"""
    return {"active_sessions": list(sessions.keys())}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))  # Use PORT env var if provided by Cloud Run
    uvicorn.run(app, host="0.0.0.0", port=port)



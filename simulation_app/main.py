from fastapi import FastAPI
from simulator import run_script
from apscheduler.schedulers.background import BackgroundScheduler
import logging


# INITIALIZE THE APP WITH COMMAND : fastapi dev main.py
app = FastAPI()

# LOGGING CONFIG TO ANALYZE DATA
logging.basicConfig(
    filename='logs/app.log',
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)

# SCHEDULER : Calls my function (simulator) every x seconds
measurement_interval = 5
scheduler = BackgroundScheduler()

# PERIODIC TASK FOR SCHEDULER
def get_measurements():
    # Implement new publish with PubSub
    msg = run_script()
    logging.info("Measurement completed")

    return {"Mensaje": msg }

scheduler.add_job(get_measurements, 'interval', seconds=measurement_interval) 

# ENDPOINTS FOR FAST API APP

# Eventually, the simulation should be triggered by using fetch('http://localhost:8000/start-scheduler')
# in our next.js app

@app.post("/start-scheduler")
async def start_scheduler():
    if not scheduler.running:
        scheduler.start()
        logging.info("Scheduler started")
        return {"status": "Scheduler started"}
    return {"status": "Scheduler already running"}


# Eventually, the simulation should be triggered by using fetch('http://localhost:8000/stop-scheduler')
# in our next.js app

@app.post("/stop-scheduler")
async def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        logging.info("Scheduler stopped")
        return {"status": "Scheduler stopped"}
    return {"status": "Scheduler already stopped"}





import matplotlib.pyplot as plt
import os

import numpy as np 
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import json
import os

class DataSimulator:
    def __init__(self, flight_ID, dep_location, arr_location, gen_period):
        
        # INITIALIZATION
        self.FID = flight_ID
        self.dep_loc = np.array(dep_location)
        self.arriv_loc = np.array(arr_location)
        self.t = gen_period
        
        # THRESHOLDING 
        # We're going to use thresholds that will allow us to limit the measurements
        # and make sure that they are adequate

        # Maximum speed variation between iterations
        self.sp_th = 5
        # Maximum location distance between one point and the next one
        self.loc_th = 1
        
        # It will determine how much can the plane cover in the time between measurements
        # Example: 10 = maximum coverage of 10 meters/iteration
        self.location_update_rate = 2
        
        # STORED DATA 
        # It will allow the program to access previous data so that measurements are
        # coherent 
        self.prev_speed = 0
        self.prev_location = np.array(dep_location)
        self.timestamp = datetime.now()

    def generate_data(self):
        
        # 1. Compute direction vector from current position to arrival location so we know
        # in which direction the airplane should move
        direction_vector = self.arriv_loc - self.prev_location
        distance_to_arrival = np.linalg.norm(direction_vector)
        
        # 2. Normalize the vector so we have its unitary 
        unit_vector = direction_vector / distance_to_arrival
        
        # 3. Add some noise to the vector so the path is not a straight line to the arrival point
        noise = np.random.normal(0, 0.15, 2)
        noisy_vector = unit_vector + noise

        # Ensure the noisy vector still points roughly towards the arrival location
        if np.dot(noisy_vector, unit_vector) < 0:
            noisy_vector = -noisy_vector
        
        # 4. If the distance to arrival is less than the threshold, we assume that the next point is 
        # the arrival
        if distance_to_arrival < self.loc_th :
            new_loc = self.arriv_loc
        else:
            step_distance = np.random.randint(1,self.location_update_rate)
            new_loc = self.prev_location + step_distance * noisy_vector
        
        
        # 5. Compute new speed randomly according to previous values
        new_speed = self.prev_speed + np.random.uniform(-self.sp_th*0.5, self.sp_th)
        if new_speed < 0:
            new_speed = self.prev_speed
        
        new_heading = (np.degrees(np.arctan2(noisy_vector[1], noisy_vector[0])) + 360) % 360
        self.prev_location = new_loc
        self.prev_speed = new_speed
        self.timestamp += timedelta(seconds=self.t)


        return {
            "FlightID": self.FID,
            "Timestamp": self.timestamp.isoformat(),
            "Location": {
                "Latitude": new_loc[1],
                "Longitude": new_loc[0]
            },
            "Velocity": {
                "Speed": new_speed,
                "Heading": new_heading
            }
        }

    def create_doc(self):
        data = self.generate_data()
        return data

class Plotter:

    def __init__(self, ts, speeds , dep, arriv, locations):

        self.ts = ts
        self.speeds = speeds
        self.dep_loc = dep
        self.arriv_loc = arriv
        self.locations = locations

    def plot_speed_evolution(self):

        plt.figure(figsize=(10, 6))
        plt.plot(self.ts, self.speeds, 'bo-', label='Speed evolution', markersize=5, linewidth=1)
        plt.xlabel('Timestamp')
        plt.ylabel('Speed')
        plt.title('Flight Speed over time')
        plt.legend()
        plt.grid(True)

        # Format x-axis timestamps to simplify
        plt.xticks(rotation=45)

        if not os.path.exists('sim_imgs'):
            os.makedirs('sim_imgs')

        plt.savefig(f'sim_imgs/flight_speed.png')
        plt.show()

        return

    def plot_flight_path(self):

        # Unpack the departure and arrival locations
        dep_lon, dep_lat =  self.dep_loc
        arr_lon, arr_lat = self.arriv_loc

        # Unpack the flight path locations
        lons, lats = zip(*self.locations)

        # Create the plot
        plt.figure(figsize=(10, 6))
        plt.plot(lons, lats, 'bo-', label='Flight Path', markersize=5, linewidth=1)
        plt.plot(dep_lon, dep_lat, 'go', label='Departure', markersize=10)
        plt.plot(arr_lon, arr_lat, 'ro', label='Arrival', markersize=10)

        # Annotate the departure and arrival points
        plt.text(dep_lon, dep_lat, ' Departure', horizontalalignment='right', verticalalignment='bottom')
        plt.text(arr_lon, arr_lat, ' Arrival', horizontalalignment='left', verticalalignment='bottom')

        # Set labels and title
        plt.xlabel('Longitude')
        plt.ylabel('Latitude')
        plt.title('Flight Path from Departure to Arrival')
        plt.legend()
        plt.grid(True)

        if not os.path.exists('sim_imgs'):
            os.makedirs('sim_imgs')

        plt.savefig(f'sim_imgs/flight_path.png')
        plt.show()

        return
    
    def create_plots(self):

        self.plot_flight_path()
        self.plot_speed_evolution()

        return


def run_script():

    # FLIGHT INITIAL PARAMETERS
    dep = (0,0)
    arriv = (20.0,20.0)   # Important: MUST BE FLOAT
    flightID = "9786AE"
    generation_period = 60

    # STOP CONDITION
    arrived = False

    # SIMULATION
    simulator = DataSimulator(flight_ID=flightID,
                               dep_location=dep,
                               arr_location=arriv,
                               gen_period=generation_period)
    locations = [dep]
    speeds = [0]
    ts = [datetime.now()]
    docs = []

    # MAIN LOOP AND DATA STORAGE
    if not os.path.exists('sim_data'):
        os.makedirs('sim_data')

    with open(f'sim_data/flight_telemetry_data.json', 'w') as f:

        while not arrived:
            doc = simulator.create_doc()
            new_loc = (doc["Location"]["Longitude"], doc["Location"]["Latitude"])

            if new_loc == arriv:
                arrived = True

            speeds.append(doc["Velocity"]["Speed"])
            ts.append(doc["Timestamp"])
            locations.append(new_loc)
            docs.append(doc)

        json.dump(docs, f, indent=4)
    
    # CREATE PLOTTER AND REPRESENTATIONS
    #plotter = Plotter(ts,speeds, simulator.dep_loc, simulator.arriv_loc, locations)
    #plotter.create_plots()

    return "Path and images were created"

    
        
        

        
        
        
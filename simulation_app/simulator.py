import os
import numpy as np 
from datetime import datetime


class DataSimulator:

    def __init__(self, flight_ID : str, path: list):
        
        self.FID = flight_ID
        self.path = path
        self.arrived = False

        # The point that we're heading to
        self.headed_point = np.array(path[1])

        self.prev_speed = 0
        self.prev_location = np.array(path[0])
        self.timestamp = datetime.now()

        # THRESHOLDING 
        # Maximum speed variation between iterations
        self.sp_th = 5
        # Maximum location distance between one point and the next one
        self.loc_th = 1
        
        # It will determine how much can the plane cover in the time between measurements
        # Example: 10 = maximum coverage of 10 meters/iteration
        self.location_update_rate = 2

    def get_real_distance(self, loc1, loc2):
        """
        Calculate the great-circle distance between two points on the Earth.
        """
        R = 6371e3  # Earth radius in meters
        phi1, lambda1 = np.radians(loc1)
        phi2, lambda2 = np.radians(loc2)
        delta_phi = phi2 - phi1
        delta_lambda = lambda2 - lambda1

        a = np.sin(delta_phi / 2.0)**2 + np.cos(phi1) * np.cos(phi2) * np.sin(delta_lambda / 2.0)**2
        c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
        return R * c

    def new_headed_point(self, last_point):
        '''
        Function that will check which point of the path we're
        heading next
        '''
        path = self.path
        i = path.index(last_point)

        # First we check if the point to which we are arriving is the final goal
        if i == (len(path)-1):
            self.arrived = True
            self.headed_point = None
        
        # If not, we can see if there are more than two main points in our path
        elif len(path) == 2:
            self.headed_point = path[-1]
        
        else:
            self.headed_point = path[i+1]

        return self.arrived

    def generate_data(self):
        '''
        This function will generate real-time simulated data based on the route that
        the aircraft is following (path)
        '''
        
        # 1. Compute direction vector from current position to headed point so we know
        # in which direction the airplane should move
        direction_vector = self.headed_point - self.prev_location
        distance_to_arrival = self.get_real_distance(self.prev_location, self.headed_point)
        
        # 2. Normalize the vector so we have its unitary 
        unit_vector = direction_vector / np.linalg.norm(direction_vector)
        
        # 3. Add some noise to the vector so the path is not a straight line to the arrival point
        noise = np.random.normal(0, 0.15, 2)
        noisy_vector = unit_vector + noise

        # Ensure the noisy vector still points roughly towards the arrival location
        if np.dot(noisy_vector, unit_vector) < 0:
            noisy_vector = -noisy_vector
        
        # 4. If the distance to arrival is less than the threshold, we assume that the next point it's 
        # been reached and we have to get the new headed point
        if distance_to_arrival < self.loc_th :
            new_loc = self.headed_point
            finished = self.new_headed_point()

        else:
            step_distance = np.random.randint(1,self.location_update_rate)
            new_loc = self.prev_location + step_distance * noisy_vector
    
        # 5. Compute new speed randomly according to previous values
        # Maintain it the same for now
        new_speed = self.prev_speed
        
        # 6. Compute new heading direction
        new_heading = (np.degrees(np.arctan2(noisy_vector[1], noisy_vector[0])) + 360) % 360

        # 7. Update every measurement
        self.prev_location = new_loc
        self.prev_speed = new_speed
        self.timestamp = datetime.now()


        return {
                "flight_id": self.FID,
                "ts": self.timestamp.isoformat(),
                "location": {
                    "lat": new_loc[1],
                    "long": new_loc[0]
                },
                "velocity": {
                    "speed": new_speed,
                    "heading": new_heading
                }
            }



    
        
        

        
        
        
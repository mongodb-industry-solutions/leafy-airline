import os
import numpy as np 
from datetime import datetime
import math


class DataSimulator:

    def __init__(self, flight_ID : str, disruption : bool,  path_atrib: dict):
        
        self.FID = flight_ID
        self.disruption = disruption
        self.path = path_atrib["path"]
        self.extra_length = path_atrib["extra_length"]
        self.arrived = False
        
        # Get the initial headed point
        self.headed_point = np.array(self.path[1])
        self.path_idx = 1

        self.prev_speed = 0
        self.prev_location = np.array(self.path[0])
        self.timestamp = datetime.now()

        # THRESHOLDING 
        # Maximum speed variation between iterations
        self.sp_th = 5
        # Maximum location distance between one point and the next one
        self.loc_th = 1
        
        # It will determine how much can the plane cover in the time between measurements
        # Example: 10 = maximum coverage of 10 meters/iteration
        self.location_update_rate = 2

    def get_real_distance(self, loc1, loc2) :
        '''
        Haversine function to calculate distance between two points in the earth
        '''
        (lat1, lon1) = loc1
        (lat2, lon2) = loc2
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
        c = 2 * math.asin(math.sqrt(a))
        km = 6371 * c
        return km

    def dist_to_arrival(self, loc):
        '''
        This function computes the distance to arrival based on the 
        followed route. If it has been a disruption, this distance will
        be computed using the new path
        '''
        # Get the idx of the current headed point in the path
        path_idx = self.path_idx

        if len(self.path) == 2:
            return self.get_real_distance(loc, self.path[-1])
        else:
            total_length = 0
            for i in range(path_idx, len(self.path)):
                total_length += self.get_real_distance(loc, self.path[i])
                loc = self.path[i]

            return total_length

    def new_headed_point(self, last_point):
        '''
        Function that will check which point of the path we're
        heading next
        '''
        path = self.path
        i = self.path_idx

        # First we check if the point to which we are arriving is the final goal
        if i == (len(path)-1):
            self.arrived = True
            self.headed_point = None
        
        # If not, we can see if there are more than two main points in our path
        elif len(path) == 2:
            self.headed_point = path[-1]
        
        else:
            self.headed_point = path[i+1]

        return 

    def generate_data(self):
        '''
        This function will generate real-time simulated data based on the route that
        the aircraft is following (path)

        Returns:
        1. finished : Boolean that states if we've reached our arrival point
        2. Simulated data : dict containing
            - flight_id
            - ts 
            - disrupted : Boolean that shows if the route was disrupted
            - extra_length : Extra length to cover because of disruption (in km)
            - distance_to_arrival : Distance to arrival location based on route (in km)
            - location (lat , long)
            - velocity : speed: new_speed,
                        heading: new_heading
        '''

        # 1. Compute direction vector from current position to headed point so we know
        # in which direction the airplane should move
        direction_vector = self.headed_point - self.prev_location
        distance_to_headed = self.get_real_distance(self.prev_location, self.headed_point)
        
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
        if distance_to_headed < self.loc_th :
            new_loc = self.headed_point
            self.new_headed_point()

            # Add 1 to the idx because we've changed to the next point of the path
            self.path_idx += 1

        else:
            step_distance = np.random.randint(1,self.location_update_rate)
            new_loc = self.prev_location + step_distance * noisy_vector
    
        # 5. Compute new speed randomly according to previous values
        # Maintain it the same for now
        new_speed = self.prev_speed
        
        # 6. Compute new heading direction and new distance to arrival
        new_heading = (np.degrees(np.arctan2(noisy_vector[1], noisy_vector[0])) + 360) % 360

        distance_to_dest = self.dist_to_arrival(new_loc)

        # 7. Update every measurement
        self.prev_location = new_loc
        self.prev_speed = new_speed
        self.timestamp = datetime.now()


        return (self.arrived, {
                "flight_id": self.FID,
                "ts": self.timestamp.isoformat(),
                "disrupted" : self.disruption,
                "extra_length" : self.extra_length,
                "distance_to_arrival" : distance_to_dest,
                "location": {
                    "lat": new_loc[1],
                    "long": new_loc[0]
                },
                "velocity": {
                    "speed": new_speed,
                    "heading": new_heading
                }
            })



    
        
        

        
        
        
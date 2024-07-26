import os
import numpy as np 
from datetime import datetime
import math
from pyproj import CRS, Transformer

# Define the WGS84 projection (latitude and longitude)
wgs84 = CRS.from_epsg(4326)
# Define the Mercator projection (x, y)
mercator = CRS.from_epsg(3857)


class SpeedSimulator:
    def __init__(self):
        '''
        Class that will smimulate the speed controls from a plane based on distance 
        to arrival.

        Using the 3:1 nautic rule, this class will compute the speed at which the
        aircraft should fly in each instant. 

        Assumed limit altitude : 30.000 feet (=9200m)
        3:1 calculated distance to limit altitude : 170 km

        '''

        self.prev_speed = 0
        self.avg_plane_speed = 245 #245 # m/s -> 885 km/h
        self.speed_descent_rate = 0.01 # m/s (18 km/h)-> 4 min to go back to 0 m/s
        self.approach_dist = 170 # km (Based on 0.245 km/s advance, we would need 11.56 min to descend)


    def get_new_speed(self, new_dist):

        # If the distance to arrival is equal or less than the approach_dist
        # we start the "descent"
        speed = self.prev_speed

        if new_dist <= self.approach_dist:
            if speed > 100:
                speed -= self.speed_descent_rate
            else:
                speed = 100
        else:
            # We add a slight noise to our speed calculations
            speed = self.avg_plane_speed + np.random.uniform(-5, 5)

        return speed  #*3.6 #Speed in km/h

class CoordinateTransformer:

    def __init__(self, ):

        self.to_2d_transformer = Transformer.from_crs(wgs84, mercator)
        self.to_latlon_transformer = Transformer.from_crs(mercator, wgs84)

        return
    
    def latlon_to_2d(self, lat, lon):
        x, y = self.to_2d_transformer.transform(lat, lon)
        return x, y

    def _2d_to_latlon(self, x, y):
        lat, lon = self.to_latlon_transformer.transform(x, y)
        return lat, lon

    def unit_vector(self, origin, destination):
        # Calculate the vector from origin to destination
        vector = (destination[0] - origin[0], destination[1] - origin[1])
        # Calculate the magnitude of the vector
        magnitude = math.sqrt(vector[0]**2 + vector[1]**2)
        # Normalize the vector
        if magnitude == 0:
            return (0, 0)
        unit = (vector[0] / magnitude, vector[1] / magnitude)
        return unit
    
    def compute_new_loc(self, origin_lat, origin_lon, dest_lat, dest_lon, advancement):
        #Transform the coordinates from lat/lon to 2D
        origin_2d = self.latlon_to_2d(origin_lat, origin_lon)
        destination_2d = self.latlon_to_2d(dest_lat, dest_lon)
        
        # Calculate the unit vector from origin to destination
        unit = self.unit_vector(origin_2d, destination_2d)
        
        # Calculate the displacement vector for advancement_rate meters
        displacement = (unit[0] * advancement, unit[1] * advancement)
        
        # Add the displacement vector to the origin
        new_2d = (origin_2d[0] + displacement[0], origin_2d[1] + displacement[1])
        
        # Transform the new 2D coordinates back to lat/lon
        new_lat, new_lon =self._2d_to_latlon(new_2d[0], new_2d[1])
        
        return (new_lat, new_lon)

class DataSimulator:

    def __init__(self, flight_ID : str, disruption : bool,  path_atrib: dict, seconds_per_iter: int):
        
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

        # Avg aircraft speed is usually between 880 - 930 km/h -> 247,22 m/s
        self.SpController = SpeedSimulator()
        self.advancement_rate = 245*seconds_per_iter # Indicates the METERS that the plane can cover per iteration
        # Coordinate transformer
        self.CoordTransformer = CoordinateTransformer()

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

        # If we're just going from A to B, get real straight-line distance to arrival
        if len(self.path) == 2:
            return self.get_real_distance(loc, self.path[-1])
        else:
            # If there are more than 1 points in our route, iterate through them
            # so we get the real distance that we have to cover using the extended path
            total_length = 0
            for i in range(path_idx, len(self.path)):
                total_length += self.get_real_distance(loc, self.path[i])
                loc = self.path[i]

            return total_length

    def new_headed_point(self):
        '''
        Function that will check which point of the path we're
        heading next
        '''
        path_len = len(self.path)
        i = self.path_idx

        # First we check if the point to which we are arriving is the final goal
        if i == path_len:
            self.arrived = True
            self.headed_point = None
            return
        
        # If not, we can see if there are more than two main points in our path
        elif path_len == 2:
            self.headed_point = self.path[-1]
        
        else:
            self.headed_point = self.path[i+1]

        self.path_idx += 1

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
        print('\nNew measurements: ')

        # Distance to next point in km
        distance_to_headed = self.get_real_distance(self.prev_location, self.headed_point)

        # Compute next location 

        # if the distance is less that what the plane is going to advance, we get to the next point directly
        if distance_to_headed < (self.advancement_rate/1000) :
            new_loc = self.headed_point
            self.new_headed_point()

        else:
            # If the headed point is not reached, we just compute new location based of previous speed
            new_loc = self.CoordTransformer.compute_new_loc(self.prev_location[0],
                                                            self.prev_location[1],
                                                            self.headed_point[0],
                                                            self.headed_point[1], 
                                                            self.advancement_rate )


        # 5. Compute new heading direction and new distance to arrival (using the described path)
        # new_heading = (np.degrees(np.arctan2(unit_vector[1], unit_vector[0])) + 360) % 360
        distance_to_dest = self.dist_to_arrival(new_loc)

        print('Distance to headed: ', distance_to_headed)
        print('Distance to arrival: ', distance_to_dest)
        print('Heading to:', self.headed_point)
        print('From : ', new_loc)

        # Compute new speed 
        new_speed = self.SpController.get_new_speed(distance_to_dest)
        
        # Update every measurement
        self.prev_location = new_loc
        self.prev_speed = new_speed
        self.timestamp = datetime.now()


        return (self.arrived, {
                "flight_id": self.FID,
                "ts": self.timestamp.isoformat(),
                "path" : self.path,
                "disrupted" : self.disruption,
                "extra_length" : self.extra_length,
                "distance_to_arrival" : distance_to_dest,
                "location": {
                    "lat": new_loc[0],
                    "long": new_loc[1]
                },
                "velocity": {
                    "speed": new_speed,
                    "heading": 'tbd'
                }
            })



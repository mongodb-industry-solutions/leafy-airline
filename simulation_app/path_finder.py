import math
import networkx as nx
import matplotlib.pyplot as plt

# Previously added data
# Define a list of airports with their coordinates (latitude, longitude)
airports = {
    'JFK': (40.6413, -73.7781),
    'LAX': (34.052235, -118.243683),
    'ORD': (41.9742, -87.9073),
    'DFW': (32.8998, -97.0403),
    'DEN': (39.8561, -104.6737),
}

def haversine(lat1, lon1, lat2, lon2):
    '''
    Haversine function to calculate distance between two points in the earth
    '''
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.asin(math.sqrt(a))
    km = 6371 * c
    return km

def create_graph(airports):
    '''
    Function that will create the networkx graph, create the edges between different
    airports and connect them
    '''
    # Create a graph
    G = nx.Graph()

    # Add nodes (airports)
    for airport in airports.keys():
        G.add_node(airport)

    # Add edges (distances between airports)
    for airport1 in airports.keys():
        for airport2 in airports.keys():
            if airport1 != airport2:
                coords1 = airports[airport1]
                coords2 = airports[airport2]
                distance = haversine(coords1[0], coords1[1], coords2[0], coords2[1])
                G.add_edge(airport1, airport2, weight=distance)

    return G

def find_shortest_path(G, source, target):
    '''
    Function to find and print the shortest path between two airports
    which are treated as nodes from the graph with a certain label (airport code)
    '''
    try:
        shortest_path = nx.shortest_path(G, source=source, target=target, weight='weight')
        shortest_path_length = nx.shortest_path_length(G, source=source, target=target, weight='weight')
        print(f"The shortest path from {source} to {target}: {shortest_path}")
        print(f"The length of the shortest path: {shortest_path_length} km")
        return shortest_path, shortest_path_length
    except nx.NetworkXNoPath:
        print(f"No path found between {source} and {target}.")
        return None, None

def simulate_disruption(G, disrupted_edge):
    print(f"\nDisruption in the path: {disrupted_edge}")
    G.remove_edge(*disrupted_edge)

def create_path_points(airports, path):
    '''
    Function that creates a list of the coordinates that the aircraft will have to
    go through
    '''

    path_points = []
    for i in path:
        path_points.append(airports[i])

    return path_points

def find_path(flight_info):
    '''
    Function that will be called when the simulation button
    is triggered. 
    Then the path between departure airport and arrival airport will be found 
    taking into account any disruptions that may appear 

    Returns:
    - path_points = [(lat, long), (lat,long) ...] -> List of tuples
                    with the lat and long coordinates for each of the points 
                    that will determine the final route
    '''

    # 1. Check if the selected airports are in the airports list and 
    # add them if not
    new_airports = {flight_info["dep_code"] : flight_info["dep_loc"],
                    flight_info["arr_code"] : flight_info["arr_loc"]}
    
    for airport in new_airports.keys():
        if airport not in airports.keys():
            airports[airport] = new_airports[airport]

    # 2. Create the graph and the edges between airports
    G = create_graph(airports)

    # 3. Include a disruption between our source and end airports
    simulate_disruption(G, (flight_info["dep_code"], flight_info["arr_code"]))

    # 4. Find the shortest path between the departure and arrival airports
    shortest_path, shortest_path_length = find_shortest_path(G, flight_info["dep_code"], flight_info["arr_code"])

    # 5. Return the coordinates for this new path points so the simulator can
    # follow the new directions
    path_points = create_path_points(airports, shortest_path)

    return path_points

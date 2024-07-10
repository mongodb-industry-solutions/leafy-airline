import math
import networkx as nx
import matplotlib.pyplot as plt

# Haversine function to calculate distance
def haversine(lat1, lon1, lat2, lon2):
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.asin(math.sqrt(a))
    km = 6371 * c
    return km

# Define a list of airports with their coordinates (latitude, longitude)
airports = {
    'JFK': (40.6413, -73.7781),
    'LAX': (34.052235, -118.243683),
    'ORD': (41.9742, -87.9073),
    'DFW': (32.8998, -97.0403),
    'DEN': (39.8561, -104.6737),
}

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

# Function to find and print the shortest path
def find_shortest_path(G, source, target):
    try:
        shortest_path = nx.shortest_path(G, source=source, target=target, weight='weight')
        shortest_path_length = nx.shortest_path_length(G, source=source, target=target, weight='weight')
        print(f"The shortest path from {source} to {target}: {shortest_path}")
        print(f"The length of the shortest path: {shortest_path_length} km")
        return shortest_path, shortest_path_length
    except nx.NetworkXNoPath:
        print(f"No path found between {source} and {target}.")
        return None, None

# Simulate a disruption
def simulate_disruption(G, disrupted_edge):
    print(f"\nDisruption in the path: {disrupted_edge}")
    G.remove_edge(*disrupted_edge)

# Main function to execute the optimization
def main():
    # Initial shortest path
    source = 'JFK'
    target = 'LAX'
    print("Initial shortest path:")
    find_shortest_path(G, source, target)

    # Simulate a disruption
    disrupted_edge = ('JFK', 'LAX')
    simulate_disruption(G, disrupted_edge)

    # New shortest path after disruption
    print("\nShortest path after disruption:")
    find_shortest_path(G, source, target)

    # Draw the graph
    pos = nx.spring_layout(G)
    plt.figure(figsize=(10, 7))
    nx.draw(G, pos, with_labels=True, node_size=700, node_color="skyblue", font_size=10, font_color="black")
    labels = nx.get_edge_attributes(G, 'weight')
    nx.draw_networkx_edge_labels(G, pos, edge_labels=labels)
    plt.title("Airline Network with Disruption")
    plt.show()

if __name__ == "__main__":
    main()

import json
import networkx as nx
import matplotlib.pyplot as plt

# The JSON data provided
json_data = '''
[your JSON data here]
'''

# Function to recursively parse the JSON and add nodes and edges to the graph
def add_nodes_edges(graph, parent_name, json_dict):
    for child in json_dict.get('children', []):
        # Create a unique name for the child using its properties
        child_name = f"{child.get('renderInfo', {}).get('mesh', 'None')}_{id(child)}"
        # Add the child node and an edge from the parent to this child
        graph.add_node(child_name, label=child_name)
        graph.add_edge(parent_name, child_name)
        # Recursively process the children of this node
        add_nodes_edges(graph, child_name, child)

# Parse the JSON data
data = json.loads(json_data)

# Initialize a directed graph
G = nx.DiGraph()

# Start with the root node
root_name = 'root'
G.add_node(root_name, label=root_name)

# Recursively add nodes and edges
add_nodes_edges(G, root_name, data['root'])

# Draw the graph
pos = nx.spring_layout(G)  # positions for all nodes
nx.draw(G, pos, with_labels=True, node_size=2000, node_color="skyblue", font_size=10)
plt.show()

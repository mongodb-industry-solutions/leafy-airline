# Leafy Air - Real-Time Flight Management Platform

Leafy Air is an **event-driven, microservice-based platform** designed to optimize airline operations through real-time data processing and predictive analytics. The system enables airlines to proactively manage flight disruptions, minimize delay propagation, and improve passenger satisfaction.

Built on **Google Cloud Platform**, the architecture integrates **Pub/Sub, Cloud Functions, Cloud Run, MongoDB, and Vertex AI** to deliver scalable, responsive, and intelligent flight management. Real-time telemetry and operational data flow seamlessly through the system, triggering automated analytics, cost calculations, and route adjustments in response to dynamic flight conditions.

By leveraging machine learning and event-driven design, Leafy Air provides airlines with the agility and insight needed to enhance operational efficiency and resilience in an unpredictable environment.


![image](https://github.com/user-attachments/assets/9d932c22-db0c-425e-aeaf-852aa3fe9cd7)

## Features

- **Real-time Flight Data:** Get instant updates on flight statuses, including delays and cancellations.
- **Efficient Flight Management:** Add, edit, and manage flights through an intuitive interface.
- **Delay Handling:** Automated system to handle and notify users of flight delays.
- **MongoDB Integration:** Scalable and flexible database management for storing flight data.
- **Google Cloud Platform:** Deploy and scale your application using GCP services like Cloud Run.


## Getting Started : Fast Setup Instructions

### *Prerequisites*

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)
- [MongoDB](https://www.mongodb.com/) (local or cloud)
- [Next.js](https://nextjs.org/) (v12 or later)
- [Google Cloud SDK](https://cloud.google.com/sdk)

To check if Node.js and Next.js are correctly installed, use the following commands on your terminal. If the output is a version number, you correctly installed both resources.

```bash
npm --version
node --version
```

---

### *Step 1 : Github Repository and environment setup*

Open your preferred IDE and create a new terminal. Navigate through your files into the directory in which you want to begin the setup process and follow these simple steps:

**Clone the repository:**

   Execute the following command to clone the Leafy Air repository:

   ```bash
   git clone https://github.com/mongodb-industry-solutions/leafy_airline/
   ```

**Set up environment variables:**

   Create a `.env.local` file in the root directory and add the following variables:

   ```bash
   <!-- MongoDB Credentials / Data -->
   MONGO_URI=your-mongodb-connection-string
   MONGODB_DB=your-mongodb-database-name

   <!-- GCP API Keys -->
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   SIMULATION_APP_URL=localhost:8000
   SIMULATED_MODE=true
   ```

   Now, navigate to the `backend/microservices/simulation_app` directory and create a `.env.local` file there as well. Add the following variables:

   ```bash
   MONGO_URI=your-mongodb-connection-string
   MONGODB_DB=your-mongodb-database-name
   ```

**Add variables to makefile:**

   Open the `Makefile` located in the root directory and replace the following variables with your own values:

   ```Makefile
   MONGO_URI=your-mongodb-connection-string
   MONGODB_DB=your-mongodb-database-name
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   SIMULATION_APP_URL=localhost:8000
   SIMULATED_MODE=true
   ```


---
### *Step 2: Container Setup*  

There are **3 different ways** to set up the containers for the application, depending on your preferences and needs. In this section we will explain how to choose the best option for you and how to set it up.


### Option 1: Local Docker Container Deployment (Recommended)
This option is recommended for local testing and development. It allows you to run the application in isolated containers on your local machine using Docker. It will not require any GCP resources to be used, therefore, it is the fastest and most efficient way to get the app running.

<!-- Highlight -->
> **Important:** 
> This option is specifically used for simulated mode. Therefore, the environment variable `SIMULATED_MODE` must be set to `true` in both the `.env.local` file and the `Makefile`.

1. Open Docker in your machine and ensure it is running.

2. In your terminal, navigate to the root directory of the cloned repository and run the following commands:

```bash
make seed-local       # seed local DB with initial data - only needed once
make build            # build and run containers
```

3. Access the application at `http://localhost:3000`.

4. To stop and clean up the containers, use the following commands:
```bash
make stop             # stop containers
make clean            # down containers, remove images & volumes
```



### Option 2: Local Manual Setup (Without Docker)
This option is for users who prefer to set up the application manually without using Docker. It requires installing all dependencies and running the application directly on your local machine.

1. In your terminal, navigate to the root directory of the cloned repository.

2. Backend Setup:
   - Navigate to the `backend/simulation_app` directory:
     ```bash
     cd backend/simulation_app
     ```
   - Install dependencies:
     ```bash
     pip install -r requirements.txt
     ```
   - Start the backend server:
     ```bash
     fastapi dev main.py
     ```

3. Frontend Setup:
   - Open a new terminal window and navigate to the `frontend-dashboard` directory:
     ```bash
     cd frontend-dashboard
     ```
   - Install dependencies:
     ```bash
       npm install
       ```
   - Start the frontend server:
     ```bash
     npm run dev
     ```
4. Access the application dashboard at `http://localhost:3000`.



> **Important:**
>
>This option can be used for both simulated and non-simulated modes. Therefore, the environment variable `SIMULATED_MODE` can be set to either `true` or `false` in both the `.env.local` file and the `Makefile`, depending on your preference.
>
> If you choose to run in non-simulated mode, ensure that you have your GCP resources set up as described in the [GCP Integration](./README_GCP.md) file.




### Option 3: Full GCP Cloud Run Deployment

This option is for users who want to deploy the application on Google Cloud Platform using Cloud Run. It allows for scalable and managed deployment of the application in the cloud. However, this option requires a GCP account and may incur costs based on usage.

1. Follow the steps in the [GCP Integration](./README_GCP.md) file to set up your GCP project and resources.
2. Once you have created your project, replace these placeholders in the [Makefile](./Makefile) with your own values:

```Makefile
PROJECT_ID=your-gcp-project-id
REGION=your-gcp-region
BACKEND_IMAGE=your-backend-image-name
FRONTEND_IMAGE=your-frontend-image-name
```

3. Execute the following command in your terminal to build and deploy the application to Cloud Run:

```bash
make cloud-all
```

As a result, the application will be deployed to Cloud Run, and you will receive a URL to access it. Both the frontend and backend services will be hosted on Cloud Run as separate services , which can be reviewed and managed through the GCP Console.






## Architecture and benefits

Leafy Air is built on an **event-driven microservice architecture** that enables real-time, scalable, and intelligent flight management. The system processes live operational, telemetry, and analytical data streams to detect disruptions, calculate new routes, and assess cost and performance impacts instantly.  

### Core Components
- **Pub/Sub** – Backbone for asynchronous, decoupled communication between microservices, ensuring reliable and real-time event delivery.  
- **Cloud Functions** – React to specific data events, automating ingestion, transformation, and aggregation tasks without manual infrastructure management.  
- **Cloud Run Microservices** – Host the **Real-Time Data Simulator** and **Path Finder**, providing modular and containerized services for scalable flight simulation and route recalculation.  
- **MongoDB** – Stores both static and time-series flight data, supporting flexible schema design and high-throughput aggregation for real-time insights and analytics.  
- **Vertex AI** – Powers advanced predictive modeling (e.g., cost estimation and disruption forecasting), enhancing proactive operational decision-making.  
- **Google Maps API** – Integrates geospatial visualization and route tracking for enhanced situational awareness.  

### Data Flow
1. **Telemetry and flight data** are published as events via Pub/Sub.  
2. **Cloud Functions** process incoming data and trigger operational or analytical workflows.  
3. **Cloud Run microservices** handle real-time simulation and route adjustment.  
4. **MongoDB** captures operational and analytical data for reporting and monitoring.  
5. **Vertex AI** continuously learns from data patterns to improve predictions and recommendations.  

### Benefits
- ⚡ **Real-Time Responsiveness** – Immediate reaction to disruptions through asynchronous event handling.  
- ☁️ **Scalability & Flexibility** – Modular microservices scale independently to meet demand.  
- 🤖 **Operational Intelligence** – AI-driven analytics reduce costs and enhance decision-making.  
- 🧩 **Reliability** – Decoupled architecture ensures continuous operation even during component failures.  





## Conclusion

Congratulations! You have successfully set up and deployed the Leafy Air application. You can now explore its features and functionalities to manage flights in real-time.

Once all services are running, you can access the Leafy Air dashboard by navigating to `http://localhost:3000` in your web browser (or the Cloud Run URL if deployed on GCP). It should look similar to the screenshots below:

![Screenshot 2024-08-23 at 15 35 22](https://github.com/user-attachments/assets/cfcec7f3-e591-4933-849d-bbba10e9fc94)
![Screenshot 2024-08-23 at 15 36 56](https://github.com/user-attachments/assets/ddaede1d-5b05-46e0-9a5b-fef12fb20d23)




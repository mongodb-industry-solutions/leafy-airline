# Leafy Air: A Flight Management App

This is a **Next.js** application integrated with **MongoDB** and deployed using **Google Cloud Platform (GCP)** services. The app is designed to efficiently manage flights, focusing on real-time data updates to handle flight delays and other critical events.
![image](https://github.com/user-attachments/assets/9d932c22-db0c-425e-aeaf-852aa3fe9cd7)

## Features

- **Real-time Flight Data:** Get instant updates on flight statuses, including delays and cancellations.
- **Efficient Flight Management:** Add, edit, and manage flights through an intuitive interface.
- **Delay Handling:** Automated system to handle and notify users of flight delays.
- **MongoDB Integration:** Scalable and flexible database management for storing flight data.
- **Google Cloud Platform:** Deploy and scale your application using GCP services like Cloud Run.


## Getting Started - Local Deployment

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


<!-- Include division -->
---

<!-- ### First steps :  -->
### *Step 1 : Github Repository*

To begin your journey, open your preferred IDE and create a new terminal. Then navigate through your files into the directory in which you want to begin the setup process and where you would like to locate the project. Once you are located in your preferred directory, follow these simple steps:

1. **Clone the repository and browse to the dashboard directory:**

   ```bash
   git clone https://github.com/mongodb-industry-solutions/leafy_airline/
   cd airplanedashboard
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env.local` file in the root directory and add the following variables:

   ```bash
   <!-- MongoDB Credentials / Data -->
   MONGODB_URI=your-mongodb-connection-string
   MONGODB_DB=your-mongodb-database-name

   <!-- GCP API Keys -->
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   NEXT_PUBLIC_SIMULATION_APP_URL=your-simulation-app-url
   ```

   Take into account these variables should not be included between "" or any other symbol. Also, don't worry if you still don't have the API keys, we will explain to you how to get them in following sections.

<!-- 4. **Run the development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to see the app. -->

Now that you already have your local repository, let's begin setting up microservices and your GCP project.

---
### *Step 2: MongoDB Integration*  
  
This app uses MongoDB to store flight data and handle real-time updates. You can connect to a local MongoDB instance or a cloud database (e.g., MongoDB Atlas).  
  
To create the database with all the needed collections and documents, you can use the provided `mongo-seed.js` script located in the root folder of the project.  
  
#### **Steps to set up the MongoDB database:**  
  
1. **Install MongoDB and dependencies**:  
  
   Ensure you have MongoDB installed and running locally or connected to a cloud-based MongoDB instance (such as MongoDB Atlas). Next, install the required dependency for the seed script:  
     
   ```bash  
   npm install mongodb  
   ```

   This will install the MongoDB driver necessary for the script to interact with the database.  
  
2. **Run the seed script**:  
  
   Make sure your MongoDB server is running locally or reachable via a connection string. Then, execute the following command in your terminal:  
  
   ```bash  
   node mongo-seed.js  
   ```  
  
   This script will create a database named `flightDB` with the necessary collections and sample data:  
   - `flight_costs`  
   - `flight_plane_simulation`  
   - `flight_realtime` (a time series collection)  
   - `flights`  
  
3. **Verify the data**:  
  
   Use a MongoDB client (like MongoDB Compass or the MongoDB shell) to connect to your database and verify that the collections and documents have been created successfully. Open the database `flightDB` and inspect the collections; you should find the seeded sample data.  
  
4. **Update your connection settings**:  
  
   Ensure that the connection information in your application’s `.env.local` file matches your MongoDB setup. If you're using MongoDB Atlas or another cloud database, update your connection string accordingly.  
  
   Example of a `.env.local` file:  
  
   ```plaintext  
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/flightDB?retryWrites=true&w=majority  
   MONGODB_DB=flightDB  
   ```  
  
   Make sure to replace `<username>` and `<password>` with your actual MongoDB credentials.  
  
#### **Helpful Tips**:  
- If using MongoDB Compass, verify that the database and collections have been created by navigating to the database `flightDB`.  
- Test your connection by running queries against the seeded collections to ensure your application can interact with the database.  
  
With the database set up, your application is ready to store and manage flight data efficiently!  

---

### *Step 3 : GCP Integration*

#### What will you be using Google Cloud Services for?

- **Cloud Run:** Deploy the app as a containerized service on Cloud Run.
- **Google Cloud Build:** Automatically build and deploy your app using Cloud Build triggers.
- **Cloud Storage:** Store static assets and other files.

After you cloned your repo, you will need to complete the following steps to set GCP up:

### Project Setup

1. **Create your project:**

   Go to the [Google Cloud Console](https://console.cloud.google.com/) and create a new project.

2. **Enable Required APIs:**

   Once you have created your project, navigate to the "APIs & Services" section on the menu located on the left part of your Project Console. Then, use the "Enable APIs and services" button to enable the following APIs:

   - Cloud Run Admin API
   - Cloud Build API
   - Clound Functions API
   - Cloud Pub/Sub API
   - Artifact Registry API
   - Maps JavaScript API
   - Secret Manager API
   - Dataform API
   - Compute Engine API
   - Notebooks API
   - Vertex AI API
   - Cloud Storage (optional for storing assets)

3. **Obtain your API keys**

   On the left bar on the "API & Services" tab, navigate to Credentials and click on "Create credentials -> API Keys"
   Rename this key to your preference and copy its value on the .env file we asked you to create on the root folder. This will be the "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" constant

4. **Install Google Cloud SDK:**

   Now follow the instructions to install the [Google Cloud SDK](https://cloud.google.com/sdk).

5. **Authenticate with GCP:**

   Open the command prompt and authenticate your local environment with your GCP account:

   ```bash
   gcloud auth login
   ```

   Set your project:

   ```bash
   gcloud config set project your-gcp-project-id
   ```

### Integrations

Now that you have created your project in GCP, lets configure come of the vital parts of this project. The plane simulation runs due to the application's integrations with GCP services such as Cloud Functions, Vertex AI, and Pub/Sub topics. Follow the next steps to set up these services:

####  *Pub/Sub Topic*

This demo manages data by using PubSub topics to distribute the data between the different microservices. Consequently, setting up the neccessary PubSub topics is crucial for this deployment to work correctly.

The demo works using 2 main topics:

- **Real-time data topic**:

  This topic will manage the plane simulated data (or real plane data if available). This data should be published in the topic in real-time , as it will be used for analytical purposes in the application.

- **Application data topic**:

  This topic will manage the application data for route and disruption status, which are static for mostly all the flight (minus minor changes or optimization). This data should be the published only when it is altered rather than every second.

To set up both topics , *follow these steps for each of them*:

1. Navigate to the **GCP Console**.
2. Access the **Navigation Menu** on the left side of the tab and go to **Pub/Sub**. You can also search for this service in the searchbar located on top of this same tab.
3. Click **Create Topic** and include your desired configuration

Now, your new topic should be created. You can check by accessing **Pub/Sub** -> **Topics** and reviewing the topics list.

At this point, a default subscription should have also been automatically created for the topic. You can decide to keep this default subscription or either create a new one by clicking the desired topic in the list and then cliking **Create Subscription**

At least one subscription must be created for each topic in order to set PubSub integrations correctly.

**_Integral connection to the app_**

Now that the topics and subscriptions are created, you will have to take some things into account to correctly set all GCP integrations:

1. Ensure that your data source publishes data correctly in both topics
2. Create Cloud Functions triggered by messages in the topics by following the steps in the **Cloud Functions** section

#### *Vertex AI Model*

The Vertex AI model is responsible for producing the analytical data required by your application. Follow these steps to train and deploy the model:

1. **Training the Model**:

   - Navigate to the **GCP Console**.
   - Go to **Vertex AI** -> **Colab Enterprise**.
   - Use the notebook available in the repository at `microservices/notebooks/published_leafyAirline_MLmodel.ipynb` to train and upload the model to the model registry.

2. **Deploying the Model**:

   - Follow the [Vertex AI deployment guide](https://cloud.google.com/vertex-ai/docs/general/deployment) to deploy the model to an endpoint.
   - Once deployed, the model will be ready to receive input data and provide predictions.

3. **Integrating with Cloud Functions**:
   - Set up a Cloud Function to send input data to the deployed Vertex AI model and receive predictions.
   - The predictions can then be written into a MongoDB collection for further use.

#### *Cloud Functions*

The Cloud Functions are responsible for handling the data flow between your application, Pub/Sub topic, the Vertex AI model, and MongoDB. Follow these steps to configure the Cloud Functions:

**Cloud Function #1: Data Ingestion and Prediction (Analytical Data Flow)**

1. **Create the Cloud Function**:

   - In the **GCP Console** search bar, type `Cloud Run functions`.
   - Click on **Create Function** on the top bar. This will take you to the Configuration page.

2. **Configure the Trigger**:

   - Select **Trigger type** as `Cloud Pub/Sub`.
   - This configuration will trigger the Cloud Function whenever a message is published to the specified Pub/Sub topic.

3. **Set Environment Variables**:

   - Set the following environment variables:
     - `MONGO_DATABASE`
     - `MONGO_COLLECTION`
   - Optionally, add `MONGO_URI` as an environment variable, though it is recommended to store it as a Secret. Follow the [Secret Manager guide](https://cloud.google.com/functions/docs/configuring/secrets) to create a secret for `MONGO_URI`.

4. **Deploy the Cloud Function**:
   - Click **Next** to proceed to the code section.
   - Choose `Python` as the runtime language.
   - Introduce the code from the repository, found in the `microservices/cloud_functions/analyticalDataCF` directory.
     - **Important** : Include both main.py and requirements.txt
   - Click **Deploy** and wait for the function to build and deploy.

Once these steps are completed, your Cloud Function will be able to send data to the Vertex AI model, receive predictions, and store them in a MongoDB collection.

**Cloud Function #2: Real-time Telemetry data**

This service will be in charge of processing real-time continuous data published in the specified Pub/Sub topic. To set it up follow the next steps:

1. **Create the Cloud Function**:

   - In the **GCP Console** search bar, type `Cloud Run functions`.
   - Click on **Create Function** on the top bar. This will take you to the Configuration page.

2. **Configure the Trigger**:

   - Select **Trigger type** as `Cloud Pub/Sub`.
   - This configuration will trigger the Cloud Function whenever a message is published to the specified Pub/Sub topic. (It is important that the topic selection aligns with it's use, not all topics with the same data or same purpose)

3. **Set Environment Variables**:

   - Set the following environment variables:
     - `MONGO_DATABASE`
     - `MONGO_COLLECTION`
   - Optionally, add `MONGO_URI` as an environment variable, though it is recommended to store it as a Secret. Follow the [Secret Manager guide](https://cloud.google.com/functions/docs/configuring/secrets) to create a secret for `MONGO_URI`.

4. **Deploy the Cloud Function**:
   - Click **Next** to proceed to the code section.
   - Choose `Python` as the runtime language.
   - Introduce the code from the repository, found in the `microservices/cloud_functions/telemetryDataCF` directory.
     - **Important** : Include both main.py and requirements.txt
   - Click **Deploy** and wait for the function to build and deploy.

**Cloud Function #3: Application Data**

This service will be in charge of processing application data such as new route and disruption location. This data will only be published in the specified Pub/Sub topic when a change occurs, whilst other topics use a real-time continuous data publishing approach. To set it up follow the next steps:

1. **Create the Cloud Function**:

   - In the **GCP Console** search bar, type `Cloud Run functions`.
   - Click on **Create Function** on the top bar. This will take you to the Configuration page.

2. **Configure the Trigger**:

   - Select **Trigger type** as `Cloud Pub/Sub`.
   - This configuration will trigger the Cloud Function whenever a message is published to the specified Pub/Sub topic (It is important that the topic selection aligns with it's use, not all topics with the same data or same purpose)

3. **Set Environment Variables**:

   - Set the following environment variables:
     - `MONGO_DATABASE`
     - `MONGO_COLLECTION`
   - Optionally, add `MONGO_URI` as an environment variable, though it is recommended to store it as a Secret. Follow the [Secret Manager guide](https://cloud.google.com/functions/docs/configuring/secrets) to create a secret for `MONGO_URI`.

4. **Deploy the Cloud Function**:
   - Click **Next** to proceed to the code section.
   - Choose `Python` as the runtime language.
   - Introduce the code from the repository, found in the `microservices/cloud_functions/applicationDataCF` directory.
     - **Important** : Include both main.py and requirements.txt
   - Click **Deploy** and wait for the function to build and deploy.

<!-- 
6. **Dockerize Your App:**

   Create a `Dockerfile` in the root of your project:

   ```Dockerfile
   # Use an official Node.js runtime as a parent image
   FROM node:14

   # Set the working directory in the container
   WORKDIR /usr/src/app

   # Copy the package.json and install dependencies
   COPY package*.json ./
   RUN npm install

   # Copy the rest of the application code
   COPY . .

   # Build the Next.js app
   RUN npm run build

   # Expose the port the app runs on
   EXPOSE 8080

   # Command to run the app
   CMD ["npm", "start"]
   ```

6. **Build and Deploy with Cloud Run:**

   Use Cloud Build to build and deploy your app to Cloud Run:

   ```bash
   gcloud builds submit --tag gcr.io/your-gcp-project-id/flight-management-app
   ```

   Deploy the container image to Cloud Run:

   ```bash
   gcloud run deploy flight-management-app --image gcr.io/your-gcp-project-id/flight-management-app --platform managed --region your-region --allow-unauthenticated
   ```

7. **Access Your App:**

   Once deployed, Cloud Run will provide a URL to access your app. Open it in your browser to see the deployed version. -->

<!-- ## Usage

- **Add Flights:** Navigate to the flight management section to add new flights.
- **Update Flight Status:** Real-time updates allow users to modify flight statuses, including delays.
- **View Flight Information:** Users can view detailed information about each flight.
- **Receive Notifications:** Set up notifications to alert users of flight delays. -->


--- 

### *Step 4: Data simulation*

The last step required to fully enjoy this demo requires setting up the plane data simulation app. Follow these nexts steps to do so:

1. **Open new window and browse**

   Firstly, open a new window of your preferred IDE, open the project you just cloned and navigate to the **"simulation app"** directory (included in the microservices folder).

2. **Set up environment variables:**

   Create a `.env.local` file in the root directory and add the following variables:

     ```bash
     <!-- ORIGINS: Routes from which the simulation app will get requested data -->
   ORIGINS = ["your-local-app-url","your-cloud-app-url"]

   <!-- GCP Variables -->
   PROJECT_ID = "your-GCP-project-id"
   DATA_TOPIC_ID = "your-data-topic-name"
   PATH_TOPIC_ID = "your-path-topic-name"
   ```
   The last three variables can be found on the Console and Pub/Sub tab in your GCP project, therefore, make sure to follow the previous steps regarding GCP Integration to be sure you are able to access every needed value.

3. **Install required resources**

   Create a new terminal, browse to the simulation app directory and install all dependencies running:
   ```bash
   pip install -r requirements.txt
   ```


4. **Run the app**

   Finally, use the same terminal to run the following command and start the simulation app:

   ```bash
   fastapi dev main.py
   ```


--- 
<!-- 
## Deployment

To deploy this application, GCP's Cloud Run is recommended for its ability to scale containerized applications automatically. Follow the instructions in the [GCP Integration](#gcp-integration) section to set up and deploy your app. -->


## In the end your app should look like this:

![Screenshot 2024-08-23 at 15 35 22](https://github.com/user-attachments/assets/cfcec7f3-e591-4933-849d-bbba10e9fc94)
![Screenshot 2024-08-23 at 15 36 56](https://github.com/user-attachments/assets/ddaede1d-5b05-46e0-9a5b-fef12fb20d23)

---

**Happy Coding!** ✈️

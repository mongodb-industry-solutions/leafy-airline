# Leafy Air: A Flight Management App

This is a **Next.js** application integrated with **MongoDB** and deployed using **Google Cloud Platform (GCP)** services. The app is designed to efficiently manage flights, focusing on real-time data updates to handle flight delays and other critical events.
![Screenshot 2024-08-22 at 12 59 22](https://github.com/user-attachments/assets/121b7deb-0cd1-452c-a810-184d09522595)


## Features

- **Real-time Flight Data:** Get instant updates on flight statuses, including delays and cancellations.
- **Efficient Flight Management:** Add, edit, and manage flights through an intuitive interface.
- **Delay Handling:** Automated system to handle and notify users of flight delays.
- **MongoDB Integration:** Scalable and flexible database management for storing flight data.
- **Google Cloud Platform:** Deploy and scale your application using GCP services like Cloud Run.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)
- [MongoDB](https://www.mongodb.com/) (local or cloud)
- [Next.js](https://nextjs.org/) (v12 or later)
- [Google Cloud SDK](https://cloud.google.com/sdk)

### Installation

First open your preferred IDE and create a new terminal. Then navigate through your files into the directory in which you want to begin the setup process. 
1. **Clone the repository:**

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
    MONGODB_URI=your-mongodb-connection-string
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
    MONGODB_DB=your-mongodb-database
    NEXT_PUBLIC_API_URL=your-next-api-url
    GOOGLE_APPLICATION_CREDENTIALS=your-google-application-credentials
    ```

4. **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## GCP Integration

### Using Google Cloud Services

- **Cloud Run:** Deploy the app as a containerized service on Cloud Run.
- **Google Cloud Build:** Automatically build and deploy your app using Cloud Build triggers.
- **Cloud Storage:** Store static assets and other files.

### Setting Up GCP

1. **Create a GCP Project:**
   
   Go to the [Google Cloud Console](https://console.cloud.google.com/) and create a new project.

2. **Enable Required APIs:**

    Enable the following APIs in your GCP project:

    - Cloud Run
    - Cloud Build
    - Container Registry
    - Cloud Storage (optional for storing assets)

3. **Install Google Cloud SDK:**

    Follow the instructions to install the [Google Cloud SDK](https://cloud.google.com/sdk).

4. **Authenticate with GCP:**

    Authenticate your local environment with your GCP account:

    ```bash
    gcloud auth login
    ```

    Set your project:

    ```bash
    gcloud config set project your-gcp-project-id
    ```

5. **Dockerize Your App:**

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

   Once deployed, Cloud Run will provide a URL to access your app. Open it in your browser to see the deployed version.

## Usage

- **Add Flights:** Navigate to the flight management section to add new flights.
- **Update Flight Status:** Real-time updates allow users to modify flight statuses, including delays.
- **View Flight Information:** Users can view detailed information about each flight.
- **Receive Notifications:** Set up notifications to alert users of flight delays.

## MongoDB Integration

This app uses MongoDB for storing flight data. You can connect to a local MongoDB instance or a cloud database (e.g., MongoDB Atlas). Ensure your connection string is correctly set in the `.env.local` file.

### Example Model

Here’s an example of a Mongoose model used for storing flight information:

```javascript
const mongoose = require('mongoose');

const FlightSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  dep_time: { type: Date, required: true },
  arr_time: { type: Date, required: true },
  dep_arp: { type: Object, required: true }, // Departure airport details
  arr_arp: { type: Object, required: true }, // Arrival airport details
  airline: { type: String, required: true },
  plane: { type: String, required: true },
  ui_telemetry: { type: Object, required: true }, // UI telemetry data
  flight_number: { type: String, required: true },
  disruption_coords: { type: Object }, // Coordinates related to any disruptions
  initial_path: { type: Array, required: true }, // Initial flight path
  new_path: { type: Array }, // New path in case of re-routing
}, { timestamps: true });

module.exports = mongoose.models.Flight || mongoose.model('Flight', FlightSchema);

```

## Deployment

To deploy this application, GCP's Cloud Run is recommended for its ability to scale containerized applications automatically. Follow the instructions in the [GCP Integration](#gcp-integration) section to set up and deploy your app.

## Integrations

The plane simulation runs due to the application's integrations with GCP services such as Cloud Functions, Vertex AI, and Pub/Sub. Review how you can set up each integration:

### Pub/Sub Topic

This demo manages data by using PubSub topics to distribute the data between the different microservices. Consequently, setting up the neccessary PubSub topics is crucial for this deployment to work correctly.

The demo works using 2 main topics:

* **Real-time data topic**:

  This topic will manage the plane simulated data (or real plane data if available). This data should be published in the topic in real-time , as it will be used for analytical purposes in the application.
  
* **Application data topic**:

  This topic will manage the application data for route and disruption status, which are static for mostly all the flight (minus minor changes or optimization). This data should be the published only when it is altered rather than every second.

To set up both topics , follow these steps for each of them:

1. Navigate to the **GCP Console**.
2. Access the **Navigation Menu** on the left side of the tab and go to **Pub/Sub**. You can also search for this service in the searchbar located on top of this same tab.
3. Click **Create Topic** and include your desired configuration

Now, your new topic should be created. You can check by accessing **Pub/Sub** -> **Topics** and reviewing the topics list. 

At this point, a default subscription should have also been automatically created for the topic. You can decide to keep this default subscription or either create a new one by clicking the desired topic in the list and then cliking **Create Subscription**

At least one subscription must be created for each topic in order to set PubSub integrations correctly.

***Integral connection to the app***

Now that the topics and subscriptions are created, you will have to take some things into account to correctly set all GCP integrations:

1. Ensure that your data source publishes data correctly in both topics
2. Create Cloud Functions triggered by messages in the topics by following the steps in the **Cloud Functions** section


### Vertex AI Model

The Vertex AI model is responsible for producing the analytical data required by your application. Follow these steps to train and deploy the model:

1. **Training the Model**:
   - Navigate to the **GCP Console**.
   - Go to **Vertex AI** -> **Colab Enterprise**.
   - Use the notebook available in the repository at `notebooks/published_leafyAirline_MLmodel.ipynb` to train and upload the model to the model registry.

2. **Deploying the Model**:
   - Follow the [Vertex AI deployment guide](https://cloud.google.com/vertex-ai/docs/general/deployment) to deploy the model to an endpoint.
   - Once deployed, the model will be ready to receive input data and provide predictions.

3. **Integrating with Cloud Functions**:
   - Set up a Cloud Function to send input data to the deployed Vertex AI model and receive predictions.
   - The predictions can then be written into a MongoDB collection for further use.

### Cloud Functions

The Cloud Functions are responsible for handling the data flow between your application, Pub/Sub topic, the Vertex AI model, and MongoDB. Follow these steps to configure the Cloud Functions:

#### Cloud Function #1: Data Ingestion and Prediction (Analytical Data Flow)

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
   - Introduce the code from the repository, found in the `cloud_functions/analyticalDataCF` directory.
       * **Important** : Include both main.py and requirements.txt
   - Click **Deploy** and wait for the function to build and deploy.

Once these steps are completed, your Cloud Function will be able to send data to the Vertex AI model, receive predictions, and store them in a MongoDB collection.

#### Cloud Function #2: Real-time Telemetry data

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
   - Introduce the code from the repository, found in the `cloud_functions/telemetryDataCF` directory.
        * **Important** : Include both main.py and requirements.txt
   - Click **Deploy** and wait for the function to build and deploy.

#### Cloud Function #3: Application Data

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
   - Introduce the code from the repository, found in the `cloud_functions/applicationDataCF` directory. 
       * **Important** : Include both main.py and requirements.txt
   - Click **Deploy** and wait for the function to build and deploy.


## In the end your app should look like this:
![Screenshot 2024-08-23 at 15 35 22](https://github.com/user-attachments/assets/cfcec7f3-e591-4933-849d-bbba10e9fc94)
![Screenshot 2024-08-23 at 15 36 56](https://github.com/user-attachments/assets/ddaede1d-5b05-46e0-9a5b-fef12fb20d23)



---

**Happy Coding!** ✈️

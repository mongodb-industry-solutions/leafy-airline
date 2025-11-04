# ☁️ Google Cloud Project Configuration

This guide explains how to configure **Google Cloud Platform (GCP)** to deploy and run the **Leafy Air** application using managed cloud services.

These configuration steps are only required if you plan to deploy the application on GCP or if want to deploy locally using the non-simulated mode (that requires GCP services to be set up).


## Project Setup

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


## Integrations

Now that you have created your project in GCP, lets configure come of the vital parts of this project. The plane simulation runs due to the application's integrations with GCP services such as Cloud Functions, Vertex AI, and Pub/Sub topics. Follow the next steps to set up these services:


###  *Pub/Sub Topic*

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


--- 

### *Vertex AI Model*

The Vertex AI model is responsible for producing the analytical data required by your application. Follow these steps to train and deploy the model:

1. **Training the Model**:

   - Navigate to the **GCP Console**.
   - Go to **Vertex AI** -> **Colab Enterprise**.
   - Use the notebook available in the repository at `backend/notebooks/published_leafyAirline_MLmodel.ipynb` to train and upload the model to the model registry.

2. **Deploying the Model**:

   - Follow the [Vertex AI deployment guide](https://cloud.google.com/vertex-ai/docs/general/deployment) to deploy the model to an endpoint.
   - Once deployed, the model will be ready to receive input data and provide predictions.

3. **Integrating with Cloud Functions**:
   - Set up a Cloud Function to send input data to the deployed Vertex AI model and receive predictions.
   - The predictions can then be written into a MongoDB collection for further use.


--- 

### *Cloud Functions*

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
     - `MONGO_DATABASE = your_database_name`
     - `MONGO_COLLECTION = flight_costs1` (or the name of your desired collection)
   - Optionally, add `MONGO_URI` as an environment variable, though it is recommended to store it as a Secret. Follow the [Secret Manager guide](https://cloud.google.com/functions/docs/configuring/secrets) to create a secret for `MONGO_URI`.

4. **Deploy the Cloud Function**:
   - Click **Next** to proceed to the code section.
   - Choose `Python` as the runtime language.
   - Introduce the code from the repository, found in the `backend/cloud_functions/analyticalDataCF` directory.
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
     - `MONGO_DATABASE = your_database_name`
     - `MONGO_COLLECTION = flight_realtimeCF` (or the name of your desired collection)
   - Optionally, add `MONGO_URI` as an environment variable, though it is recommended to store it as a Secret. Follow the [Secret Manager guide](https://cloud.google.com/functions/docs/configuring/secrets) to create a secret for `MONGO_URI`.

4. **Deploy the Cloud Function**:
   - Click **Next** to proceed to the code section.
   - Choose `Python` as the runtime language.
   - Introduce the code from the repository, found in the `backend/cloud_functions/telemetryDataCF` directory.
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
     - `MONGO_DATABASE = your_database_name`
     - `MONGO_COLLECTION = flights` (or the name of your desired collection)
   - Optionally, add `MONGO_URI` as an environment variable, though it is recommended to store it as a Secret. Follow the [Secret Manager guide](https://cloud.google.com/functions/docs/configuring/secrets) to create a secret for `MONGO_URI`.

4. **Deploy the Cloud Function**:
   - Click **Next** to proceed to the code section.
   - Choose `Python` as the runtime language.
   - Introduce the code from the repository, found in the `backend/cloud_functions/applicationDataCF` directory.
     - **Important** : Include both main.py and requirements.txt
   - Click **Deploy** and wait for the function to build and deploy.





## Deploying to Cloud Run

Now that you have set up your GCP project and configured the necessary services, you can deploy the Leafy Air application to Cloud Run. Follow the steps in the [README.md](./README.md) file to build and deploy the application using the provided `Makefile` commands.


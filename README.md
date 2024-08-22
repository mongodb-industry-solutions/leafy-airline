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

## In the end your app should look like this:
<img width="1511" alt="Screenshot 2024-08-22 at 14 29 29" src="https://github.com/user-attachments/assets/b47abccb-d662-4fde-a5b8-5edd3b3883d1">
<img width="1511" alt="Screenshot 2024-08-22 at 14 29 45" src="https://github.com/user-attachments/assets/f2bed2e3-a98e-463b-82c4-1996d08f39d6">

---

**Happy Coding!** ✈️

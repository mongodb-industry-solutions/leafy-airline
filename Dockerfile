# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY leafy_airline/airplanedashboard/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY leafy_airline/airplanedashboard/ .

# Expose the port the app runs on
EXPOSE 8080

# Run the application
CMD [ "node", "index.js" ]

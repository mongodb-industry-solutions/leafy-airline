# Use the official Node.js image with the required version.
FROM node:18.18

# Set the working directory.
WORKDIR /usr/src/app


# Copy application dependency manifests to the container image.
COPY /airplanedashboard/package*.json ./

ARG NEXT_PUBLIC_SIMULATION_APP_URL
ENV NEXT_PUBLIC_SIMULATION_APP_URL=$NEXT_PUBLIC_SIMULATION_APP_URL

# Install dependencies.
RUN npm install

# Copy the rest of the application code to the working directory.
COPY airplanedashboard/ .

# Build the app.
RUN npm run build

# Environment variable for port.
ENV PORT=8081

# Tell Docker about the port we'll run on.
EXPOSE 8081

# Run the web service on container startup.
CMD ["npm", "start"]

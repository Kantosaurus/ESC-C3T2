FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy everything to the container
COPY . .
# Install dependencies
RUN npm install

# Build the project
RUN npm run build

CMD ["npm", "start"]


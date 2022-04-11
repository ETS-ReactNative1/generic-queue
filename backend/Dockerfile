#  Dockerfile for Node Express Backend

FROM node:16-alpine

# Create App Directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
RUN chmod 777 .

# Install Dependencies
COPY package*.json ./

RUN npm install --silent

# Copy app source code
COPY . .

# Exports
EXPOSE 3030

CMD ["npm","start"]
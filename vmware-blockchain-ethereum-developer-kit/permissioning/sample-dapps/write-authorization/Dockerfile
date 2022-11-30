FROM athena-docker-local.artifactory.eng.vmware.com/node:16.18.1 as node

# Create the app directory and copy all the required files
WORKDIR /app
COPY . .

# Install dependencies
RUN npm install --registry=http://build-artifactory.eng.vmware.com:80/artifactory/api/npm/npm

# Run the write tests using port 8000
EXPOSE 8000
CMD [ "node", "testWrite.js" ]
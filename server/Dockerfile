FROM node:18-alpine As build

WORKDIR /app

COPY package*.json ./

# Run the build command which creates the production bundle
RUN npm i

COPY . .

RUN npm install -g @nestjs/cli
RUN npm run build

# Set NODE_ENV environment variable
ENV NODE_ENV production

USER node

###################
# PRODUCTION
###################

FROM node:18-alpine As production

WORKDIR /app

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /app /app

RUN npm ci --omit=dev && npm cache clean --force

EXPOSE 8080

# Start the server using the production build
CMD [ "npm", "run", "start:prod" ]

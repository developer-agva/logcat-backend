FROM node:16.18.0-alpine
RUN npm install -g nodemon
WORKDIR /src
ADD package*.json ./
RUN npm install
COPY . .
CMD ["node", "index.js"]
# WORKDIR /app
# COPY . .
# RUN npm install
# EXPOSE 8000
# CMD [ "npm","start" ]


FROM nodered/node-red

WORKDIR /usr/src/node-red

COPY package.json .

# COPY settings.js /data/settings.js
# COPY flows_cred.json /data/flows_cred.json
# COPY flows.json /data /flows.json

RUN npm install --unsafe-perm --no-update-notifier --no-fund --only=production
RUN npm install node-red-contrib-actionflows node-red-contrib-xstate-machine
RUN npm install node-red-contrib-camerapi

RUN npm install node-red-node-pi-gpio node-red-contrib-browser-utils node-red-contrib-media-utils
RUN npm install node-red-contrib-bt-presence 

RUN npm install install node-red-contrib-json-multi-schema node-red-contrib-chronos
RUN npm install node-red-contrib-googlehome node-red-contrib-play-audio node-red-contrib-micropi
RUN npm install node-red-contrib-ical-events node-red-contrib-google-oauth-calendar

RUN npm install prokolyvakis/node-red-contrib-sparql node-red-contrib-graphql

RUN npm install node-red-dashboard node-red-contrib-web-worldmap node-red-contrib-boolean-logic-ultimate

RUN npm install node-red-contrib-image-tools node-red-contrib-image-output node-red-contrib-browser-utils node-red-contrib-media-utils
RUN npm install node-red-contrib-home-assistant-websocket

ENTRYPOINT "npm --no-update-notifier --no-fund start --cache /data/.npm -- --userDir /data"


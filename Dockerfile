FROM node:alpine
RUN mkdir /var/nodeapp
WORKDIR /var/nodeapp
ADD . /var/nodeapp
RUN npm install
EXPOSE 3000
CMD npm start

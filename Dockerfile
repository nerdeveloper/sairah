FROM node:alpine
WORKDIR /app/
COPY . .
RUN npm install
EXPOSE 3000
ENV NODE_ENV=production
RUN yarn build
CMD [ "node", "server.js" ]
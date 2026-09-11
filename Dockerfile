FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json
COPY package-lock.json ./
COPY server/package-lock.json ./server/package-lock.json
COPY client/package-lock.json ./client/package-lock.json
RUN npm install
RUN cd server && npm install
RUN cd client && npm install
COPY . .
RUN cd client && npm run build
EXPOSE 5000
CMD ["npm", "run", "dev"]

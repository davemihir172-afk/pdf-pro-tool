FROM node:20-alpine
WORKDIR /app

COPY package*.json .npmrc ./
COPY apps ./apps
COPY packages ./packages
COPY prisma ./prisma
COPY infra ./infra

RUN npm install
RUN npm run build

EXPOSE 3000 4000
CMD ["npm", "start"]

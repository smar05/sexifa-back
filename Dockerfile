# Etapa de compilación
FROM node:20.0.0 as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa de producción
FROM node:20.0.0
WORKDIR /app
COPY --from=builder /app/build ./build
COPY package*.json ./
RUN npm install --only=production
EXPOSE 8080
CMD ["node", "build/index.js"]
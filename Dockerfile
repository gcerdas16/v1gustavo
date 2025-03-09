# Etapa 1: Construcción (builder)
FROM node:21-alpine3.18 AS builder


# Habilitar Corepack y preparar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

ENV PNPM_HOME=/usr/local/bin


# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json pnpm-lock.yaml ./


# Instalar git para dependencias que lo requieran
RUN apk add --no-cache git


# Instalar PM2 globalmente usando pnpm
RUN pnpm install pm2 -g


# Copiar todo el código fuente al contenedor
COPY . .

# Instalar dependencias (incluye devDependencies para compilar)
RUN pnpm install

# ******Compilar el código TypeScript usando Rollup (asegúrate de tener el script "build" en package.json)
RUN pnpm run build


# Create a new stage for deployment
FROM builder AS deploy


# ******Establecer el directorio de trabajo
WORKDIR /app

# Copiar únicamente la carpeta compilada y archivos necesarios para producción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./


# Instalar dependencias de producción (sin devDependencies)
RUN pnpm install --frozen-lockfile --production


# Iniciar la aplicación usando PM2, apuntando al archivo compilado en la carpeta dist
CMD ["pm2-runtime", "start", "./dist/app.js", "--cron", "0 */12 * * *"]

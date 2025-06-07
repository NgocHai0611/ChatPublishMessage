FROM node:18

WORKDIR /app/SeverChatApp

# Copy package files và cài đặt
COPY package.json . 
COPY prisma ./prisma
RUN npm install

# Generate Prisma client sau khi install
RUN npx prisma generate

# Copy toàn bộ mã nguồn
COPY . .

EXPOSE 3000

CMD ["npm", "start"]

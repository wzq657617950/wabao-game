# 使用 Node.js 20 官方镜像作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和相关文件
COPY package*.json ./

# 安装所有依赖（包含开发依赖，用于构建）
RUN npm install

# 复制项目所有文件
COPY . .

# 构建前端项目 (Vite React)
RUN npm run build

# 暴露 80 端口（微信云托管默认端口）
EXPOSE 80

# 启动 Express 服务器
CMD ["node", "server.js"]

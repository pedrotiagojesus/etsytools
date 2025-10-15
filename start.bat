@echo off
echo Instalar dependencias...
call npm i

echo Iniciar servidor de desenvolvimento...
start http://localhost:5173
call npm run dev

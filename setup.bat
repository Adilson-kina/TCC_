@echo off
echo ================================
echo 🔧 Iniciando Apache e MySQL (XAMPP)
echo ================================

start "" "C:\xampp\apache_start.bat"
start "" "C:\xampp\mysql_start.bat"

echo ================================
echo 🗃️ Executando script SQL no MySQL
echo ================================
cd C:\xampp\mysql\bin
mysql -u root < "%~dp0setup.sql"

cd %~dp0

echo ================================
echo 📦 Instalando dependências do backend (Composer)
echo ================================
composer install

echo ================================
echo 📦 Instalando dependências do frontend (npm)
echo ================================
npm install

echo ================================
echo 🚀 Iniciando o servidor React Native
echo ================================
npm start
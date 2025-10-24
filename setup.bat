@echo off
setlocal

echo ================================
echo (1) Iniciando Apache e MySQL (XAMPP)...
echo ================================

start "" "C:\xampp\apache_start.bat"
start "" "C:\xampp\mysql_start.bat"

REM Aguarda alguns segundos para garantir que os serviços iniciem
timeout /t 5 >nul

echo.
echo ================================
echo (2) Executando script SQL no MySQL...
echo ================================

cd /d "C:\xampp\mysql\bin"
mysql -u root < "%~dp0/SQL/SQL.sql"
IF %ERRORLEVEL% NEQ 0 (
    echo Erro ao executar o script SQL. Continuando...
)

echo.
echo ================================
echo (2.1) Importando dados da TACO...
echo ================================

php "%~dp0SQL\import.php"
IF %ERRORLEVEL% NEQ 0 (
    echo Erro ao importar os dados da TACO. Continuando...
)

cd /d "%~dp0"

echo.
echo ================================
echo (3) Instalando Composer...
echo ================================
call composer install
IF %ERRORLEVEL% NEQ 0 (
    echo Erro ao instalar o Composer.
    goto :erro
)

echo ================================
echo (4) Instalando pacotes do projeto...
echo ================================
call npm install
IF %ERRORLEVEL% NEQ 0 (
    echo Erro ao instalar o NPM.
    goto :erro
)

goto :sucesso

:sucesso
echo.
echo ================================
echo SETUP FINALIZADO!
echo ================================

echo.
echo ================================
echo (5) Iniciando o servidor do NPM...
echo ================================
call npm start

goto :fim

:fim
exit /b

:erro
echo.
echo ================================
echo HOUVE UM ERRO. FECHANDO O SETUP...
echo ================================
pause
exit /b
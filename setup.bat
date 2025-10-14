@echo off
setlocal

echo ================================
echo Iniciando Apache e MySQL (XAMPP)
echo ================================

start "" "C:\xampp\apache_start.bat"
start "" "C:\xampp\mysql_start.bat"

REM Aguarda alguns segundos para garantir que os serviços iniciem
timeout /t 5 >nul

echo.
echo ================================
echo Executando script SQL no MySQL
echo ================================

cd /d "C:\xampp\mysql\bin"
mysql -u root < "%~dp0/SQL/SQL.sql"
IF %ERRORLEVEL% NEQ 0 (
    echo Erro ao executar o script SQL. Continuando...
)

cd /d "%~dp0"

echo.
echo ================================
echo Instalando Composer 
echo ================================
call composer install
IF %ERRORLEVEL% NEQ 0 (
    echo Erro ao instalar o Composer.
    goto :erro
)

echo.
echo ================================
echo Instalando NPM
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
echo Setup finalizado com sucesso!
echo ================================
exit /b

echo.
echo ================================
echo Iniciando o servidor do NPM
echo ================================
call npm start
IF %ERRORLEVEL% NEQ 0 (
    echo Erro ao iniciar o servidor do NPM.
    goto :erro
)

:erro
echo.
echo ================================
echo O setup encontrou um erro e foi interrompido.
echo ================================
pause
exit /b
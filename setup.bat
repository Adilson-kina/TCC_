@echo off
setlocal

echo ================================
echo Iniciando Apache e MySQL (XAMPP)
echo ================================

start "" "C:\xampp\apache_start.bat"
start "" "C:\xampp\mysql_start.bat"

REM Aguarda alguns segundos para garantir que os serviços iniciem
timeout /t 5 >nul

echo Executando script SQL no MySQL
echo ================================

cd /d "C:\xampp\mysql\bin"
mysql -u root < "%~dp0/SQL/SQL.sql"
IF %ERRORLEVEL% NEQ 0 (
    echo Erro ao executar o script SQL.
    goto :erro
)

cd /d "%~dp0"

echo Instalando Composer 
echo ================================
call composer install
IF %ERRORLEVEL% NEQ 0 (
    echo Erro ao instalar o Composer.
    goto :erro
)

echo Instalando NPM
echo ================================
call npm install
IF %ERRORLEVEL% NEQ 0 (
    echo Erro ao instalar o NPM.
    goto :erro
)

echo Iniciando o servidor do NPM
echo ================================
call npm start
IF %ERRORLEVEL% NEQ 0 (
    echo Erro ao iniciar o servidor do NPM.
    goto :erro
)

goto :sucesso

:erro
echo.
echo ================================
echo O setup encontrou um erro e foi interrompido.
echo ================================
pause
exit /b

:sucesso
echo.
echo ================================
echo Setup concluído com sucesso!
echo ================================
pause
exit /b
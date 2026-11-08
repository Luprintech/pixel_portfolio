@echo off
rem Arranca backend y frontend en local y deja la web visible desde el movil
rem por la red Wi-Fi. Doble clic para ejecutarlo; cierra cada pestana para parar.
setlocal
cd /d "%~dp0"

rem Sin backend\.env el servidor se cierra al arrancar (exige JWT_SECRET,
rem CMS_USERNAME y CMS_PASSWORD), asi que se avisa antes de abrir nada.
if not exist "backend\.env" (
  echo Falta backend\.env. Copia backend\.env.example a backend\.env y rellenalo.
  pause
  exit /b 1
)

rem Dependencias: solo se instalan la primera vez en cada carpeta.
if not exist "backend\node_modules" (
  echo Instalando dependencias del backend...
  pushd backend
  call npm install
  popd
)
if not exist "frontend\node_modules" (
  echo Instalando dependencias del frontend...
  pushd frontend
  call npm install
  popd
)

rem Con Windows Terminal, backend y frontend se abren como dos pestanas de la
rem misma ventana. Si no esta instalado, cada uno usa su propia ventana de cmd.
rem --host abre Vite a la red local para poder entrar desde el movil.
where wt >nul 2>&1
if %errorlevel%==0 (
  wt new-tab --title Backend -d "%~dp0backend" cmd /k npm start ; new-tab --title Frontend -d "%~dp0frontend" cmd /k npm run dev -- --host
) else (
  start "Backend" /d "%~dp0backend" cmd /k npm start
  start "Frontend" /d "%~dp0frontend" cmd /k npm run dev -- --host
)

echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Desde el movil (misma red Wi-Fi):
powershell -NoProfile -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like '192.168.*' -or $_.IPAddress -like '10.*' } | ForEach-Object { '  http://' + $_.IPAddress + ':5173' }"
echo.
pause

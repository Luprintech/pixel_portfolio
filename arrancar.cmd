@echo off
rem Arranca backend y frontend en local y deja la web visible desde el movil
rem por la red Wi-Fi. Doble clic para ejecutarlo; cierra cada pestana para parar.
setlocal
cd /d "%~dp0"

rem Tercera pestana: solo muestra las direcciones para el movil. El propio
rem script se vuelve a llamar con este argumento.
if "%~1"=="movil" goto movil

rem Sin backend\.env el servidor se cierra al arrancar (exige JWT_SECRET,
rem CMS_USERNAME y CMS_PASSWORD), asi que se avisa antes de abrir nada.
if not exist "backend\.env" (
  echo Falta backend\.env. Copia backend\.env.example a backend\.env y rellenalo.
  pause
  exit /b 1
)

rem Si algun servidor ya esta escuchando no se lanza otra vez: evita procesos
rem duplicados y el error de puerto ocupado.
netstat -ano | findstr /R /C:":3000 .*LISTENING" >nul && set "hayBackend=1"
netstat -ano | findstr /R /C:":5173 .*LISTENING" >nul && set "hayFrontend=1"
if defined hayBackend if defined hayFrontend (
  echo Backend y frontend ya estan en marcha. No se lanza nada mas.
  echo Para volver a ver las direcciones del movil: arrancar.cmd movil
  pause
  exit /b 0
)
if defined hayBackend echo El backend ya esta en marcha: solo se lanza el frontend.
if defined hayFrontend echo El frontend ya esta en marcha: solo se lanza el backend.

rem El backend espera PostgreSQL en 127.0.0.1:5432 y, si no lo encuentra, se
rem cierra tras ~30 s sin servir nada. Se usa un contenedor propio de desarrollo
rem (con los datos de backend\.env) porque el docker-compose del repo no publica
rem el puerto 5432 en el equipo.
if defined hayBackend goto bdlista
netstat -ano | findstr /R /C:":5432 .*LISTENING" >nul && goto bdlista
docker info >nul 2>&1 || goto sindocker
:arrancabd
for /f "usebackq tokens=1,* delims==" %%a in (`findstr /B /C:"PGUSER=" /C:"PGPASSWORD=" /C:"PGDATABASE=" "backend\.env"`) do set "%%a=%%b"
echo Arrancando PostgreSQL de desarrollo (contenedor luprin-dev-db)...
docker start luprin-dev-db >nul 2>&1 && goto esperabd
docker run -d --name luprin-dev-db -p 127.0.0.1:5432:5432 -e POSTGRES_USER=%PGUSER% -e POSTGRES_PASSWORD=%PGPASSWORD% -e POSTGRES_DB=%PGDATABASE% -v luprin_dev_pgdata:/var/lib/postgresql/data postgres:16-alpine >nul
:esperabd
docker ps -q -f name=luprin-dev-db | findstr . >nul || (
  echo No se pudo arrancar el contenedor luprin-dev-db. Revisa Docker Desktop.
  pause
  exit /b 1
)
docker exec luprin-dev-db pg_isready -U %PGUSER% >nul 2>&1 && goto bdlista
timeout /t 2 /nobreak >nul
goto esperabd

:sindocker
rem Docker Desktop no esta en marcha: se abre y se espera (hasta 3 min) a que
rem el motor responda antes de seguir.
set "dockerExe="
if exist "%LOCALAPPDATA%\Programs\DockerDesktop\frontend\Docker Desktop.exe" set "dockerExe=%LOCALAPPDATA%\Programs\DockerDesktop\frontend\Docker Desktop.exe"
if not defined dockerExe if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" set "dockerExe=%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
if not defined dockerExe goto nodocker
echo Docker Desktop no esta en marcha. Abriendolo, puede tardar un minuto...
start "" "%dockerExe%"
set /a intentos=0
:esperadocker
docker info >nul 2>&1 && goto arrancabd
set /a intentos+=1
if %intentos% geq 60 goto nodocker
timeout /t 3 /nobreak >nul
goto esperadocker

:nodocker
echo No hay PostgreSQL en el puerto 5432 y no se ha podido abrir Docker Desktop.
echo Abrelo a mano, espera a que arranque y vuelve a ejecutar este script.
pause
exit /b 1

:bdlista

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

rem Con Windows Terminal se abren dos ventanas: una con backend y frontend en
rem pestanas y otra, aparte, con las direcciones para el movil. Si no esta
rem instalado, cada servicio usa su propia ventana de cmd.
rem --host abre Vite a la red local para poder entrar desde el movil.
rem Nada de bloques entre parentesis aqui: dentro de un bloque %variable% se
rem expande al leerlo entero, no al ejecutarlo, y el comando salia vacio.
rem Las rutas de -d acaban en "." y no en "\": una barra antes de la comilla
rem final escapa la comilla y Windows Terminal rompe la linea de comandos.
where wt >nul 2>&1 || goto sinwt
set hayPestana=
set cmdWt=wt -w new
if defined hayBackend goto sinback
set cmdWt=%cmdWt% new-tab --title Backend -d "%~dp0backend" cmd /k npm start
set hayPestana=1
:sinback
if defined hayFrontend goto sinfront
if defined hayPestana set cmdWt=%cmdWt% ;
set cmdWt=%cmdWt% new-tab --title Frontend -d "%~dp0frontend" cmd /k npm run dev -- --host
set hayPestana=1
:sinfront
if defined hayPestana %cmdWt%
wt -w new new-tab --title Movil -d "%~dp0." cmd /k call .\%~nx0 movil
if errorlevel 1 pause
exit /b 0

:sinwt
if not defined hayBackend  start "Backend" /d "%~dp0backend" cmd /k npm start
if not defined hayFrontend start "Frontend" /d "%~dp0frontend" cmd /k npm run dev -- --host
start "Movil" /d "%~dp0" cmd /k call .\%~nx0 movil
exit /b 0

:movil
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Desde el movil (misma red Wi-Fi):
powershell -NoProfile -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like '192.168.*' -or $_.IPAddress -like '10.*' } | ForEach-Object { '  http://' + $_.IPAddress + ':5173' }"
echo.
exit /b 0




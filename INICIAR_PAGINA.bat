@echo off
setlocal EnableExtensions

title INICIAR_PAGINA - Mercado Veiga API
cd /d "%~dp0"

set "NODE_VERSION=22.12.0"
set "NODE_ARCH=x64"
if /I "%PROCESSOR_ARCHITECTURE%"=="ARM64" set "NODE_ARCH=arm64"
if /I "%PROCESSOR_ARCHITEW6432%"=="ARM64" set "NODE_ARCH=arm64"
set "LOCAL_NODE_DIR=%~dp0.tools\node-v%NODE_VERSION%-win-%NODE_ARCH%"

echo.
echo ==========================================
echo   INICIAR_PAGINA - Mercado Veiga API
echo ==========================================
echo.

set "NEED_LOCAL_NODE="
where node >nul 2>nul
if errorlevel 1 (
  set "NEED_LOCAL_NODE=1"
)

if not defined NEED_LOCAL_NODE (
  node -e "const [major, minor] = process.versions.node.split('.').map(Number); const ok = (major === 20 && minor >= 19) || (major === 22 && minor >= 12) || major > 22; process.exit(ok ? 0 : 1)" >nul 2>nul
  if errorlevel 1 set "NEED_LOCAL_NODE=1"
)

if defined NEED_LOCAL_NODE (
  echo Node.js 20.19+ nao encontrado. Preparando Node.js portatil %NODE_VERSION%...
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\ensure-node.ps1" -Version "%NODE_VERSION%"
  if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao preparar o Node.js portatil.
    echo Verifique sua conexao com a internet e execute novamente.
    echo.
    pause
    exit /b 1
  )
  set "PATH=%LOCAL_NODE_DIR%;%PATH%"
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  if exist "%LOCAL_NODE_DIR%\npm.cmd" set "PATH=%LOCAL_NODE_DIR%;%PATH%"
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo [ERRO] npm nao encontrado.
  echo Instale o Node.js com npm e execute novamente.
  echo.
  pause
  exit /b 1
)

if not exist "package.json" (
  echo [ERRO] package.json nao encontrado.
  echo Execute este arquivo dentro da pasta do projeto.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Dependencias nao encontradas. Instalando com npm install...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao instalar dependencias.
    pause
    exit /b 1
  )
  echo.
)

if not defined PORT set "PORT=3333"

echo Preparando site para abrir no navegador...
call npm.cmd run build
if errorlevel 1 (
  echo.
  echo [ERRO] Falha ao preparar o site.
  pause
  exit /b 1
)
echo.

echo Site e API local:
echo   http://localhost:%PORT%
echo.
echo Possiveis enderecos para outra maquina na mesma rede:
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /R /C:"IPv4"') do (
  for /f "tokens=* delims= " %%B in ("%%A") do echo   http://%%B:%PORT%
)
echo.
echo Se outra maquina nao acessar, libere a porta %PORT% no firewall do Windows.
echo Pressione Ctrl+C ou feche esta janela para parar o site e a API.
echo.

call npm.cmd start

set "EXIT_CODE=%ERRORLEVEL%"
echo.
echo Site e API encerrados com codigo %EXIT_CODE%.
pause
exit /b %EXIT_CODE%

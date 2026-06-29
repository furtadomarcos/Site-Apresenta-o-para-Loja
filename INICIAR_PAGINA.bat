@echo off
setlocal EnableExtensions

title INICIAR_PAGINA - Mercado Veiga API
cd /d "%~dp0"

echo.
echo ==========================================
echo   INICIAR_PAGINA - Mercado Veiga API
echo ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado.
  echo Instale o Node.js 20 ou superior e execute novamente.
  echo https://nodejs.org/
  echo.
  pause
  exit /b 1
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

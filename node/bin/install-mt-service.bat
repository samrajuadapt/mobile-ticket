@echo off
IF NOT "%1"=="am_admin" (powershell start -verb runas '%0' am_admin & exit /b)
SET CURRENT=%~dp0
echo %CURRENT%
cd /D %CURRENT%

IF NOT EXIST "C:\Program Files\nodejs\node.exe" (
echo "Error! cannot locate C:\Program Files\nodejs\node.exe"
 goto FAIL
)
nssm install "Qmatic Mobile Ticket" "C:\Program Files\nodejs\node.exe" || goto FAIL
nssm set "Qmatic Mobile Ticket" AppDirectory "%CURRENT%\.." || goto FAIL
nssm set "Qmatic Mobile Ticket" AppParameters "%CURRENT%\..\server.js" || goto FAIL
nssm set "Qmatic Mobile Ticket" Start SERVICE_AUTO_START || goto FAIL
nssm start "Qmatic Mobile Ticket" || goto FAIL

:SUCCESS
echo service successfully installed.
PAUSE
goto :EOF

:FAIL
echo service installation failed.
PAUSE
goto :EOF




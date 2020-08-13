@echo off
IF NOT "%1"=="am_admin" (powershell start -verb runas '%0' am_admin & exit /b)
SET CURRENT=%~dp0
echo %CURRENT%
cd /D %CURRENT%

nssm stop "Qmatic Mobile Ticket" || goto FAIL
nssm remove "Qmatic Mobile Ticket" confirm || goto FAIL

:SUCCESS
echo service successfully uninstalled.
PAUSE
goto :EOF

:FAIL
echo service uninstallation failed.
PAUSE
goto :EOF




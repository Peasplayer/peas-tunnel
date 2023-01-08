@echo off
title Building Peas-Tunnel-Client

echo Installing packages...
call npm install

echo.
echo Installing pkg for packaging...
call npm install pkg -g

echo.
echo Running build...
call pkg . -o ./build/Peas-Tunnel-Client

echo.
echo Done!

pause
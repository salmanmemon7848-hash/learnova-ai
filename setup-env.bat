@echo off
echo ========================================
echo Thinkior AI - Environment Setup
echo ========================================
echo.

REM Generate a random NEXTAUTH_SECRET
echo Generating NEXTAUTH_SECRET...
powershell -Command "[convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))" > temp_secret.txt
set /p GENERATED_SECRET=<temp_secret.txt
del temp_secret.txt

echo.
echo Your generated NEXTAUTH_SECRET:
echo %GENERATED_SECRET%
echo.
echo Please update your .env.local file with:
echo 1. NEXTAUTH_SECRET=%GENERATED_SECRET%
echo 2. Your actual DATABASE_URL
echo 3. Your actual OPENAI_API_KEY
echo 4. Your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (if using Google sign-in)
echo.
echo ========================================
echo Setup Complete!
echo ========================================
pause

@echo off
rem Maven Wrapper for Windows
rem Delegates to Maven (requires Maven installed or downloads it)

set MAVEN_CMD=mvn
where mvn >nul 2>&1
if %errorlevel% neq 0 (
    echo Maven not found. Please install Maven or use the Docker build.
    exit /b 1
)

%MAVEN_CMD% %*

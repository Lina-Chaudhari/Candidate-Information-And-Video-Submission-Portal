# Candidate Portal

React frontend + Express backend + MongoDB (GridFS). Multi-step candidate form with resume + video upload.

## Repo layout
- `/frontend` — React app (Bootstrap)
- `/backend` — Express API, Mongoose, GridFS

## Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Git

## Backend env
Create `backend/.env`:
```
PORT=4000
MONGO_URI=mongodb://localhost:27017/candidate_portal
```

## Install
Open two terminals.

Backend:
```powershell
cd C:\Lina\candidate-portal\backend
npm install
```

Frontend:
```powershell
cd C:\Lina\candidate-portal\frontend
npm install
```

## Run
Terminal A (backend):
```powershell
cd C:\Lina\candidate-portal\backend
npm run dev   # or node index.js
```

Terminal B (frontend):
```powershell
cd C:\Lina\candidate-portal\frontend
npm start
```

Frontend: http://localhost:3000  
Backend: http://localhost:4000

Note: add `"proxy": "http://localhost:4000"` to `frontend/package.json` or use full backend URLs.

## API quick tests (PowerShell)
Upload resume:
```powershell
curl -X POST http://localhost:4000/api/candidates/upload-resume -F "resume=@C:\path\to\resume.pdf"
```

Submit candidate + video:
```powershell
curl -X POST http://localhost:4000/api/candidates/submit `
  -F "firstName=Jane" -F "lastName=Doe" -F "positionAppliedFor=Engineer" `
  -F "currentPosition=Dev" -F "experience=5" -F "resumeId=<resumeFileId>" `
  -F "video=@C:\path\to\video.webm"
```

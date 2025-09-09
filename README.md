# Inkwire Vector CMS

**Inkwire Vector CMS** is a frontend project built with **React, Vite, TypeScript, and shadcn UI**.

---

## Project Structure

Inkwire-Vector-CMS/
├─ frontend/ # React + Vite + TypeScript frontend

---

## Prerequisites

- Node.js (v18+ recommended)
- npm (comes with Node.js) or Yarn
- Git

---

## Getting Started

### 1. Clone the repository  
    - git clone https://github.com/Harsh6637/Inkwire-mvp.git
    - cd Inkwire-mvp/frontend

### 2. Install dependencies
```
    npm install
    # or
    yarn install
```

### 3. Run the development server
```
    npm run dev
    # or
    yarn dev
```
Open http://localhost:5173 in your browser.

4. Build and Preview Production
bash
Copy code
npm run build
npm run preview
# or
yarn build
yarn preview
Usage
Login:
Use the following hardcoded credentials for testing:

java
Copy code
UserName: admin@inkwire.co
Password: P@$$word123
Credentials are stored in local storage under inkwire_user and remain until manually removed.

Dashboard:

Upload files (PDF, TXT, MD, DOC, DOCX) stored in session storage (resets on restart).

Preview and remove uploaded files.

File size limited by session storage (max in MBs).

Chat Box:

Preview, download, and remove files.

Search documents by file name, tags provided during upload, or any substring of the file name.

Dependencies
Frontend: React, Vite, TypeScript, shadcn UI, TailwindCSS, lucide-react, react-hook-form, react-router-dom

Dev Tools: ESLint, PostCSS, TailwindCSS, TypeScript, Vite
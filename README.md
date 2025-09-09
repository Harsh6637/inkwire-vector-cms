# Inkwire Vector CMS

**Inkwire Vector CMS** is a frontend project built with **React**, **Vite**, **TypeScript**, and **shadcn/ui**. It provides a lightweight interface for document upload, preview, and search, optimized for session-based workflows.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- npm (comes with Node.js) or [Yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Harsh6637/inkwire-vector-cms.git
cd inkwire-vector-cms
``` 

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. Run the development server
```bash 
npm run dev
# or
yarn dev
```
Open http://localhost:3000 in your browser.

### 4. Build and Preview Production
```bash
npm run build
npm run preview
# or
yarn build
yarn preview
```

## Usage

### Login:  
- Use the following hardcoded credentials for testing:
  - UserName: admin@inkwire.co
  - Password: P@$$word123
  Credentials are stored in local storage under inkwire_user and remain until manually removed.

### Dashboard:

- Upload files (PDF, TXT, MD, DOC, DOCX) stored in session storage (resets on restart).

  - Preview and remove uploaded files.  
    - File size limited by session storage (max in MBs).

- Chat Box: 
  - Preview, download, and remove files. 
  - Search documents by 
    - File name
    - Tags (provided during upload) 
    - Any substring of the file name.

### Dependencies
  - Frontend: React, Vite, TypeScript, shadcn UI, TailwindCSS, lucide-react, react-hook-form, react-router-dom 
  - Dev Tools: ESLint, PostCSS, TailwindCSS, TypeScript, Vite
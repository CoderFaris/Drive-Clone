# DriveV2

A web-based drive clone application built using modern web technologies.  This project allows users to store and manage their files in a cloud-like environment.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)

## Introduction

This project is a personal drive clone, developed to demonstrate my skills in full-stack web development using the T3 Stack.  It provides users with the ability to create folders, upload files, and manage their data. It's inspired by Google Drive (keyword: Inspired, not the same. Google Drive is much more complex).

## Features

- **Authentication:** Secure user registration and login powered by Clerk.
- **File Management:**
    - Folder creation and deletion.
    - File uploading and deletion via Uploadthing.
    - File sizes up to 1GB and up to 9999 files 
    - All File types are supported
- **Data Storage:** Utilizing SingleStore as the primary database.
- **Analytics:** Basic usage analytics tracking with PostHog.

## Technologies Used

- **Frontend:** React
- **Backend:** TypeScript, Next.js
- **ORM:** Drizzle ORM
- **Database:** SingleStore
- **File Storage:** Uploadthing
- **Authentication:** Clerk
- **Analytics:** PostHog
- **Hosting:** Netlify

## Installation

1. Clone the repository
2. Navigate to the project directory: `cd drive-clone`
3. Install dependencies: `npm install` or `yarn install` or `pnpm install`
4. `.env` file is needed, refer to the `.env.example` and instead of example keys generate your own from the services that are listed 
6. Run the development server: `npm run dev` or `yarn dev` or `pnpm dev`

## Usage

You can try it out on:
1. https://drive-v2.netlify.app/

Development:
1. Visit `http://localhost:PORTNUMBER`
2. Create an account or log in using Clerk (Google OAuth).
3. Start creating folders and uploading files.



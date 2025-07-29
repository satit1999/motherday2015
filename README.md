# Satit Udomseuksa School - Mother's Day Event Confirmation

This web application provides a form for parents to confirm their attendance for the Mother's Day 2025 event at Satit Udomseuksa School.

## Technology Stack

- **Framework:** React
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (via CDN)
- **Backend:** Google Apps Script (connected to Google Sheets)

## Setup and Local Development

To run this project on your local machine, you need to have [Node.js](https://nodejs.org/) and npm installed.

1.  **Clone the repository:**
    Get the code from your GitHub repository onto your computer.

2.  **Install dependencies:**
    This command will download all the necessary packages like React and Vite. Open a terminal in the project folder and run:
    ```bash
    npm install
    ```

3.  **Run the development server:**
    This will start a local server, usually at `http://localhost:5173`. The website will automatically reload when you make changes to the code.
    ```bash
    npm run dev
    ```

## Deployment (Recommended: Vercel)

The easiest and fastest way to deploy this project is by using **Vercel**.

1.  **Push your code to a GitHub repository.** If you haven't, create one on GitHub and push your project files.

2.  **Connect your GitHub repository to Vercel:**
    - Sign up for a free account at [vercel.com](https://vercel.com) (it's recommended to sign up with your GitHub account).
    - On your Vercel dashboard, click "Add New..." -> "Project".
    - Find and import your project's repository from GitHub.
    - Vercel will automatically detect that this is a Vite project and set up the build configuration for you. No changes are needed.

3.  **Deploy:**
    - Simply click the **"Deploy"** button.
    - Vercel will build and deploy your site, providing you with a live URL (e.g., `your-project.vercel.app`). Any future pushes to your GitHub repository will automatically trigger a new deployment.

### Backend Configuration

The form submissions are handled by a **Google Apps Script** linked to a Google Sheet.

- **IMPORTANT:** For the form to work on the live website, you must ensure the `SCRIPT_URL` variable in the `src/constants.ts` file is the correct "Web app" URL you received after deploying your Google Apps Script. If this URL is a placeholder, the form submission and attendance check will fail.

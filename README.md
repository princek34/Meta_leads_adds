# Meta Leads Ads Dashboard

A lightweight dashboard that brings your project overview and live Meta (Facebook and Instagram) lead data together in one place. New leads are displayed in real time on the existing dashboard UI, so your team can monitor lead flow without switching between tools or manually refreshing pages.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Security Notes](#security-notes)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

## Overview

Businesses that run lead generation campaigns on Meta Ads often need to check multiple screens to see how their campaigns are performing and which leads have come in. This project solves that problem by connecting to the Meta Leads API and presenting the results directly inside the current dashboard UI.

The dashboard provides a clear project summary alongside a continuously updated list of incoming leads, allowing sales and marketing teams to respond quickly.

## Features

- **Project overview:** a concise summary of the project and its key metrics at a glance.
- **Live lead tracking:** new leads from Meta Ads appear on the dashboard as they arrive.
- **Integrated UI:** all data is shown within the existing dashboard, with no separate screens required.
- **Secure configuration:** API credentials are stored in environment variables and are never committed to the repository.
- **Easy to extend:** clean, modular code that makes it simple to add new data sources or dashboard widgets.

## Tech Stack

| Layer    | Technology                           |
|----------|--------------------------------------|
| Frontend | [React / HTML, CSS, JavaScript]      |
| Backend  | [Node.js / Python]                   |
| API      | Meta (Facebook) Graph API, Leads API |
| Hosting  | [Local / Vercel / Render / AWS]      |

## Prerequisites

Before you begin, make sure you have the following:

- [Node.js](https://nodejs.org/) version 18 or later (or Python 3.9 or later, depending on your backend)
- [Git](https://git-scm.com/)
- A Meta Developer account with an app created at [developers.facebook.com](https://developers.facebook.com/)
- A Meta access token with the `leads_retrieval` and `pages_show_list` permissions
- Your Facebook Page ID and Lead Form ID

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/princek34/Meta_leads_adds.git
   cd Meta_leads_adds
   ```

2. **Install dependencies**

   For Node.js:

   ```bash
   npm install
   ```

   For Python:

   ```bash
   pip install -r requirements.txt
   ```

## Configuration

Create a `.env` file in the root directory of the project and add the following variables:

```env
META_ACCESS_TOKEN=your_meta_access_token
META_PAGE_ID=your_facebook_page_id
META_FORM_ID=your_lead_form_id
PORT=3000
```

| Variable            | Description                                          |
|---------------------|------------------------------------------------------|
| `META_ACCESS_TOKEN` | Access token used to authenticate with the Meta API  |
| `META_PAGE_ID`      | ID of the Facebook Page that owns the lead forms     |
| `META_FORM_ID`      | ID of the lead form whose leads you want to display  |
| `PORT`              | Port on which the application runs                   |

> **Important:** Never commit your `.env` file. It is already listed in `.gitignore`.

## Running the Project

Start the application:

```bash
npm start
```

Then open your browser and go to:

```
http://localhost:3000
```

The dashboard will load and begin displaying your project overview and live leads.

## Project Structure

```
Meta_leads_adds/
├── src/              # Application source code
├── public/           # Static files and UI assets
├── .env              # Environment variables (not committed)
├── .gitignore        # Files excluded from version control
├── package.json      # Dependencies and scripts
└── README.md         # Project documentation
```

> Update this section to match your actual folder layout.

## How It Works

1. The backend authenticates with the Meta Graph API using your access token.
2. It requests the latest leads from the configured lead form.
3. The data is returned to the frontend, either through periodic polling or a webhook.
4. The dashboard renders the project overview and the newest leads on the current UI.

## Security Notes

- Keep your access token private and rotate it regularly.
- Use a long-lived token or a system user token for production environments.
- Lead data contains personal information. Make sure your usage complies with applicable privacy laws and Meta's platform policies.
- Do not expose the dashboard publicly without authentication.

## Troubleshooting

| Problem                          | Possible Solution                                                           |
|----------------------------------|-----------------------------------------------------------------------------|
| No leads are showing             | Verify that the Page ID, Form ID, and token permissions are correct.        |
| "Invalid OAuth access token"     | Your token may have expired. Generate a new one in the Meta Developer portal. |
| Application does not start       | Confirm dependencies are installed and the `.env` file exists.              |
| Port already in use              | Change the `PORT` value in your `.env` file.                                |

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request describing your changes.

## License

This project is licensed under the [MIT License](LICENSE). Add a `LICENSE` file to the repository if you want to apply this license.

## Author

**princek34**
GitHub: [@princek34](https://github.com/princek34)

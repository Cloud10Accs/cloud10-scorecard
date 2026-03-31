# Cloud 10 Scorecard

A production-ready Next.js weekly performance scorecard dashboard for Cloud 10 Accounting. Track KPI performance across Sales, Finance, and Operations departments with real-time Google Sheets integration.

## Features

- **Weekly KPI Tracking**: Enter KPI data for Sales, Finance, and Operations
- **Auto-Calculated Scores**: Intelligent scoring logic with visual gauges
- **12-Week Trends**: Beautiful line charts showing performance trends
- **PIN-Based Authentication**: Simple editor/viewer mode control
- **Google Sheets Integration**: Live data sync with automatic updates
- **Demo Mode**: Works offline with mock data for testing
- **Responsive Design**: Mobile-friendly dashboard with Cloud 10 branding
- **Session Persistence**: Editor mode stays active within the session

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

The dashboard launches in demo mode with mock data. To connect Google Sheets, see [SETUP.md](./SETUP.md).

## Environment Variables

```env
GOOGLE_SHEETS_ID=your_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
EDITOR_PIN=cloud10
NEXT_PUBLIC_DEMO_MODE=false
```

See [SETUP.md](./SETUP.md) for detailed configuration instructions.

## Scoring

All departments score out of 20 points (total = 60 possible points):

- **Sales**: Networking, outreach, proposals, pipeline
- **Finance**: Direct debits, reconciliation, billing, fee reviews
- **Operations**: Complaints, completions, referrals, satisfaction

Overall score = (Sales + Finance + Operations) / 60 × 100%

## Deployment

Deploy to Vercel with one click:

1. Push to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy

See [SETUP.md](./SETUP.md) for detailed steps.

## Tech Stack

- **Next.js 14**: React framework with App Router
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Data visualization
- **Google Sheets API**: Backend data store
- **Vercel**: Deployment platform

## Project Structure

```
app/
├── api/sheets/        # Data & auth endpoints
├── globals.css        # Tailwind & custom styles
├── layout.js          # Root layout
└── page.js            # Main dashboard

components/
├── Cloud10Logo.jsx    # Brand logo
├── GaugeChart.jsx     # Score visualization
├── TrendChart.jsx     # Historical trends
├── PinModal.jsx       # Editor unlock dialog
└── Scorecard.jsx      # Main scorecard component

lib/
├── sheets.js          # Google Sheets API wrapper
├── scoring.js         # KPI calculation logic
└── mockData.js        # Demo data for offline mode
```

## Development

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Build for production
npm start        # Start production server
```

## License

Private use. Cloud 10 Accounting Ltd.

---

For complete setup and deployment instructions, see [SETUP.md](./SETUP.md).

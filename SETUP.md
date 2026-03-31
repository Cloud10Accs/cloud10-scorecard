# Cloud 10 Scorecard — Getting Live in 3 Steps

Your Google Sheet is already created: [Cloud 10 Scorecard](https://docs.google.com/spreadsheets/d/1hokyEt7HJOMRTEEgL8rQYQTDutPOSAa35jR3Nm650Vg/edit)

The dashboard auto-creates the tabs and headers for you — you just need to connect it.

---

## Step 1: Create a Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your existing project (or create one called "Cloud 10 Scorecard")
3. **Enable the Google Sheets API:**
   - Go to **APIs & Services** → **Library**
   - Search "Google Sheets API" → click **Enable**
4. **Create the service account:**
   - Go to **APIs & Services** → **Credentials**
   - Click **+ Create Credentials** → **Service Account**
   - Name: `cloud10-scorecard` → click **Create and Continue** → **Done**
5. **Download the key:**
   - Click on the service account you just created
   - Go to **Keys** tab → **Add Key** → **Create new key** → **JSON**
   - A `.json` file will download — keep this safe, you'll need two values from it

## Step 2: Share the Google Sheet

1. Open the JSON key file and find the `client_email` value (looks like `cloud10-scorecard@your-project.iam.gserviceaccount.com`)
2. Open your [Google Sheet](https://docs.google.com/spreadsheets/d/1hokyEt7HJOMRTEEgL8rQYQTDutPOSAa35jR3Nm650Vg/edit)
3. Click **Share** (top right) → paste the `client_email` → give it **Editor** access → **Share**

## Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up / log in
2. Click **Import Project** → connect your GitHub → select the `cloud10-scorecard` repo
3. Before deploying, add these **Environment Variables**:

| Variable | Value |
|---|---|
| `GOOGLE_SHEETS_ID` | `1hokyEt7HJOMRTEEgL8rQYQTDutPOSAa35jR3Nm650Vg` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | The `client_email` from the JSON key file |
| `GOOGLE_PRIVATE_KEY` | The `private_key` from the JSON key file (paste the whole thing including `-----BEGIN/END-----`) |
| `EDITOR_PIN` | `cloud10` (or whatever PIN you want for editor access) |

4. Click **Deploy**

---

## After Deployment

Once live, visit your Vercel URL and:

1. The dashboard loads in read-only mode (anyone with the link can view)
2. Click the **lock icon** → enter your PIN → you're in editor mode
3. Go to **Settings** tab → click **Set Up Google Sheet** — this auto-creates the Sales, Finance, and Operations tabs with all the correct headers
4. Start entering weekly data!

**Editor PIN:** Only people with the PIN can enter/edit data. Everyone else sees read-only. Default is `cloud10` — change it via the `EDITOR_PIN` environment variable in Vercel.

**Custom domain (optional):** In Vercel → Settings → Domains → add something like `scorecard.cloud10accounting.co.uk`

---

## Scoring Reference

All departments max out at 20 points each (60 total). The dashboard auto-calculates everything.

**Sales (20 pts):** Networking events, 1:1s, LinkedIn posts, Socket pricing, Sales handover, Content hours, Proposals sent/won, Client value, Pipeline value

**Finance (20 pts):** DD sign-ups, Unreconciled items, Invoice rec diff, One-offs not billed, Fee reviews old, Overdue balances

**Operations (20 pts):** Complaints, Email comms, Accounts completion/not started, SA completion (monthly target escalates May→Apr), Managements, Xero insights, Client referrals, Staff satisfaction, Google reviews, Kudos

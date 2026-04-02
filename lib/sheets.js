import { google } from 'googleapis';

let sheetsClient = null;

function getAuth() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    return null;
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return auth;
  } catch (error) {
    console.error('Error creating Google Auth:', error);
    return null;
  }
}

function getSheets() {
  const auth = getAuth();
  if (!auth) return null;

  if (!sheetsClient) {
    sheetsClient = google.sheets({ version: 'v4', auth });
  }
  return sheetsClient;
}

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;

export async function getWeeklyData(weekEnding) {
  const sheets = getSheets();
  if (!sheets || !SPREADSHEET_ID) {
    return null;
  }

  try {
    const departments = ['Sales', 'Finance', 'Operations'];
    const result = {};

    for (const dept of departments) {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${dept}!A:Z`,
      });

      const rows = response.data.values || [];
      if (rows.length === 0) {
        result[dept] = {};
        continue;
      }

      const headers = rows[0];
      const weekRow = rows.find((row) => row[0] === weekEnding);

      if (weekRow) {
        const data = {};
        headers.forEach((header, index) => {
          if (index > 0 && header) {
            data[header] = weekRow[index] || '';
          }
        });
        result[dept] = data;
      } else {
        // Week doesn't exist yet — return empty fields so the form shows blank
        const data = {};
        headers.forEach((header, index) => {
          if (index > 0 && header) {
            data[header] = '';
          }
        });
        result[dept] = data;
      }
    }

    return result;
  } catch (error) {
    console.error('Error fetching weekly data:', error);
    return null;
  }
}

export async function saveWeeklyData(weekEnding, department, data) {
  const sheets = getSheets();
  if (!sheets || !SPREADSHEET_ID) {
    return false;
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${department}!A:Z`,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return false;
    }

    const headers = rows[0];
    let weekRowIndex = rows.findIndex((row) => row[0] === weekEnding);

    if (weekRowIndex === -1) {
      weekRowIndex = rows.length;
      rows.push([weekEnding]);
    }

    const weekRow = rows[weekRowIndex] || [weekEnding];

    Object.entries(data).forEach(([key, value]) => {
      const colIndex = headers.indexOf(key);
      if (colIndex > 0) {
        weekRow[colIndex] = value;
      }
    });

    rows[weekRowIndex] = weekRow;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${department}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: rows,
      },
    });

    return true;
  } catch (error) {
    console.error('Error saving weekly data:', error);
    return false;
  }
}

export async function getHistoricalData(weeks = 12) {
  const sheets = getSheets();
  if (!sheets || !SPREADSHEET_ID) {
    return null;
  }

  try {
    const departments = ['Sales', 'Finance', 'Operations'];
    const result = {};

    for (const dept of departments) {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${dept}!A:Z`,
      });

      const rows = response.data.values || [];
      if (rows.length === 0) continue;

      const headers = rows[0];
      const dataRows = rows.slice(1, weeks + 1);

      result[dept] = dataRows.map((row) => {
        const obj = { weekEnding: row[0] };
        headers.forEach((header, index) => {
          if (index > 0 && header) {
            obj[header] = row[index] || '';
          }
        });
        return obj;
      });
    }

    return result;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return null;
  }
}

// Get the Friday ending date for a given date's week
function getWeekEndingFriday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  const daysUntilFriday = (5 - day + 7) % 7 || 7; // days until next Friday (or today if Friday)
  if (day === 5) {
    // It's Friday, use today
  } else {
    d.setDate(d.getDate() + daysUntilFriday);
  }
  return d.toISOString().split('T')[0];
}

export async function getAvailableWeeks() {
  const sheets = getSheets();
  if (!sheets || !SPREADSHEET_ID) {
    return [];
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sales!A2:A',
    });

    const rows = response.data.values || [];
    const existingWeeks = rows.map((row) => row[0]).filter(Boolean);

    // Always include current week and next week
    const now = new Date();
    const currentWeekEnding = getWeekEndingFriday(now);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekEnding = getWeekEndingFriday(nextWeek);

    // Merge and deduplicate
    const allWeeks = new Set([...existingWeeks, currentWeekEnding, nextWeekEnding]);

    // Sort descending (newest first)
    return Array.from(allWeeks).sort((a, b) => b.localeCompare(a));
  } catch (error) {
    console.error('Error fetching available weeks:', error);
    return [];
  }
}

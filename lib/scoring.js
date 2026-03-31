// Scoring logic for Cloud 10 Scorecard

export function calculateSalesScore(data) {
  let score = 0;

  // 1. Networking events: 0→0, 1+→2
  const networkingEvents = parseInt(data['Networking Events'] || 0);
  score += networkingEvents > 0 ? 2 : 0;

  // 2. One to ones: 0→0, 1+→2
  const oneToOnes = parseInt(data['One to Ones'] || 0);
  score += oneToOnes > 0 ? 2 : 0;

  // 3. LinkedIn Posts: 0→0, 1-4→1, 5+→3
  const linkedinPosts = parseInt(data['LinkedIn Posts'] || 0);
  if (linkedinPosts === 0) score += 0;
  else if (linkedinPosts >= 1 && linkedinPosts <= 4) score += 1;
  else score += 3;

  // 4. Socket pricing: no→0, yes→1
  const socketPricing = data['Socket Pricing'] === 'yes' ? 1 : 0;
  score += socketPricing;

  // 5. Sales handover: no→0, yes→1
  const salesHandover = data['Sales Handover'] === 'yes' ? 1 : 0;
  score += salesHandover;

  // 6. Content hours: 0-2→0, 3-5→1, 6+→3
  const contentHours = parseInt(data['Content Hours'] || 0);
  if (contentHours <= 2) score += 0;
  else if (contentHours >= 3 && contentHours <= 5) score += 1;
  else score += 3;

  // 7. Proposals sent: 0→0, 1→1, 2+→2
  const proposalsSent = parseInt(data['Proposals Sent'] || 0);
  if (proposalsSent === 0) score += 0;
  else if (proposalsSent === 1) score += 1;
  else score += 2;

  // 8. Proposals Won: 0→0, 1→1, 2+→2
  const proposalsWon = parseInt(data['Proposals Won'] || 0);
  if (proposalsWon === 0) score += 0;
  else if (proposalsWon === 1) score += 1;
  else score += 2;

  // 9. Value of clients won: 0→0, 1-1000→1, 1001+→2
  const clientsWonValue = parseInt(data['Clients Won Value'] || 0);
  if (clientsWonValue === 0) score += 0;
  else if (clientsWonValue >= 1 && clientsWonValue <= 1000) score += 1;
  else score += 2;

  // 10. Value of pipeline: 0-2000→0, 2001-4000→1, 4001+→2
  const pipelineValue = parseInt(data['Pipeline Value'] || 0);
  if (pipelineValue <= 2000) score += 0;
  else if (pipelineValue >= 2001 && pipelineValue <= 4000) score += 1;
  else score += 2;

  return Math.min(score, 20);
}

export function calculateFinanceScore(data) {
  let score = 0;

  // 1. DD sign up: 0→3, 1→1, 2+→0
  const ddSignUp = parseInt(data['DD Sign Up'] || 0);
  if (ddSignUp === 0) score += 3;
  else if (ddSignUp === 1) score += 1;
  else score += 0;

  // 2. Unreconciled items: 0→3, 1-3→1, 3+→0
  const unreconciledItems = parseInt(data['Unreconciled Items'] || 0);
  if (unreconciledItems === 0) score += 3;
  else if (unreconciledItems >= 1 && unreconciledItems <= 3) score += 1;
  else score += 0;

  // 3. Invoice rec diff: 0→4, >0→0
  const invoiceRecDiff = parseInt(data['Invoice Rec Diff'] || 0);
  score += invoiceRecDiff === 0 ? 4 : 0;

  // 4. One offs not billed: 0→3, 1-3000→1, 3001+→0
  const oneOffsNotBilled = parseInt(data['One Offs Not Billed'] || 0);
  if (oneOffsNotBilled === 0) score += 3;
  else if (oneOffsNotBilled >= 1 && oneOffsNotBilled <= 3000) score += 1;
  else score += 0;

  // 5. Fee reviews old: 0-10%→3, 11-20%→1, 20%+→0
  const feeReviewsOld = parseInt(data['Fee Reviews Old'] || 0);
  if (feeReviewsOld <= 10) score += 3;
  else if (feeReviewsOld >= 11 && feeReviewsOld <= 20) score += 1;
  else score += 0;

  // 6. Overdue balances: <5%→4, 5%+→0
  const overdueBalances = parseInt(data['Overdue Balances'] || 0);
  score += overdueBalances < 5 ? 4 : 0;

  return Math.min(score, 20);
}

export function calculateOperationsScore(data, currentMonth = new Date().getMonth() + 1) {
  let score = 0;

  // 1. Complaints: 0→2, 1+→0
  const complaints = parseInt(data['Complaints'] || 0);
  score += complaints === 0 ? 2 : 0;

  // 2. Email comms: 0→2, 1→1, 2+→0
  const emailComms = parseInt(data['Email Comms'] || 0);
  if (emailComms === 0) score += 2;
  else if (emailComms === 1) score += 1;
  else score += 0;

  // 3. Accounts completion: 60%+→2, <60%→0
  const accountsCompletion = parseInt(data['Accounts Completion'] || 0);
  score += accountsCompletion >= 60 ? 2 : 0;

  // 4. Accounts not started: 0%→2, 0.1-10%→1, 11%+→0
  const accountsNotStarted = parseFloat(data['Accounts Not Started'] || 0);
  if (accountsNotStarted === 0) score += 2;
  else if (accountsNotStarted > 0 && accountsNotStarted <= 10) score += 1;
  else score += 0;

  // 5. SA completion: dynamic monthly target
  const saTarget = getSATarget(currentMonth);
  const saCompletion = parseInt(data['SA Completion'] || 0);
  score += saCompletion >= saTarget ? 2 : 0;

  // 6. Managements: up to date→2, not→0
  const managements = data['Managements Up To Date'] === 'yes' ? 1 : 0;
  score += managements === 1 ? 2 : 0;

  // 7. Xero insights BK: 90%+→2, <90%→0
  const xeroInsights = parseInt(data['Xero Insights BK'] || 0);
  score += xeroInsights >= 90 ? 2 : 0;

  // 8. Client referrals: 1+→2, 0→0
  const clientReferrals = parseInt(data['Client Referrals'] || 0);
  score += clientReferrals >= 1 ? 2 : 0;

  // 9. Staff satisfaction: 7+→2, <7→0
  const staffSatisfaction = parseFloat(data['Staff Satisfaction'] || 0);
  score += staffSatisfaction >= 7 ? 2 : 0;

  // 10. Google Reviews: 1+→1, 0→0
  const googleReviews = parseInt(data['Google Reviews'] || 0);
  score += googleReviews >= 1 ? 1 : 0;

  // 11. Kudos: 2+→1, <2→0
  const kudos = parseInt(data['Kudos'] || 0);
  score += kudos >= 2 ? 1 : 0;

  return Math.min(score, 20);
}

function getSATarget(month) {
  // May=10%, Jun=20%, Jul=30%, Aug=40%, Sep=50%, Oct=75%, Nov-Apr=100%
  const targets = {
    5: 10,  // May
    6: 20,  // Jun
    7: 30,  // Jul
    8: 40,  // Aug
    9: 50,  // Sep
    10: 75, // Oct
    11: 100, // Nov
    12: 100, // Dec
    1: 100, // Jan
    2: 100, // Feb
    3: 100, // Mar
    4: 100, // Apr
  };
  return targets[month] || 100;
}

export function calculateOverallScore(salesScore, financeScore, operationsScore) {
  const total = salesScore + financeScore + operationsScore;
  const max = 60;
  return Math.round((total / max) * 100);
}

export function calculateDepartmentPercentage(score, max = 20) {
  return Math.round((score / max) * 100);
}

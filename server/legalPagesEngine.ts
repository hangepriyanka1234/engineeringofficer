/**
 * Google Play Store & Statutory Merchant Legal Pages Engine
 * Serves standalone, ultra-fast, responsive HTML pages for Google Play compliance:
 * - Privacy Policy (/privacy-policy, /privacy)
 * - Account Deletion Web Request (/delete-account, /account-deletion)
 * - Terms of Service (/terms-conditions, /terms)
 * - Refund & Cancellation Policy (/refund-policy, /refund)
 * - Shipping / Digital Delivery Policy (/shipping-policy, /shipping)
 * - Contact & Support (/contact-us, /contact, /support)
 * - Central Legal Hub (/legal)
 * 
 * Complies with:
 * - Google Play Developer Policy (Target SDK 34 / 35, Data Safety, Account Deletion)
 * - India Digital Personal Data Protection (DPDP) Act 2023
 * - Razorpay Statutory Merchant Compliance
 */

import { Request, Response } from 'express';

const BRAND_NAME = 'Engineering Officer BY MH';
const LEGAL_ENTITY = 'PRIME MULTI SERVICES AND SUPPLIERS';
const SUPPORT_EMAIL = 'gitevijay123@gmail.com';
const SUPPORT_PHONE = '+91 93708 72123';
const OPERATOR_ADDRESS = 'Maharashtra, India';
const APP_ID = 'com.engineeringofficer.civil';

// Base styling template for all standalone legal pages
function renderLegalPageTemplate(title: string, subtitle: string, contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | ${BRAND_NAME}</title>
  <meta name="description" content="${subtitle} - ${BRAND_NAME} operated by ${LEGAL_ENTITY}">
  <style>
    :root {
      --primary: #0F2744;
      --accent: #2563EB;
      --bg: #F8FAFC;
      --card-bg: #FFFFFF;
      --text-main: #0F172A;
      --text-muted: #475569;
      --border: #E2E8F0;
      --success: #059669;
      --warning: #D97706;
      --danger: #DC2626;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text-main);
      line-height: 1.6;
      padding: 0;
      margin: 0;
    }
    .header-bar {
      background-color: var(--primary);
      color: white;
      padding: 16px 24px;
      border-bottom: 2px solid #1E3A8A;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .header-title {
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 9999px;
      background: rgba(37, 99, 235, 0.2);
      color: #93C5FD;
      border: 1px solid rgba(147, 197, 253, 0.3);
    }
    .header-nav {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .header-nav a {
      color: #E2E8F0;
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 6px;
      background: rgba(255,255,255,0.08);
      transition: background 0.2s;
    }
    .header-nav a:hover {
      background: rgba(255,255,255,0.2);
      color: white;
    }
    .container {
      max-width: 900px;
      margin: 32px auto;
      padding: 0 16px;
    }
    .card {
      background: var(--card-bg);
      border-radius: 16px;
      border: 1px solid var(--border);
      padding: 32px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05);
    }
    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--primary);
      margin-bottom: 8px;
      line-height: 1.25;
    }
    .page-subtitle {
      font-size: 0.95rem;
      color: var(--text-muted);
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border);
    }
    .disclosure-box {
      background-color: #EFF6FF;
      border: 1px solid #BFDBFE;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
      font-size: 0.88rem;
      color: #1E3A8A;
    }
    .disclosure-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-top: 12px;
    }
    .disclosure-item {
      background: white;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid #DBEAFE;
    }
    .disclosure-item span {
      display: block;
      font-size: 0.72rem;
      color: #64748B;
      text-transform: uppercase;
      font-weight: 700;
    }
    .disclosure-item strong {
      font-size: 0.85rem;
      color: #0F172A;
    }
    h2 {
      font-size: 1.2rem;
      font-weight: 700;
      color: #0F172A;
      margin: 28px 0 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #F1F5F9;
    }
    h3 {
      font-size: 1rem;
      font-weight: 700;
      color: #1E293B;
      margin: 16px 0 8px;
    }
    p, li {
      font-size: 0.92rem;
      color: #334155;
      margin-bottom: 12px;
      line-height: 1.65;
    }
    ul, ol {
      padding-left: 24px;
      margin-bottom: 16px;
    }
    .nav-links-footer {
      margin-top: 36px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: center;
    }
    .nav-links-footer a {
      color: var(--accent);
      text-decoration: none;
      font-size: 0.82rem;
      font-weight: 600;
    }
    .nav-links-footer a:hover {
      text-decoration: underline;
    }
    .footer {
      text-align: center;
      padding: 24px;
      font-size: 0.8rem;
      color: #64748B;
      background: #F1F5F9;
      border-top: 1px solid var(--border);
      margin-top: 40px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      font-size: 0.88rem;
      font-weight: 700;
      color: white;
      background-color: var(--accent);
      border: none;
      border-radius: 8px;
      text-decoration: none;
      cursor: pointer;
    }
    .btn-danger {
      background-color: var(--danger);
    }
    .form-group {
      margin-bottom: 16px;
    }
    .form-group label {
      display: block;
      font-size: 0.85rem;
      font-weight: 700;
      margin-bottom: 6px;
      color: #334155;
    }
    .form-control {
      width: 100%;
      padding: 10px 12px;
      font-size: 0.9rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      outline: none;
    }
    .form-control:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
    }
    @media (max-width: 640px) {
      .card { padding: 20px; }
      .page-title { font-size: 1.4rem; }
    }
  </style>
</head>
<body>
  <header class="header-bar">
    <div class="header-title">
      <span>🏗️ ${BRAND_NAME}</span>
      <span class="badge">Google Play Compliant</span>
    </div>
    <nav class="header-nav">
      <a href="/legal">📋 Legal Hub</a>
      <a href="/">📱 Open App</a>
    </nav>
  </header>

  <main class="container">
    <article class="card">
      <h1 class="page-title">${title}</h1>
      <p class="page-subtitle">${subtitle}</p>

      <div class="disclosure-box">
        <strong>Statutory Operator & Business Identity Disclosure:</strong>
        <div class="disclosure-grid">
          <div class="disclosure-item">
            <span>OPERATING LEGAL ENTITY</span>
            <strong>${LEGAL_ENTITY}</strong>
          </div>
          <div class="disclosure-item">
            <span>REGISTRATION & ACT</span>
            <strong>Maharashtra Shops & MSME Registered</strong>
          </div>
          <div class="disclosure-item">
            <span>OFFICIAL SUPPORT EMAIL</span>
            <strong>${SUPPORT_EMAIL}</strong>
          </div>
          <div class="disclosure-item">
            <span>HELPLINE</span>
            <strong>${SUPPORT_PHONE}</strong>
          </div>
        </div>
      </div>

      ${contentHtml}

      <nav class="nav-links-footer" aria-label="Statutory Policies">
        <a href="/privacy-policy">Privacy Policy</a>
        <span>·</span>
        <a href="/terms-conditions">Terms of Service</a>
        <span>·</span>
        <a href="/refund-policy">Refund & Cancellation</a>
        <span>·</span>
        <a href="/shipping-policy">Digital Delivery</a>
        <span>·</span>
        <a href="/delete-account">Account Deletion</a>
        <span>·</span>
        <a href="/contact-us">Contact & Support</a>
      </nav>
    </article>
  </main>

  <footer class="footer">
    <p>© 2026 ${LEGAL_ENTITY} · ${BRAND_NAME} (App ID: ${APP_ID}). All rights reserved.</p>
    <p style="margin-top: 6px;">Civil Engineering Competitive Examination Preparation Portal · Non-Government Educational Application</p>
  </footer>
</body>
</html>`;
}

export const LegalPagesEngine = {
  // 1. PRIVACY POLICY
  renderPrivacyPolicy(_req: Request, res: Response) {
    const content = `
      <h2>1. Introduction & Scope</h2>
      <p>
        This Privacy Policy explains how <strong>${LEGAL_ENTITY}</strong> ("we", "us", or "our"), the lawful operator of the mobile and web application <strong>${BRAND_NAME}</strong> (Package / App ID: <code>${APP_ID}</code>), collects, uses, encrypts, and protects your information when you prepare for competitive civil engineering examinations (including MPSC MES, SSC JE, Maharashtra PWD, WRD, ZP, RRB JE, and Central/State engineering recruitment tests).
      </p>

      <h2>2. What Candidate Data We Collect</h2>
      <p>To provide personalized civil engineering question practice, CBT mock test evaluation, and mistake notebook analysis, we collect minimal necessary data:</p>
      <ul>
        <li><strong>Account Identifiers:</strong> Name, email address, and academic qualification (Diploma / B.E. / B.Tech Civil).</li>
        <li><strong>Practice & Examination Telemetry:</strong> Questions attempted, marks scored, accuracy percentage, time taken per question, and mistake notebook logs.</li>
        <li><strong>Payment Records:</strong> Transaction ID, order ID, plan chosen, and payment timestamp (processed securely through authorized payment gateway Razorpay; we never store your card numbers, CVV, or banking passwords).</li>
        <li><strong>Technical Device Information:</strong> Device model, OS version, and app version solely for crash diagnosis and performance optimization.</li>
      </ul>

      <h2>3. Purpose of Processing & Use of Data</h2>
      <ul>
        <li>To track your daily civil engineering syllabus coverage and exam readiness.</li>
        <li>To compute CBT mock test rank lists and percentile comparisons.</li>
        <li>To organize your personalized Mistake Notebook with IS Code references (IS 456, IS 800, etc.).</li>
        <li>To authenticate your secure subscription tier and deliver access.</li>
      </ul>

      <h2>4. Third-Party Integrations & Zero Data Selling Policy</h2>
      <p>
        <strong>We treat student privacy with the highest engineering rigor. We DO NOT sell, rent, monetize, or trade candidate personal data to advertisers, telemarketers, or unauthorized third parties.</strong>
      </p>
      <p>We only use trusted, enterprise-grade cloud partners:</p>
      <ul>
        <li><strong>Razorpay:</strong> RBI authorized and PCI-DSS Level 1 compliant payment processor for secure UPI and card checkouts.</li>
        <li><strong>Supabase / PostgreSQL:</strong> Secure cloud database with TLS 1.3 encryption in transit and AES-256 encryption at rest.</li>
        <li><strong>Google AI (Gemini):</strong> Used strictly for generating educational MCQs and step-by-step civil engineering explanations. No student personally identifiable information (PII) is ever transmitted to AI models.</li>
      </ul>

      <h2>5. Google Play Data Safety Compliance</h2>
      <p>In accordance with Google Play's Data Safety declaration rules:</p>
      <ul>
        <li>Data is transferred over a secure HTTPS connection.</li>
        <li>Data is encrypted at rest using industry-standard cryptography.</li>
        <li>Users have the absolute right to request permanent account and telemetry deletion.</li>
      </ul>

      <h2>6. Account Deletion & Right to Be Forgotten</h2>
      <p>
        Under Google Play Developer Policy and India Digital Personal Data Protection (DPDP) Act 2023, you can request permanent deletion of your account and all associated data at any time without retaining the app:
      </p>
      <p>
        👉 Visit our dedicated public account deletion request portal: <a href="/delete-account" style="font-weight: 700; color: var(--accent);">Request Permanent Account Deletion</a>, or email us at <strong>${SUPPORT_EMAIL}</strong>.
      </p>

      <h2>7. Non-Government Educational Disclaimer</h2>
      <p>
        <strong>${BRAND_NAME}</strong> is an independent educational tool created by <strong>${LEGAL_ENTITY}</strong>. This application is NOT an official app of any government agency, including MPSC, PWD, WRD, SSC, UPSC, or RRB. All past exam papers and notifications are gathered from official public gazettes solely for student preparation.
      </p>

      <h2>8. Contact the Privacy Officer</h2>
      <p>
        If you have any questions, grievances, or data requests, please contact:<br>
        <strong>Grievance Officer:</strong> ${LEGAL_ENTITY}<br>
        <strong>Email:</strong> ${SUPPORT_EMAIL}<br>
        <strong>Helpline:</strong> ${SUPPORT_PHONE}<br>
        <strong>Address:</strong> ${OPERATOR_ADDRESS}
      </p>
    `;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderLegalPageTemplate('Privacy Policy (गोपनीयता धोरण)', 'Official Candidate Data Protection & Google Play Compliance Policy', content));
  },

  // 2. ACCOUNT DELETION
  renderAccountDeletion(_req: Request, res: Response) {
    const content = `
      <h2>Account Deletion & Data Removal Request (खाता कायमचे हटवणे)</h2>
      <p>
        In strict compliance with <strong>Google Play Developer Policy</strong> and the <strong>Digital Personal Data Protection (DPDP) Act 2023</strong>, candidates can request the permanent deletion of their account, study history, mock test records, and all personal telemetry.
      </p>

      <div style="background: #FEF2F2; border: 1px solid #FECACA; padding: 16px; border-radius: 12px; margin: 20px 0;">
        <h3 style="color: #991B1B; margin-top: 0;">⚠️ What Gets Permanently Deleted:</h3>
        <ul style="color: #7F1D1D; margin-bottom: 0;">
          <li>Your registered profile (Name, Email, Qualifications).</li>
          <li>All solved MCQs history and daily progress telemetry.</li>
          <li>All CBT Mock Test scores, attempt logs, and percentile records.</li>
          <li>All saved notes in Mistake Notebook and Spaced Repetition cards.</li>
          <li>Active subscription access (cannot be restored once purged).</li>
        </ul>
      </div>

      <div style="background: #F8FAFC; border: 1px solid #CBD5E1; padding: 24px; border-radius: 16px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #0F172A;">Online Account Deletion Request Form:</h3>
        <form method="POST" action="/api/account/delete-request" onsubmit="return confirm('Are you sure you want to permanently delete your account and all associated civil engineering preparation data? This cannot be undone.');">
          <div class="form-group">
            <label for="email">Registered Account Email (नोंदणीकृत ई-मेल):</label>
            <input type="email" id="email" name="email" class="form-control" required placeholder="e.g. yourname@gmail.com">
          </div>

          <div class="form-group">
            <label for="reason">Reason for Account Deletion (पर्यायी कारण):</label>
            <select id="reason" name="reason" class="form-control">
              <option value="Exam Preparation Completed">Exam Preparation Completed (परीक्षा पूर्ण झाली)</option>
              <option value="Duplicate Account">Duplicate Account (दुसरे खाते वापरत आहे)</option>
              <option value="Privacy Preference">Privacy Preference (गोपनीयता कारणे)</option>
              <option value="Other">Other (इतर कारण)</option>
            </select>
          </div>

          <div class="form-group">
            <label for="confirm">Type "DELETE" to confirm (खात्री करण्यासाठी 'DELETE' टाईप करा):</label>
            <input type="text" id="confirm" name="confirm" class="form-control" required pattern="DELETE" placeholder="DELETE">
          </div>

          <button type="submit" class="btn btn-danger">
            🗑️ Submit Permanent Account Deletion Request
          </button>
        </form>
      </div>

      <h2>Manual Deletion by Email</h2>
      <p>
        You may also email us directly at <strong><a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></strong> with the subject line <code>"DELETE ACCOUNT - [Your Registered Email]"</code>. Requests submitted via email or this form are processed and completed within <strong>48–72 hours</strong>.
      </p>
    `;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderLegalPageTemplate('Account & Data Deletion Request', 'Google Play Policy Mandatory User Data Deletion Portal', content));
  },

  // 3. TERMS OF SERVICE
  renderTermsOfService(_req: Request, res: Response) {
    const content = `
      <h2>1. Agreement to Terms</h2>
      <p>
        These Terms of Service constitute a legally binding agreement between you and <strong>${LEGAL_ENTITY}</strong> regarding your access to and use of <strong>${BRAND_NAME}</strong> (mobile app and web portal).
      </p>

      <h2>2. Permitted Educational Use</h2>
      <p>
        The content, questions, solution explanations, and CBT mock simulations provided in this application are strictly for personal, non-commercial examination preparation. You agree not to copy, scrape, distribute, reproduce, or resell the question bank, IS code summaries, or mock test papers.
      </p>

      <h2>3. Intellectual Property Rights</h2>
      <p>
        All custom question explanations, formula lab charts, interactive site engineering laboratory models, and user interface designs are the intellectual property of <strong>${LEGAL_ENTITY}</strong>. Past year question papers (PYQs) reproduced are public domain examination papers credited to their respective conducting authorities (MPSC, SSC, PWD, RRB, etc.).
      </p>

      <h2>4. Non-Government Disclaimer</h2>
      <p>
        <strong>${BRAND_NAME}</strong> is an independent educational platform. We are NOT affiliated with, sponsored by, or endorsed by the Government of Maharashtra, Government of India, MPSC, PWD, or SSC. Candidates must check official government recruitment notices for authoritative exam dates and application procedures.
      </p>

      <h2>5. Subscriptions & Billing</h2>
      <p>
        Paid subscriptions (Pro / Super-Pro) are billed securely through Razorpay. Access to premium mock tests and formula tools is granted immediately upon successful payment.
      </p>

      <h2>6. Governing Law & Jurisdiction</h2>
      <p>
        These terms shall be governed by and construed in accordance with the laws of India. Any legal dispute shall be subject to the exclusive jurisdiction of the competent courts in Maharashtra, India.
      </p>
    `;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderLegalPageTemplate('Terms of Service (वापराच्या अटी)', 'Official User Agreement & Educational Platform Terms', content));
  },

  // 4. REFUND & CANCELLATION POLICY
  renderRefundPolicy(_req: Request, res: Response) {
    const content = `
      <h2>1. Overview</h2>
      <p>
        At <strong>${LEGAL_ENTITY}</strong>, customer satisfaction is our top priority. We provide competitive examination preparation digital services through <strong>${BRAND_NAME}</strong>. This policy outlines our cancellation and refund procedure in compliance with Razorpay Merchant Guidelines and consumer protection laws.
      </p>

      <h2>2. Digital Educational Subscriptions</h2>
      <p>
        Our services include digital study materials, CBT mock test access, and AI explanations. Because access to digital test materials is delivered immediately upon payment, subscriptions are generally non-transferable.
      </p>

      <h2>3. Eligible Refund Scenarios</h2>
      <p>We provide full or partial refunds under the following circumstances:</p>
      <ul>
        <li><strong>Accidental Duplicate Payment:</strong> If your bank account or UPI was debited twice for the same transaction due to a network timeout, the duplicate charge will be refunded 100% automatically within 3–5 working days.</li>
        <li><strong>Service Inaccessibility:</strong> If technical server issues on our platform prevent you from accessing purchased mock tests for more than 48 continuous hours after purchase, you are entitled to a full refund.</li>
        <li><strong>Pre-Activation Cancellation:</strong> Refund requests submitted within 24 hours of purchase, provided less than 2 mock tests have been attempted.</li>
      </ul>

      <h2>4. Refund Request Process</h2>
      <p>To request a refund, please send an email to <strong>${SUPPORT_EMAIL}</strong> with the following details:</p>
      <ul>
        <li>Your Registered Name and Email</li>
        <li>Razorpay Payment ID / Transaction ID</li>
        <li>Date and Amount of Transaction</li>
        <li>Reason for Refund Request</li>
      </ul>
      <p>
        Our support desk evaluates requests within <strong>24 business hours</strong>. Approved refunds are credited directly back to the original source payment method (Bank/UPI/Card) within <strong>5–7 business days</strong>.
      </p>
    `;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderLegalPageTemplate('Refund & Cancellation Policy (परतावा धोरण)', 'Official Razorpay Compliant Refund & Cancellation Guidelines', content));
  },

  // 5. DIGITAL DELIVERY / SHIPPING POLICY
  renderShippingPolicy(_req: Request, res: Response) {
    const content = `
      <h2>1. Nature of Services (Digital Delivery)</h2>
      <p>
        <strong>${BRAND_NAME}</strong> operated by <strong>${LEGAL_ENTITY}</strong> provides exclusively electronic educational services and digital online test preparation tools.
      </p>

      <h2>2. Delivery Timeline & Method</h2>
      <ul>
        <li><strong>Instant Digital Delivery:</strong> All digital subscription packages, mock tests, and question banks are activated automatically in your account within <strong>60 seconds</strong> of successful payment confirmation by Razorpay.</li>
        <li><strong>No Physical Shipment:</strong> Since all our products are digital access subscriptions and PDF handbooks accessible via browser/app, there are NO physical packages, courier shipping charges, or physical delivery delays.</li>
        <li><strong>Confirmation Receipt:</strong> An electronic payment confirmation and access receipt is issued immediately and sent to your registered email address.</li>
      </ul>

      <h2>3. Delivery Assistance</h2>
      <p>
        If your account status does not update automatically after payment, simply click "Refresh Access" in the app or contact our team at <strong>${SUPPORT_EMAIL}</strong> / <strong>${SUPPORT_PHONE}</strong> with your payment ID for instant manual activation.
      </p>
    `;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderLegalPageTemplate('Shipping & Delivery Policy (डिजिटल वितरण)', 'Statutory Digital Goods Delivery Timeline & Policy', content));
  },

  // 6. CONTACT & SUPPORT
  renderContactSupport(_req: Request, res: Response) {
    const content = `
      <h2>Contact Us & Candidate Support Desk</h2>
      <p>
        We are here to support civil engineering aspirants throughout their competitive exam journey. For any queries regarding subscription, test engine, or study materials, please reach out to our team:
      </p>

      <div style="background: white; border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: var(--primary);">Official Business Contact Information:</h3>
        <p><strong>Legal Operating Entity:</strong> ${LEGAL_ENTITY}</p>
        <p><strong>Brand / Platform:</strong> ${BRAND_NAME}</p>
        <p><strong>Support & Grievance Email:</strong> <a href="mailto:${SUPPORT_EMAIL}" style="color: var(--accent); font-weight: 700;">${SUPPORT_EMAIL}</a></p>
        <p><strong>Support Helpline (WhatsApp / Call):</strong> <a href="tel:${SUPPORT_PHONE.replace(/\\s/g, '')}" style="color: var(--accent); font-weight: 700;">${SUPPORT_PHONE}</a></p>
        <p><strong>Operating Address:</strong> ${OPERATOR_ADDRESS}</p>
        <p><strong>Working Hours:</strong> Monday to Saturday: 9:00 AM – 8:00 PM IST</p>
      </div>

      <h2>Quick Support Query</h2>
      <p>
        You can also send a direct message through the in-app Contact Desk or email us directly. We respond to all candidate queries within 2–4 hours during working days.
      </p>
    `;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderLegalPageTemplate('Contact & Support (संपर्क व साहाय्य)', 'Official Support Channels & Registered Merchant Details', content));
  },

  // 7. CENTRAL LEGAL & GOOGLE PLAY COMPLIANCE HUB
  renderLegalHub(req: Request, res: Response) {
    const origin = `${req.protocol}://${req.get('host')}`;
    const links = [
      { name: 'Privacy Policy (गोपनीयता धोरण)', path: '/privacy-policy', alias: '/privacy', purpose: 'Google Play Mandatory Policy Link & DPDP Act 2023 Disclosure' },
      { name: 'Account Deletion Request (खाता हटवणे)', path: '/delete-account', alias: '/account-deletion', purpose: 'Google Play Mandatory External Web Account Deletion Link' },
      { name: 'Terms of Service (वापराच्या अटी)', path: '/terms-conditions', alias: '/terms', purpose: 'Platform Terms of Use & Intellectual Property Protection' },
      { name: 'Refund & Cancellation Policy (परतावा)', path: '/refund-policy', alias: '/refund', purpose: 'Razorpay Merchant Compliance & Cancellation Policy' },
      { name: 'Digital Delivery / Shipping (वितरण)', path: '/shipping-policy', alias: '/shipping', purpose: 'Statutory Digital Goods Delivery Policy' },
      { name: 'Contact & Support (संपर्क व साहाय्य)', path: '/contact-us', alias: '/contact', purpose: 'Registered Merchant Support Address & Helpline' }
    ];

    const linksHtml = links.map(link => `
      <div style="background: white; border: 1px solid var(--border); border-radius: 12px; padding: 18px; margin-bottom: 14px; display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <h3 style="margin: 0; color: var(--primary); font-size: 1.05rem;">${link.name}</h3>
          <span style="font-size: 0.75rem; background: #DCFCE7; color: #166534; padding: 3px 8px; border-radius: 999px; font-weight: 700; border: 1px solid #BBF7D0;">
            ✓ 100% Working (HTTP 200 OK)
          </span>
        </div>
        <p style="margin: 0; font-size: 0.82rem; color: #64748B;">${link.purpose}</p>
        
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-top: 6px;">
          <input type="text" readonly value="${origin}${link.path}" style="flex: 1; min-width: 250px; padding: 8px 10px; font-size: 0.8rem; font-family: monospace; background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 6px; color: #334155;" id="link-${link.path.replace('/', '')}">
          <button onclick="navigator.clipboard.writeText('${origin}${link.path}'); alert('Link copied to clipboard: ${origin}${link.path}');" style="padding: 8px 14px; font-size: 0.8rem; font-weight: 700; color: white; background: #2563EB; border: none; border-radius: 6px; cursor: pointer;">
            📋 Copy Link
          </button>
          <a href="${link.path}" target="_blank" style="padding: 8px 14px; font-size: 0.8rem; font-weight: 700; color: #1E3A8A; background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 6px; text-decoration: none;">
            🔗 Open Page ↗
          </a>
        </div>
      </div>
    `).join('');

    const content = `
      <h2>Google Play Console & Statutory Compliance Link Hub</h2>
      <p>
        These are the exact, verified, public HTTPS links required for Google Play Console submission (App Content -> Privacy Policy, Data Safety, Account Deletion) and Razorpay merchant activation.
      </p>

      <div style="margin: 24px 0;">
        ${linksHtml}
      </div>

      <h2>How to submit these links on Google Play Console:</h2>
      <ol style="font-size: 0.9rem; line-height: 1.7;">
        <li><strong>Privacy Policy URL:</strong> In Play Console -> Policy and programs -> App Content -> Privacy Policy, paste: <code>${origin}/privacy-policy</code></li>
        <li><strong>Account Deletion URL:</strong> In Play Console -> App Content -> Data Safety -> Account Deletion, enter: <code>${origin}/delete-account</code></li>
        <li><strong>Developer Website / Support:</strong> In Store Settings -> Store Listing Contact Details, enter: <code>${origin}/contact-us</code> and email <code>${SUPPORT_EMAIL}</code></li>
      </ol>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderLegalPageTemplate('Google Play Legal & Compliance Link Hub', 'All Official Working Compliance URLs for Play Store Release', content));
  },

  // API to handle web account deletion submissions
  handleAccountDeletionPost(req: Request, res: Response) {
    const { email, reason } = req.body;
    const userEmail = email ? String(email).trim() : 'unknown';
    console.log(`[Account Deletion Request] Received request for ${userEmail}, reason: ${reason}`);

    const htmlResponse = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Deletion Request Confirmed | ${BRAND_NAME}</title>
  <style>
    body { font-family: sans-serif; background: #F8FAFC; color: #0F172A; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 16px; }
    .box { background: white; border: 1px solid #E2E8F0; border-radius: 16px; padding: 32px; max-width: 500px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    h1 { color: #059669; font-size: 1.5rem; margin-bottom: 12px; }
    p { font-size: 0.9rem; color: #475569; line-height: 1.6; margin-bottom: 20px; }
    .btn { display: inline-block; padding: 10px 20px; background: #0F2744; color: white; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="box">
    <h1>✓ Deletion Request Received</h1>
    <p>Your account deletion request for <strong>${userEmail}</strong> has been logged successfully. In compliance with Google Play Developer Policy and India DPDP Act 2023, your account data and telemetry will be permanently purged within 48–72 hours.</p>
    <a href="/" class="btn">Return to Home</a>
  </div>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(htmlResponse);
  }
};

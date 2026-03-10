# 📋 Project Requirements Document
## Job Referral Platform — Simple & Hassle-Free

**Version:** 1.0  
**Date:** March 2026  
**Status:** Draft

---

## 1. Overview

A lightweight job referral platform that connects **employees (Referrers)** at companies with **job seekers**. The core promise is simplicity — referrers post opportunities, job seekers apply with their resume, and the referral happens with minimal friction on both sides.

---

## 2. Goals & Principles

- **Simple first:** Every feature must justify its existence. If it adds confusion, it's cut.
- **Minimal steps:** Both user types should be able to complete their core action in under 5 minutes.
- **No noise:** No unnecessary notifications, fields, or screens.
- **Trust by default:** Lightweight verification rather than heavy gatekeeping.

---

## 3. User Types

| User Type | Who They Are | Core Goal |
|-----------|--------------|-----------|
| **Referrer** | A current employee at a company | Post a referral opportunity and find a good candidate to refer internally |
| **Job Seeker** | Someone actively looking for a job | Find a referral at a company they want to join |

---

## 4. Feature Requirements

### 4.1 Authentication & Onboarding

**For Both User Types:**
- Sign up with email & password, or via Google / LinkedIn OAuth
- Choose role on sign-up: *"I want to refer someone"* or *"I'm looking for a job"*
- Simple onboarding — 3 screens max before the user reaches the dashboard

**For Referrers:**
- Verify company affiliation via work email (e.g. `name@company.com`)
- Display a **Verified Employee** badge on their profile once confirmed

**For Job Seekers:**
- No verification required — just sign up and go

---

### 4.2 Referrer Profile

A minimal profile that establishes credibility:

- Full name
- Current company & job title
- LinkedIn profile link *(optional)*
- Short bio *(optional, 150 chars max)*
- Verified Employee badge *(auto-applied after email verification)*

---

### 4.3 Job Seeker Profile

A simple profile that acts as a lightweight resume:

- Full name
- Current or most recent job title
- Key skills *(tag-based, select from a list)*
- Resume upload *(PDF only, max 5MB)*
- LinkedIn profile link *(optional)*
- Preferred role & location *(used for matching)*

---

### 4.4 Referral Listings (Referrer Posts)

Referrers can post a referral opportunity with the following fields:

| Field | Required | Notes |
|-------|----------|-------|
| Company name | Yes | Auto-filled from profile |
| Job title / Role | Yes | Free text |
| Job location | Yes | City / Remote / Hybrid |
| Role type | Yes | Full-time / Part-time / Contract |
| What they're looking for | Yes | Short description, 300 chars max |
| Required experience level | Yes | Entry / Mid / Senior |
| Application deadline | No | Optional date picker |

- Referrers can have a maximum of **3 active listings** at a time
- Listings auto-expire after **60 days** if no deadline is set

---

### 4.5 Applying for a Referral (Job Seeker Actions)

Job seekers can apply to a referral listing with:

- A single click to **"Request Referral"**
- Auto-attach their uploaded resume
- A short note to the referrer *(optional, 200 chars max)*

**Application rules:**
- Job seekers can apply to a maximum of **10 referrals per month** *(free tier)*
- No duplicate applications to the same listing

---

### 4.6 Browse & Search

**For Job Seekers — Browse Listings:**
- Filter by: Role / Company / Location / Experience Level
- Sort by: Most Recent / Deadline Soon
- Search bar for role or company name

**For Referrers — Browse Applicants:**
- View a list of job seekers who have applied to their listing
- See applicant name, current role, skills, and resume in one view
- No complex scoring — just a simple list

---

### 4.7 Application Management

**Referrer Dashboard:**
- View all active listings and number of applicants per listing
- For each applicant: view profile + download resume
- Take action on each applicant:
  - ✅ **Accept** — signals intent to refer
  - ❌ **Decline** — removes from active list
  - 🔖 **Save** — bookmark for later review

**Job Seeker Dashboard:**
- View all referrals applied to
- See real-time status per application:
  - `Applied` → `Viewed` → `Accepted` / `Declined`

---

### 4.8 Notifications

Keep notifications minimal and purposeful:

| Trigger | Who Gets Notified | Channel |
|--------|-------------------|---------|
| New applicant on listing | Referrer | Email + In-app |
| Application status changed | Job Seeker | Email + In-app |
| Listing about to expire (7 days) | Referrer | Email |
| Referral accepted | Job Seeker | Email + In-app |

- No daily digests or marketing emails by default
- Users can opt out of email notifications in settings

---

### 4.9 In-App Messaging

A simple, one-to-one direct message between Referrer and Job Seeker:

- Unlocked only **after a referrer accepts** an applicant
- Text-only messages *(no file attachments)*
- No group chats, no threads — just a simple inbox

---

### 4.10 Trust & Safety (Lightweight)

- Work email verification for referrers *(required)*
- Job seekers can **report** a listing as fake or misleading
- Referrers can **block** a job seeker
- Admin review queue for flagged content

---

### 4.11 Admin Panel (Internal Use)

A simple back-office panel for the platform team:

- View and manage all users (referrers + job seekers)
- Remove or suspend accounts
- Moderate flagged listings and reports
- View platform-level metrics:
  - Total active users
  - Total listings posted
  - Total referrals accepted

---

## 5. What We Are NOT Building (MVP Scope)

To keep the product simple, the following are explicitly **out of scope** for V1:

- ❌ AI-powered matching or recommendations
- ❌ Video profiles or video cover letters
- ❌ Company profiles / employer branding pages
- ❌ Subscription plans or payments
- ❌ Mobile app (web-first only)
- ❌ Multi-language support
- ❌ Calendar / interview scheduling integration
- ❌ Public referrer reviews or ratings

---

## 6. User Flows

### Referrer Flow
```
Sign Up → Verify Work Email → Complete Profile → Post Referral Listing
→ Receive Applicants → Review Resumes → Accept / Decline → Message Accepted Applicant
```

### Job Seeker Flow
```
Sign Up → Upload Resume → Complete Profile → Browse Listings
→ Request Referral → Track Status → Chat with Referrer (if accepted)
```

---

## 7. Technical Requirements

| Area | Requirement |
|------|-------------|
| Platform | Web (responsive, mobile-friendly) |
| Resume upload | PDF only, max 5MB |
| Authentication | Email/password + OAuth (Google, LinkedIn) |
| Notifications | In-app + Email |
| Data privacy | GDPR-compliant; users can delete their account and data |
| Uptime | 99.5% target |

---

## 8. Success Metrics (KPIs)

| Metric | Target (First 6 Months) |
|--------|--------------------------|
| Registered referrers | 500+ |
| Registered job seekers | 5,000+ |
| Active listings at any time | 300+ |
| Referral acceptance rate | ≥ 20% |
| Time-to-first-action (new user) | < 5 minutes |

---

## 9. Open Questions

- [ ] Should referrers be able to invite specific job seekers to apply?
- [ ] Do we allow job seekers to share their profile publicly (shareable link)?
- [ ] What happens when a referral results in a hire — do we track outcomes?
- [ ] Should listing approval be instant or manually reviewed before going live?

---

*Document maintained by the Product Team. Last updated: March 2026.*

# 🧪 QA & Testing Interview Preparation

> Complete guide for QA interviews covering Jira, testing tools, methodologies, and hands-on examples

---

## 📋 Table of Contents
1. [QA Fundamentals](#qa-fundamentals)
2. [Jira & Project Management](#jira--project-management)
3. [Testing Types](#testing-types)
4. [Testing Tools](#testing-tools)
5. [Test Cases for Findkar](#test-cases-for-findkar)
6. [Bug Reporting](#bug-reporting)
7. [Interview Q&A](#interview-qa)

---

## 🎯 QA Fundamentals

### What is QA?
**Quality Assurance** ensures software meets requirements and works correctly before release.

### QA vs QC vs Testing
| Term | Meaning | Focus |
|------|---------|-------|
| QA | Quality Assurance | Process-oriented, prevention |
| QC | Quality Control | Product-oriented, detection |
| Testing | Executing tests | Finding bugs |

### SDLC (Software Development Life Cycle)
```
Requirements → Design → Development → Testing → Deployment → Maintenance
```

### STLC (Software Testing Life Cycle)
```
Requirement Analysis → Test Planning → Test Case Development → 
Environment Setup → Test Execution → Test Closure
```

---

## 📊 Jira & Project Management

### What is Jira?
Project management tool by Atlassian for tracking issues, bugs, and tasks.

### Jira Terminology
| Term | Meaning | Example |
|------|---------|---------|
| **Epic** | Large feature | "User Authentication" |
| **Story** | User requirement | "As a user, I want to login" |
| **Task** | Work item | "Create login page UI" |
| **Bug** | Defect | "Login button not working" |
| **Sprint** | Time-boxed iteration | "Sprint 1 (2 weeks)" |
| **Backlog** | List of pending items | All unfinished stories |

### Jira Workflow
```
Open → In Progress → Code Review → Testing → Done
```

### Bug Lifecycle in Jira
```
New → Assigned → In Progress → Fixed → 
Verification → Closed/Reopened
```

### Jira Fields for Bug Report
```
Summary: Login button not responding on mobile
Description: Steps to reproduce...
Priority: High
Severity: Critical
Assignee: Developer name
Reporter: QA name
Environment: Chrome, Android 12
Attachments: Screenshot, video
```

### Jira Query Language (JQL)
```sql
-- Find all open bugs
status = "Open" AND type = Bug

-- Find my assigned tasks
assignee = currentUser()

-- Find high priority bugs
priority in (High, Critical) AND type = Bug

-- Find bugs created this week
created >= startOfWeek()
```

---

## 🔬 Testing Types

### 1. Unit Testing
**What:** Testing individual functions/components
**Who:** Developers
**Tools:** Jest, Vitest, Mocha

```javascript
// Example: Testing distance calculation
test("calculateDistance returns correct distance", () => {
  const distance = calculateDistance(19.07, 72.88, 19.08, 72.89)
  expect(distance).toBeCloseTo(1.5, 1)
})
```

### 2. Integration Testing
**What:** Testing modules working together
**Who:** Dev/QA
**Tools:** Jest, Supertest

```javascript
// Example: Testing API with database
test("GET /api/vendors returns vendors", async () => {
  const response = await request(app).get("/api/vendors")
  expect(response.status).toBe(200)
  expect(response.body).toHaveLength(10)
})
```

### 3. Functional Testing
**What:** Testing features work as expected
**Who:** QA
**Tools:** Manual, Selenium, Playwright

```
Test: User Login
Steps:
1. Open /login
2. Click "Continue with Google"
3. Enter credentials
4. Submit
Expected: Redirected to /user/dashboard
```

### 4. UI/UX Testing
**What:** Testing interface and user experience
**Who:** QA
**Focus:** Layout, colors, responsiveness, usability

### 5. Regression Testing
**What:** Re-testing after changes
**Why:** Ensure new code doesn't break existing features

### 6. Smoke Testing
**What:** Basic tests to check app runs
**When:** After new build, before detailed testing

### 7. Sanity Testing
**What:** Quick test on specific feature
**When:** After bug fix, limited time

### 8. Performance Testing
**What:** Testing speed, load, stress
**Tools:** JMeter, k6, Lighthouse

### 9. Security Testing
**What:** Finding vulnerabilities
**Tools:** OWASP ZAP, Burp Suite
**Examples:** SQL injection, XSS, CSRF

### 10. Mobile Testing
**What:** Testing on mobile devices
**Focus:** Responsive design, touch, gestures

### 11. Cross-Browser Testing
**What:** Testing on different browsers
**Tools:** BrowserStack, Sauce Labs
**Browsers:** Chrome, Firefox, Safari, Edge

### 12. API Testing
**What:** Testing backend APIs
**Tools:** Postman, Insomnia, REST Client

---

## 🛠️ Testing Tools

### Manual Testing Tools
| Tool | Purpose |
|------|---------|
| **Jira** | Issue/bug tracking |
| **TestRail** | Test case management |
| **Zephyr** | Test management for Jira |
| **Confluence** | Documentation |
| **Trello** | Simple task boards |

### Automation Tools
| Tool | Type | Language |
|------|------|----------|
| **Selenium** | Web automation | Java, Python, JS |
| **Playwright** | Modern web testing | JS, Python |
| **Cypress** | E2E testing | JavaScript |
| **Appium** | Mobile automation | Java, JS |
| **Jest** | Unit testing | JavaScript |
| **Postman** | API testing | - |

### Performance Tools
| Tool | Purpose |
|------|---------|
| **JMeter** | Load testing |
| **k6** | Performance testing |
| **Lighthouse** | Web performance |
| **GTmetrix** | Page speed |

### Browser DevTools
| Feature | Purpose |
|---------|---------|
| **Elements** | Inspect HTML/CSS |
| **Console** | JavaScript logs/errors |
| **Network** | API calls, loading |
| **Performance** | Page speed analysis |
| **Application** | Storage, cookies |

---

## 📝 Test Cases for Findkar

### TC001: User Login
```
Test Case ID: TC001
Title: User Login with Google
Priority: High
Precondition: User has Google account

Steps:
1. Navigate to /login
2. Click "Continue with Google"
3. Select Google account
4. Allow permissions

Expected Result: 
- User redirected to /user/dashboard
- User session created

Actual Result: [Fill during testing]
Status: Pass/Fail
```

### TC002: Vendor Status Toggle
```
Test Case ID: TC002
Title: Vendor can toggle OPEN/CLOSE status
Priority: Critical
Precondition: Vendor link exists

Steps:
1. Open /v/{vendor_key}
2. Verify current status shown
3. Click toggle button
4. Observe status change

Expected Result:
- Status changes immediately
- Hindi voice plays
- Database updated

Test Data: 
- Vendor key: abc123xyz
```

### TC003: Location Permission
```
Test Case ID: TC003
Title: App requests location permission
Priority: High

Steps:
1. Login as new user
2. Navigate to /user/dashboard
3. Observe permission popup

Expected Result:
- Browser shows location permission
- If allowed: Shows distance to vendors
- If denied: Shows vendors without distance
```

### TC004: Search Functionality
```
Test Case ID: TC004
Title: Search vendors by name/category
Priority: Medium

Steps:
1. Open /user/dashboard
2. Type "chai" in search
3. Observe results

Expected Result:
- Only vendors with "chai" shown
- Case-insensitive search
- Instant filtering (no reload)
```

### TC005: Rating System
```
Test Case ID: TC005
Title: User can rate vendor
Priority: Medium

Steps:
1. Open vendor detail page
2. Click on star rating
3. Select 4 stars
4. Observe confirmation

Expected Result:
- Rating saved
- Average rating updated
- User can update rating
```

### TC006: Offline Handling
```
Test Case ID: TC006
Title: App shows offline banner
Priority: Low

Steps:
1. Open app normally
2. Turn off internet
3. Observe UI change

Expected Result:
- Orange "You're offline" banner
- App still shows cached data
- Retry button available
```

### TC007: Admin Add Vendor
```
Test Case ID: TC007
Title: Admin can add new vendor
Priority: High
Precondition: Logged in as admin

Steps:
1. Open /admin/add
2. Enter vendor name
3. Select category
4. Get location
5. Add menu items
6. Click "Add Vendor"

Expected Result:
- Vendor created in database
- Secret key generated
- Redirected to /admin
```

---

## 🐛 Bug Reporting

### Good Bug Report Template
```
Title: [Module] Brief description of issue

Environment:
- Device: iPhone 13
- OS: iOS 16.1
- Browser: Safari 16
- App Version: 1.0.0

Steps to Reproduce:
1. Login to app
2. Navigate to /user/dashboard
3. Click on first vendor
4. Click "Get Directions"

Expected Result:
Google Maps should open with directions

Actual Result:
Nothing happens, button appears frozen

Severity: High
Priority: High

Attachments:
- screenshot.png
- console_error.txt
- video.mp4
```

### Severity vs Priority
| Severity | Priority | Example |
|----------|----------|---------|
| Critical | High | App crashes on login |
| High | High | Cannot save rating |
| Medium | Medium | Text overflow on mobile |
| Low | Low | Typo in description |

---

## ❓ Interview Q&A

### Basic Questions

**Q1: What is the difference between QA and Testing?**
A: QA is process-focused (prevention), Testing is product-focused (detection). QA ensures quality throughout development, Testing finds bugs in the product.

**Q2: What is a test case?**
A: A document with steps to verify a feature works correctly. Contains: ID, title, steps, expected result, actual result, status.

**Q3: What is regression testing?**
A: Re-running tests after code changes to ensure existing features still work. Done after bug fixes or new features.

**Q4: What is smoke testing?**
A: Quick basic tests to verify app runs. Like checking if a car starts before a road test. Done after new builds.

**Q5: What is the bug lifecycle?**
A: New → Assigned → In Progress → Fixed → Verification → Closed/Reopened

### Jira Questions

**Q6: What is a Sprint?**
A: Time-boxed iteration (usually 2 weeks) where team completes selected work items.

**Q7: What is the difference between Epic, Story, and Task?**
A: 
- Epic: Large feature (multiple sprints)
- Story: User requirement (fits in sprint)
- Task: Technical work item

**Q8: Write a JQL query for open bugs assigned to you**
A: `assignee = currentUser() AND type = Bug AND status = Open`

### Technical Questions

**Q9: What tools have you used for API testing?**
A: Postman for manual testing, Jest/Supertest for automation. Verify status codes, response body, headers.

**Q10: How do you test responsive design?**
A: 
1. Browser DevTools responsive mode
2. Real devices (iPhone, Android)
3. BrowserStack for multiple devices
4. Check breakpoints: 320px, 768px, 1024px

**Q11: What is localstorage testing?**
A: Verify data stored in browser persists. Open DevTools → Application → Local Storage. Check after refresh.

**Q12: How do you test login functionality?**
A:
- Valid credentials → Success
- Invalid password → Error message
- Empty fields → Validation error
- SQL injection → Should be blocked
- Session persistence → Check after refresh

### Scenario Questions

**Q13: App works in Chrome but not Safari. What do you do?**
A:
1. Check browser console for errors
2. Identify CSS/JS compatibility issues
3. Check Can I Use for feature support
4. Report with browser-specific details
5. Suggest polyfill or alternative

**Q14: Found a critical bug before release. What do you do?**
A:
1. Document immediately with screenshots
2. Report in Jira with Critical priority
3. Notify team lead/PM immediately
4. Block release if necessary
5. Help developers reproduce

**Q15: How do you prioritize test cases?**
A:
1. Critical features first (login, payments)
2. Frequently used features
3. Recent changes/bug fixes
4. Edge cases
5. Low-risk features last

### Automation Questions

**Q16: When should you automate tests?**
A:
- Repeated tests (regression)
- Stable features
- Data-driven tests
- Time-consuming manual tests

**Q17: When NOT to automate?**
A:
- One-time tests
- Frequently changing features
- UI still in design phase
- Low-priority features

**Q18: What is Page Object Model (POM)?**
A: Design pattern where each page has a class with locators and methods. Makes tests maintainable and reusable.

```javascript
// Page Object
class LoginPage {
  emailInput = "#email"
  passwordInput = "#password"
  submitButton = "#submit"
  
  async login(email, password) {
    await page.fill(this.emailInput, email)
    await page.fill(this.passwordInput, password)
    await page.click(this.submitButton)
  }
}
```

---

## 📊 Testing Metrics

### Common Metrics
| Metric | Formula |
|--------|---------|
| Test Coverage | (Tests executed / Total tests) × 100 |
| Defect Density | Bugs / Lines of code |
| Pass Rate | (Passed tests / Total tests) × 100 |
| Defect Leakage | (Bugs in prod / Total bugs) × 100 |

---

## ✅ Quick Checklist Before Interview

- [ ] Know SDLC and STLC
- [ ] Explain testing types (Unit, Integration, E2E)
- [ ] Jira workflow and JQL basics
- [ ] Bug lifecycle and reporting
- [ ] Difference between severity and priority
- [ ] Name 5+ testing tools
- [ ] Write a test case
- [ ] Explain automation concepts
- [ ] API testing basics (Postman)
- [ ] Mobile/responsive testing approach

---

*Good luck with your QA interview! 🚀*

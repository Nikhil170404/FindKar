# 🎯 7-Day QA Interview Crash Course - Get Job Ready!

> Complete preparation guide with 100+ questions, tools mastery, and daily study plan

---

## 📅 7-Day Study Plan

| Day | Focus Area | Hours |
|-----|------------|-------|
| 1 | QA Fundamentals & SDLC/STLC | 4-5 hrs |
| 2 | Testing Types (Manual Testing) | 4-5 hrs |
| 3 | Test Case Writing & Bug Reporting | 4-5 hrs |
| 4 | Jira & Agile/Scrum | 4-5 hrs |
| 5 | Automation Concepts & Selenium | 4-5 hrs |
| 6 | API Testing & Performance | 4-5 hrs |
| 7 | Mock Interviews & Revision | 4-5 hrs |

---

# 📖 DAY 1: QA Fundamentals

## Core Concepts

### Q1: What is software testing?
**A:** Process of evaluating software to find bugs and verify it meets requirements. Goal is to ensure quality before release.

### Q2: Why is testing important?
**A:** 
- Finds bugs early (cheaper to fix)
- Ensures software works correctly
- Builds user trust
- Saves money and reputation
- Legal compliance (banking, healthcare)

### Q3: What is the difference between QA, QC, and Testing?
**A:**
| QA (Assurance) | QC (Control) | Testing |
|----------------|--------------|---------|
| Process-focused | Product-focused | Finding defects |
| Prevention | Detection | Execution |
| Entire lifecycle | After development | During testing phase |
| "Are we building it right?" | "Is it built right?" | "Does it work?" |

### Q4: Explain SDLC (Software Development Life Cycle)
**A:** Phases:
1. **Requirements** - What to build
2. **Design** - How to build
3. **Development** - Building it
4. **Testing** - Verify it works
5. **Deployment** - Release to users
6. **Maintenance** - Bug fixes, updates

### Q5: Explain STLC (Software Testing Life Cycle)
**A:** Testing-specific phases:
1. **Requirement Analysis** - Understand what to test
2. **Test Planning** - Strategy, resources, timeline
3. **Test Case Development** - Write test cases
4. **Environment Setup** - Prepare testing environment
5. **Test Execution** - Run tests, log bugs
6. **Test Closure** - Reports, sign-off

### Q6: What is Verification vs Validation?
**A:**
| Verification | Validation |
|--------------|------------|
| "Are we building it RIGHT?" | "Are we building the RIGHT product?" |
| Static testing (no execution) | Dynamic testing (execution) |
| Reviews, inspections | Actual testing |
| Process-oriented | Product-oriented |

### Q7: What is a Defect Life Cycle?
**A:**
```
New → Open → Assigned → In Progress → Fixed → 
Verification → Closed (or Reopened if not fixed)
```

### Q8: Difference between Bug, Defect, Error, Failure?
**A:**
- **Error:** Mistake made by developer
- **Bug/Defect:** Error found in code
- **Failure:** Bug causes system to fail in production

---

# 📖 DAY 2: Testing Types

## Manual Testing Questions

### Q9: What are types of testing?
**A:**
**By Knowledge:**
- Black Box - No code access
- White Box - With code access
- Grey Box - Partial code access

**By Level:**
- Unit Testing
- Integration Testing
- System Testing
- UAT (User Acceptance Testing)

**By Purpose:**
- Functional
- Non-Functional (Performance, Security)
- Regression
- Smoke/Sanity

### Q10: What is Black Box Testing?
**A:** Testing without seeing internal code. Tester only checks inputs and outputs. 
**Example:** Testing login - enter email/password, check if login works.
**Techniques:** Equivalence Partitioning, Boundary Value Analysis, Decision Table

### Q11: What is White Box Testing?
**A:** Testing with code access. Check internal logic, code paths, loops.
**Techniques:** Statement Coverage, Branch Coverage, Path Coverage

### Q12: What is Smoke Testing?
**A:** Quick basic tests to check if build is stable enough for detailed testing. Like a "sanity check" - basic features work.
**When:** After new build, before regression testing
**Example:** Can app open? Can user login? Basic navigation works?

### Q13: What is Sanity Testing?
**A:** Quick focused testing on specific functionality after minor changes.
**When:** After bug fix, late in cycle
**Example:** Login bug fixed - only test login, not entire app

### Q14: Smoke vs Sanity Testing?
**A:**
| Smoke | Sanity |
|-------|--------|
| Broad, shallow | Narrow, deep |
| New build | After changes |
| Scripted | Unscripted |
| Build verification | Change verification |

### Q15: What is Regression Testing?
**A:** Re-testing existing features after code changes to ensure they still work.
**When:** After bug fixes, new features, code changes
**Why:** New code might break existing features

### Q16: What is Retesting?
**A:** Testing same functionality again after bug is fixed to verify fix works.
**Difference from Regression:** Retesting = same bug. Regression = related features.

### Q17: What is Integration Testing?
**A:** Testing how modules work together.
**Approaches:**
- Big Bang - All at once
- Top-Down - Start from top modules
- Bottom-Up - Start from bottom modules
- Sandwich/Hybrid - Both directions

### Q18: What is System Testing?
**A:** Testing complete integrated system as a whole. End-to-end testing to verify requirements.

### Q19: What is UAT (User Acceptance Testing)?
**A:** Final testing by end users/business to verify software meets their needs.
**Types:** Alpha Testing (internal), Beta Testing (external users)

### Q20: What is Exploratory Testing?
**A:** Simultaneous learning, test design, and execution. Tester explores app freely without predefined test cases.
**When:** Limited time, early stage, finding edge cases

---

# 📖 DAY 3: Test Cases & Bug Reporting

## Test Case Writing

### Q21: What is a Test Case?
**A:** Document with steps to verify a feature works correctly.

### Q22: What are components of a Test Case?
**A:**
```
Test Case ID: TC001
Title: User Login with valid credentials
Priority: High
Preconditions: User account exists

Steps:
1. Open login page
2. Enter valid email
3. Enter valid password
4. Click Login button

Expected Result: User redirected to dashboard
Actual Result: [Fill during execution]
Status: Pass/Fail
```

### Q23: What are Test Case Design Techniques?
**A:**
1. **Equivalence Partitioning** - Divide inputs into groups, test one from each
2. **Boundary Value Analysis** - Test at boundaries (min, max, min-1, max+1)
3. **Decision Table** - Test combinations of conditions
4. **State Transition** - Test different states and transitions
5. **Error Guessing** - Based on experience

### Q24: Example of Equivalence Partitioning
**A:** Age field accepts 18-60
- Valid: 18-60 (test: 30)
- Invalid: <18 (test: 15)
- Invalid: >60 (test: 70)

### Q25: Example of Boundary Value Analysis
**A:** Age field accepts 18-60
Test: 17, 18, 19, 59, 60, 61

### Q26: How to prioritize test cases?
**A:**
1. Critical business flows (login, payments)
2. Frequently used features
3. Complex features
4. Recent changes
5. Edge cases
6. Low-risk features

## Bug Reporting

### Q27: What is a good bug report?
**A:**
```
Title: [Login] Error message not shown for wrong password

Environment:
- Browser: Chrome 120
- OS: Windows 11
- Device: Desktop

Steps to Reproduce:
1. Go to login page
2. Enter valid email
3. Enter wrong password
4. Click Login

Expected: Error message "Invalid password"
Actual: Page just refreshes, no error

Severity: Medium
Priority: High

Attachments: screenshot.png, console_log.txt
```

### Q28: Severity vs Priority?
**A:**
| Severity (Impact) | Priority (Urgency) |
|-------------------|-------------------|
| How bad is it? | How soon to fix? |
| Low/Medium/High/Critical | Low/Medium/High |
| Set by QA | Set by PM/Business |

**Examples:**
| Case | Severity | Priority |
|------|----------|----------|
| App crashes on payment | Critical | High |
| Typo in homepage | Low | High (visible to all) |
| Crash in rare feature | High | Low |
| Wrong color in admin | Low | Low |

### Q29: Bug Life Cycle stages?
**A:**
1. **New** - Reported by QA
2. **Open** - Accepted by lead
3. **Assigned** - Given to developer
4. **In Progress** - Being fixed
5. **Fixed** - Developer done
6. **Retest** - QA verifies fix
7. **Closed** - Bug resolved
8. **Reopened** - If not actually fixed
9. **Deferred** - Postponed to later
10. **Rejected** - Not a bug / Won't fix

---

# 📖 DAY 4: Jira & Agile

## Jira Mastery

### Q30: What is Jira?
**A:** Project management tool by Atlassian for tracking issues, bugs, and tasks. Popular in Agile teams.

### Q31: Jira Issue Types?
**A:**
- **Epic** - Large feature (multiple sprints)
- **Story** - User requirement ("As a user, I want...")
- **Task** - Work item
- **Bug** - Defect
- **Subtask** - Part of larger task

### Q32: Jira Workflow?
**A:** 
```
To Do → In Progress → Code Review → Testing → Done
```
(Can be customized per project)

### Q33: What is JQL?
**A:** Jira Query Language - SQL-like syntax to search issues.

**Common JQL queries:**
```sql
-- My open bugs
assignee = currentUser() AND type = Bug AND status != Done

-- High priority bugs this sprint
priority = High AND type = Bug AND sprint in openSprints()

-- Bugs created this week
type = Bug AND created >= startOfWeek()

-- Unassigned tasks
assignee is EMPTY AND type = Task

-- Bugs in specific project
project = "FINDKAR" AND type = Bug

-- Resolved bugs for retesting
type = Bug AND status = "Ready for Retest"
```

### Q34: Jira Reports?
**A:**
- Burndown Chart - Work remaining in sprint
- Velocity Chart - Team's story points over time
- Sprint Report - Completed vs planned
- Created vs Resolved - Bug trends

### Q35: How to log a bug in Jira?
**A:**
1. Click "Create" button
2. Select project
3. Issue type = "Bug"
4. Fill Summary, Description, Steps
5. Set Priority, Severity
6. Add Attachments
7. Assign to developer or leave unassigned
8. Click "Create"

## Agile/Scrum

### Q36: What is Agile?
**A:** Iterative software development approach with:
- Short cycles (sprints)
- Frequent delivery
- Collaboration
- Flexibility to change

### Q37: What is Scrum?
**A:** Agile framework with:
- **Sprint** - 2-4 week cycle
- **Daily Standup** - 15-min meeting
- **Sprint Planning** - Plan sprint work
- **Sprint Review** - Demo to stakeholders
- **Retrospective** - Improve process

### Q38: Scrum Roles?
**A:**
- **Product Owner** - Defines requirements, priorities
- **Scrum Master** - Facilitates, removes blockers
- **Development Team** - Builds product (includes QA)

### Q39: What is a Sprint?
**A:** Fixed time period (usually 2 weeks) where team completes selected work items.

### Q40: What is a User Story?
**A:** Requirement written from user's perspective.
**Format:** "As a [user], I want to [action] so that [benefit]"
**Example:** "As a customer, I want to reset my password so that I can regain account access"

### Q41: What is Definition of Done (DoD)?
**A:** Checklist of criteria for a task to be considered complete.
**Example:**
- Code written and reviewed
- Unit tests passed
- QA testing passed
- Documentation updated
- Deployed to staging

---

# 📖 DAY 5: Automation Basics

## Automation Concepts

### Q42: What is Test Automation?
**A:** Using tools/scripts to run tests automatically instead of manually.

### Q43: When to automate?
**A:**
✅ Automate:
- Regression tests (repeated)
- Smoke tests (every build)
- Data-driven tests (same steps, different data)
- Cross-browser testing
- Performance testing

❌ Don't automate:
- One-time tests
- UI still changing
- Complex scenarios needing human judgment
- Exploratory testing

### Q44: Automation Testing Tools?
**A:**
| Tool | Use Case |
|------|----------|
| Selenium | Web automation |
| Playwright | Modern web testing |
| Cypress | E2E testing |
| Appium | Mobile testing |
| JMeter | Performance |
| Postman | API testing |
| Jest | Unit testing |

### Q45: What is Selenium?
**A:** Open-source web automation tool. Supports multiple languages (Java, Python, JS) and browsers.

### Q46: Selenium WebDriver vs Selenium RC?
**A:** 
- RC (old) - Uses server, slower
- WebDriver (current) - Direct browser control, faster

### Q47: What is Page Object Model (POM)?
**A:** Design pattern where each page has its own class with locators and methods.

**Why:** Maintainability, reusability, cleaner code

```javascript
// Page Object
class LoginPage {
  // Locators
  emailInput = "#email"
  passwordInput = "#password"
  submitBtn = "#submit"
  
  // Methods
  async login(email, password) {
    await page.fill(this.emailInput, email)
    await page.fill(this.passwordInput, password)
    await page.click(this.submitBtn)
  }
}

// Test
const loginPage = new LoginPage()
await loginPage.login("test@example.com", "password123")
```

### Q48: What is Test Automation Framework?
**A:** Structure/guidelines for automation testing.

**Types:**
- Data-Driven - Same script, different data from file
- Keyword-Driven - Actions as keywords (click, type, verify)
- Hybrid - Combination of above
- BDD (Cucumber) - Human-readable scenarios

### Q49: What are locators in Selenium?
**A:** Ways to find elements on page:
- ID - `#loginBtn`
- Name - `[name='email']`
- Class - `.btn-primary`
- XPath - `//button[@id='login']`
- CSS Selector - `button.login`

### Q50: XPath vs CSS Selector?
**A:**
| XPath | CSS |
|-------|-----|
| More powerful | Faster |
| Bidirectional (parent/child) | Only forward |
| Complex syntax | Simpler syntax |
| Better for dynamic content | Better for simple |

---

# 📖 DAY 6: API & Performance Testing

## API Testing

### Q51: What is API Testing?
**A:** Testing application's backend without UI. Direct requests to server, check responses.

### Q52: What is REST API?
**A:** Representational State Transfer - Web service architecture using HTTP methods:
- GET - Read data
- POST - Create data
- PUT - Update data
- DELETE - Delete data

### Q53: API Testing Tools?
**A:** Postman, Insomnia, REST Client (VS Code), curl

### Q54: How to test API in Postman?
**A:**
1. Create new request
2. Select method (GET/POST)
3. Enter URL
4. Add headers (if needed)
5. Add body (for POST)
6. Send request
7. Verify:
   - Status code (200, 201, 404)
   - Response body
   - Response time

### Q55: HTTP Status Codes?
**A:**
| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

### Q56: What to test in API?
**A:**
- Status codes correct
- Response format (JSON structure)
- Response data accurate
- Error handling
- Authentication
- Performance/response time
- Security (SQL injection, etc.)

## Performance Testing

### Q57: What is Performance Testing?
**A:** Testing speed, stability, scalability under load.

### Q58: Types of Performance Testing?
**A:**
- **Load Testing** - Normal expected load
- **Stress Testing** - Beyond normal limits
- **Spike Testing** - Sudden load increase
- **Endurance Testing** - Sustained load over time
- **Scalability Testing** - How system scales

### Q59: Performance Testing Tools?
**A:** JMeter, k6, LoadRunner, Gatling

### Q60: Key Performance Metrics?
**A:**
- Response Time - How fast?
- Throughput - Requests per second
- Error Rate - % of failed requests
- CPU/Memory usage - Server resources
- Concurrent Users - How many at once?

---

# 📖 DAY 7: Mock Interview & Revision

## Scenario-Based Questions

### Q61: How would you test a login page?
**A:**
**Functional:**
- Valid credentials → Success
- Invalid email → Error
- Invalid password → Error
- Empty fields → Validation error
- Remember me → Check cookie/session
- Forgot password → Link works

**Security:**
- SQL injection → Blocked
- XSS attack → Blocked
- Brute force → Account lockout

**UI:**
- Responsive on mobile
- Tab order correct
- Error messages clear

**Non-Functional:**
- Load time < 3 seconds
- Works on all browsers

### Q62: How would you test a search feature?
**A:**
- Empty search → Show message
- Valid search → Show results
- No results → "No results" message
- Special characters → Handled properly
- Long text → No overflow
- Case sensitivity → Ignore case
- Pagination → Works correctly
- Filters → Work with search

### Q63: You find a critical bug before release. What do you do?
**A:**
1. Document bug immediately with all details
2. Mark as Critical priority
3. Inform team lead and PM immediately
4. Help developer reproduce quickly
5. Recommend blocking release
6. Retest when fixed
7. Do smoke test before release

### Q64: Developer says "Works on my machine." What do you do?
**A:**
1. Don't argue, investigate together
2. Compare environments (browser, OS, data)
3. Screen share to show the bug
4. Provide exact steps to reproduce
5. Check test data differences
6. Document environment details
7. Collaborate, not blame

### Q65: Test cases are not ready but you need to start testing. What do you do?
**A:**
1. Start with exploratory testing
2. Use your domain knowledge
3. Create basic test cases while testing
4. Focus on critical flows first
5. Document findings for formal test cases
6. Communicate with team about status

## HR/Behavioral Questions

### Q66: Tell me about yourself (QA version)
**A:** "I'm a QA professional with [X] years of experience in manual and automation testing. I've worked on [web/mobile] applications using tools like Jira, Selenium, and Postman. I'm passionate about ensuring quality and have a keen eye for detail. My recent project was [Findkar - a real-time vendor discovery app] where I was responsible for end-to-end testing."

### Q67: Why QA? Why not development?
**A:** "I enjoy the investigative aspect of testing - finding issues others miss. I like being the last line of defense before software reaches users. QA requires a unique mindset of thinking about what could go wrong, which I find challenging and rewarding."

### Q68: Describe a challenging bug you found
**A:** Use STAR method:
- **Situation:** Working on [app], found intermittent bug
- **Task:** Needed to identify root cause
- **Action:** Documented pattern, tested different scenarios, found it occurred only with specific data
- **Result:** Helped developer fix quickly, prevented production issue

### Q69: How do you stay updated?
**A:**
- Follow QA blogs (Ministry of Testing)
- LinkedIn QA communities
- YouTube tutorials
- Practice on personal projects
- Attend webinars

### Q70: Any questions for us?
**A:** Always ask questions!
- "What does a typical day look like for QA here?"
- "What tools does your team use?"
- "What's the ratio of manual vs automation?"
- "How does QA collaborate with developers?"
- "What are the growth opportunities?"

---

# 🎯 Quick Revision Checklist

## Must Know Terms
- [ ] SDLC, STLC
- [ ] Black Box, White Box, Grey Box
- [ ] Smoke, Sanity, Regression
- [ ] Severity vs Priority
- [ ] Bug Life Cycle
- [ ] Test Case components
- [ ] JQL basics
- [ ] Agile/Scrum terms
- [ ] REST API methods
- [ ] Page Object Model

## Must Know Tools
- [ ] Jira - Bug tracking
- [ ] Postman - API testing
- [ ] Browser DevTools - Debug, network
- [ ] Selenium/Playwright - Automation
- [ ] Git - Version control basics

## Practical Skills
- [ ] Write a test case
- [ ] Write a bug report
- [ ] Write JQL query
- [ ] Test a login page
- [ ] Use Postman

---

# 📚 Resources

**Free Practice:**
- [Jira Free Version](https://www.atlassian.com/software/jira/free)
- [Postman](https://www.postman.com/)
- [Selenium IDE](https://www.selenium.dev/selenium-ide/)
- [BrowserStack Free Trial](https://www.browserstack.com/)

**Learning:**
- Ministry of Testing
- Guru99 Testing Tutorials
- ISTQB Syllabus (Foundation Level)

**Practice Apps:**
- SauceDemo (https://www.saucedemo.com)
- The Test Automation Playground
- Practice testing on ANY website

---

# ✅ Daily Checklist

## Day 1
- [ ] Read QA Fundamentals (Q1-Q8)
- [ ] Understand SDLC/STLC diagram
- [ ] Practice explaining to mirror

## Day 2
- [ ] Read Testing Types (Q9-Q20)
- [ ] Understand smoke vs sanity
- [ ] Know regression testing

## Day 3
- [ ] Write 5 test cases for a login page
- [ ] Write 3 bug reports
- [ ] Practice Boundary Value Analysis

## Day 4
- [ ] Create free Jira account
- [ ] Create project and bugs
- [ ] Write 5 JQL queries
- [ ] Understand Scrum roles

## Day 5
- [ ] Download Selenium IDE
- [ ] Record simple test
- [ ] Know POM concept
- [ ] Know when to automate

## Day 6
- [ ] Download Postman
- [ ] Test a public API
- [ ] Understand status codes
- [ ] Know performance testing types

## Day 7
- [ ] Answer all scenario questions out loud
- [ ] Do mock interview with friend
- [ ] Revise weak areas
- [ ] Prepare questions to ask

---

*You've got this! 🚀 Good luck with your interview!*

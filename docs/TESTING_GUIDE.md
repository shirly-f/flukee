# Flukee – Testing Guide

How to access and test the app, for QA testers and reviewers.

---

## Access links

| What | URL | Notes |
|------|-----|-------|
| **Web (browser)** | https://flukee-web.netlify.app | Works on any device |
| **Mobile (Add to Home Screen)** | Same URL, then: Browser menu → Add to Home Screen | Fullscreen app feel |

---

## Test accounts

| Role | Email | Password | Use for |
|------|-------|----------|---------|
| **Coach** | coach@test.com | password | Dashboard, create tasks, view trainees |
| **Trainee** | trainee@test.com | password | Tasks, submit responses, messages |

---

## Test scenarios

### 1. Coach flow

1. Log in as **coach@test.com**
2. Go to trainee list – see "Test Trainee"
3. Open "Test Trainee" → Create Task
4. Create task: title "Complete workout log", type "Text Response", prompt "Describe your workout"
5. Save and confirm task appears in the trainee overview

### 2. Trainee flow

1. Log out, then log in as **trainee@test.com**
2. See the task on "My practices"
3. Open the task, type a response, submit
4. Confirm status changes to "Completed"

### 3. Coach sees completion

1. Log in as coach again
2. Open "Test Trainee" – completed count should increase
3. Open the task and see the trainee’s response

---

## Native app testing

For the **native mobile app** (not web):

- **Android:** Developer builds an APK and shares the download link. See [NATIVE_APP_TESTING.md](./NATIVE_APP_TESTING.md).
- **iOS:** Use web + "Add to Home Screen", or TestFlight if the developer has set it up.

---

## Issues to check

- [ ] Login works for coach and trainee
- [ ] Coach can create tasks
- [ ] Trainee sees tasks
- [ ] Trainee can submit text responses
- [ ] Coach sees completed tasks and responses
- [ ] Page refresh doesn’t show "Page not found"
- [ ] Works on phone browser

---

## First run / cold start

The backend may take 30–60 seconds to start. If login fails at first, wait a moment and try again.

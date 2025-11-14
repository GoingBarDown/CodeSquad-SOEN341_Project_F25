# Meeting Minutes – Team Sync
**Date:** Nov 13, 2025

**Attendees:**  
- @sunidhi-16 (Sunidhi)  
- @noorkaazi3 (NJ)  
- @GriffinBonomo (Griffin)  
- @reemaaboudraz (Reema)  
- @Rimec100 (Romy)  
- @something67 (Patricia)  
- @GoingBarDown (Chandler)

---

## 1. Extra Feature: Event Countdown (Student Frontend)
- Implement a **countdown timer** for events students have purchased tickets for.  
- Countdown will appear on the **Tickets** page.  
- Uses existing event start/end timestamps – **no backend work required**.  
- **Assigned to:** @Rimec100 & @GoingBarDown

---

## 2. Website Walkthrough
- @GriffinBonomo will complete a full walkthrough of the entire website on **Saturday night/Sunday morning**.  
- All fixes and pending work must be finished **before** the walkthrough.  
- Any issues/bugs found during the walkthrough will be documented and shared with the team.  
- Goal: ensure all fixes are complete before the **final Sunday deadline**.

---

## 3. Frontend Work

### General Frontend (Admin/Student/Organizer)
- Fix the menu bar.  
- Ensure consistent formatting across all pages.  
- **Assigned to:** @reemaaboudraz & @something67  

---

### Organizer Frontend
- Fix bugs and complete all integration tasks.  
- Key tasks include:  
  - Implement organizer authentication.  
  - Ensure organizers only see events created **by them**.  
  - Fix the organizer profile page.  
  - Additional UI fixes.  
- **Assigned to:** @sunidhi-16 & @noorkaazi3  

---

### Student Frontend
- Complete integration work:  
  - Payment and ticket claiming.  
  - Event countdown feature.  
  - Student profile page.
- **Ticket Validation + QR Code Integration**  
  - Confirm that QR code scanning works to support ticket validation.  
  - QR scanner was implemented by @Rimec100 but requires full integration to test.  
  - @GoingBarDown is currently tidying up tickets → integrating into calendar → then enabling QR code validator functionality.  
  - After QR code works, ensure the **registered participants count** in organizer analytics updates accordingly.  
- **Assigned to:** @GoingBarDown & @Rimec100  
- Student profile page: **@reemaaboudraz**

---

### Admin Frontend
- Final tasks remaining:  
  - Add redirect: “If not admin, go to student/organizer login.”  
  - Optional: Add analytics page.  
- **Assigned to:** @sunidhi-16  

---

## 4. Backend
- Only documentation work remains.  
- **Do not modify** backend files without consulting **@GriffinBonomo** first.

---

## 5. Additional Sprint Tasks

### Replace bubbly font  
- **Assigned to:** @noorkaazi3  

### Documentation  
- Add code comments:  
  - **Frontend:** @everyone  
  - **Backend:** @GriffinBonomo

### Acceptance Testing  
- Everyone must update user stories assigned to them with **acceptance criteria**.

---

## 6. Test Report (Due Nov 24 – Internal Deadline Nov 20)
- Add acceptance tests and any failed scenarios (with explanations).  
- Use the document shared by **@GriffinBonomo** in the `#notes-resources` channel.

---


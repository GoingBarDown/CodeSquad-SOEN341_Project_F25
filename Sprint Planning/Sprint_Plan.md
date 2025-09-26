Sprint Planning Breakdown
=========================

Sprint 1: Foundations & Setup (Infrastructure + Auth)
-----------------------------------------------------
Goals:
- Set up version control (GitHub/GitLab) and branching strategy.
- Decide backend language (recommend Node.js with Express since it pairs well with SQL + JS frontend).
- Set up database schema: Users, Events, Tickets, Organizations.
- Create project skeleton: frontend file structure, backend REST API skeleton.
- Implement basic user authentication (students, organizers, admins).
- Deploy a working “Hello World” version on a free hosting (Heroku/Render/Netlify).

Division of work:
- 2 people: Backend setup (API + SQL DB schema).
- 2 people: Frontend scaffolding (login/signup pages).
- 1 person: GitHub/CI-CD deployment pipeline setup.
- 1 person: Testing setup (basic Jest/Mocha or Postman test collection).
- 1 person: Documentation + SCRUM Master role.

Sprint 2: Core Student Features
-------------------------------
Goals:
- Event discovery page (list events, search/filter).
- Event detail page (view description, date, location, tickets available).
- Students can save events to calendar.
- Students can claim tickets (free or mock paid).
- Generate unique QR code per ticket.

Division of work:
- Backend squad: API for event listing, ticket claiming, QR code generation.
- Frontend squad: Event browsing UI + personal saved events calendar.
- Testing squad: Verify ticket logic (no duplicate claims, capacity respected).

Sprint 3: Organizer Features
----------------------------
Goals:
- Organizer can create an event (with mandatory organizer email validation).
- Store event data as JSON.
- Organizer dashboard: see list of their created events.
- Basic event analytics: # of tickets issued, attendance rate.
- Export attendee list (CSV).
- Upload/scan QR codes for check-in.

Division of work:
- Backend squad: Event creation API, analytics endpoints, CSV export.
- Frontend squad: Event creation form + organizer dashboard UI.
- Testing squad: QR code validation, edge cases with ticket limits.

Sprint 4: Admin Features & Extras
--------------------------------
Goals:
- Admin dashboard: approve organizers, moderate events.
- Global analytics: # events, tickets issued, trends.
- Manage organizations & roles.
- (If time) Extras:
  * Customizable student feed (tags).
  * Seat selection for auditorium events.
  * Automated security email.
  * List of registered clubs (CSV/Excel)

Division of work:
- Backend squad: Admin moderation endpoints, analytics queries.
- Frontend squad: Admin UI (approval dashboard).
- Testing squad: Stress testing, analytics validation, integration.

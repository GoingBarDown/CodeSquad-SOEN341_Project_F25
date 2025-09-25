# CodeSquad - SOEN 341 Project
## Description
We are designing a space for students to find campus events that match their interests while providing organizers with the tools to reach their audience. Students will be able to easily claim tickets and receive a scannable QR code granting them access to the event.
## Core Features
### Student Experience
- Students using our website will be able to search for events and narrow their search using date, category and organization.
- Users can save events to a personal calendar and claim tickets online.
- Tickets will be managed via QR codes that can be scanned online.
- Users can access their event feed and ticket by logging in / signing up to our website.
- **(Extra feature)** students can customize their feed using tags for a personalized experience.
- **(Extra feature)** students may select their seats for special events.

### Organizer Event Management
- Event organizers can customize their event posting with a description, date/time, location, ticket capacity, ticket type (paid or otherwise).
- Detailed event analytics including a dashboard displaying # of tickets issued, attendance rates and remaining capacity.
- Event organizers can export their attendee list as a CSV.
- Integrated QR code scanning for easy ticket validation.
- **(Extra feature)** Organizers can further customize their event postings to reach the right audience using tags that define what type of event they are organizing.
- **(Extra feature)** Organizers may view the remaining seats of an event if seats can be reserved.
- **(Extra feature)** Organizers must complete a form before scheduling an event, notifying campus security of the event details.
### Administrator Dashboard & Moderation
- Administrators can approve and add organizations / organizer accounts.
- Edit / remove event listings that do not comply with policy.
- Global dashboard for viewing total ticket sales, event participation and the number of active events.
- **(Extra feature)** Administrators can view a list of all authorized clubs and organizations.
### Miscellaneous
- All users can log in / sign up to the website. Page layout and available features will adjust dynamically to their current permission level.
## Programming Languages and Frameworks
### Frontend
- HTML
- CSS
- JavaScript
### Backend
- SQLite database for user logging, authentication and event tracking. (Exact implementation may change.)
- Python REST API (potentially Node.js as an alternative.)

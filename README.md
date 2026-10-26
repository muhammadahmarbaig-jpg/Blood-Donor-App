# Blood Bridge - Frontend

## Setup

1. `npm install`
2. `npm run dev`

Runs on `http://localhost:5500`. Backend must run on `http://localhost:3000`.

## Rider / Pick-and-Drop feature (new)

- `pages/signup-rider.html` - new signup form (name, email, password, phone,
  city, optional vehicle info).
- `pages/rides.html` + `js/rides.js`:
  - **Donors** see a request form (pickup address, drop address, date/time,
    notes) and a table of their own ride requests, showing the assigned
    rider's name and phone once accepted.
  - **Riders** see two tables: pending ride requests in their own city
    (with an Accept button), and their own accepted rides (with Start /
    Complete / Cancel buttons depending on status).
- New "Rides" link in the nav bar for donor and rider accounts.
- Profile page now shows/edits phone number and vehicle info for riders,
  and an optional phone number for donors.

## Emergency Request System (expanded)

- **Donor home page**: each emergency alert now has an "I Can Help" button.
  Clicking it calls the respond endpoint and changes to a disabled
  "Responded" state; a second click anywhere isn't possible since the
  button is already disabled, and the backend would reject a duplicate
  response anyway.
- **Society "My Blood Requests" page**: emergency requests now show a
  status (Active/Fulfilled) and two buttons - "Responders" (expands an
  inline table showing every donor who offered to help, with their blood
  group, email, and phone) and "Fulfilled" (marks it resolved, removing it
  from every donor's home page banner).

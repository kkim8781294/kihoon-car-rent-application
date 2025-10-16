# Kihoon Car Rent Application

A backend car rental system built with Node.js, Express, TypeScript, and MongoDB,
following the Clean Architecture design pattern.
This project was developed as a final assignment for the backend development course.

---

## Project Overview

The system provides full backend functionality for a car rental service, including:

* Authentication & Authorization: JWT-based access control (User / Admin roles)
* Car Management: Admins can register and view cars
* Booking System: Users and guests can check availability and make reservations
* Admin Panel: Admins can approve, decline, or edit booking requests
* Testing: Unit tests achieving over 80% coverage

---

## Tech Stack

* Language: TypeScript (Node.js / Express)
* Database: MongoDB
* Testing: Jest
* Architecture: Clean Architecture (Domain, Usecase, Infrastructure, Presentation layers)

---

## How to Run

```bash
# 1. Install dependencies
npm install

# 2. Run 
npm run build
npm start

# 3. Run tests
npm run coverge

```

---

## Features by Module

| Module   | Description                                            |
| -------- | ------------------------------------------------------ |
| Auth     | Register, login, token refresh using JWT               |
| Cars     | Admin-only car creation and public listing             |
| Bookings | Check availability and create bookings (User or Guest) |
| Admin    | Approve, Decline, Edit bookings                        |
| Testing  | Unit-tested usecases and coverage validation           |

---

## Database Structure

* Users: Includes both admin and user roles via `role` field
* Cars: Model, year, daily rate, and active status
* Bookings: References `carId`, `userId` (or `guestEmail`) and stores date ranges

---

## Project Management

* Jira Board: [https://kihoon-car-rent.atlassian.net/jira/software/projects/CAR/boards/1](#)
  Tracked via Jira tickets and commits across a 4-day sprint.

---

## Test Coverage

Core business logic (`src/core`) achieved over 80% test coverage using Jest.
Coverage report available at:
`coverage/lcov-report/index.html`

---

## Author

Developed by Kihoon Kim (Conestoga, Computer Programming Student. Backend Development Final Project)

---



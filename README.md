# Trip Settle

Have you ever struggled with setting expenses after returning from an enjoyable trip?

Welcome to Trip Settle! This application is designed to simplify the process of sharing and setting expenses among
participants after a group trip. No more complicated spreadsheets or awkward conversations about who woes whom - our app
handles all the calculations for you.

## Features

- **Easy Expense Tracking**: Quickly add expenses, specifying the amount, payer, and participants involved.
- **Automatic Calculation**: The app automatically calculates how much each person owes or is owed.
- **Transparent Overview**: Get a clear summary of all expenses and settlements in one place.

Whether it's a weekend getaway with friends of a long-term group expedition, the app ensures that everyone pays their
fair share without the headache.

# Tech Stacks

| Tech        | Proficiency           |
|-------------|-----------------------|
| **NestJS**  | First-time use        |
| **MongoDB** | Production experience |


# Badges

[![codecov](https://codecov.io/github/kimseungbin/trip-settle/graph/badge.svg?token=E6P5UWDAQ6)](https://codecov.io/github/kimseungbin/trip-settle)

## Coverage Graph

![coverage-graph](https://codecov.io/github/kimseungbin/trip-settle/graphs/sunburst.svg?token=E6P5UWDAQ6)

# Getting Started

This guide will help you set up, build, run, and test the application.

## Prerequisites

- **Node.js**: Ensure you have Node.js installed
- **npm**: Comes bundled with Node.js
- **Nest CLI** (optional for development): Install globally using `npm install -g @nestjs/cli`

## Installation

1. Clone the Repository

```bash
git clone https://github.com/kimseungbin/trip-settle
```

2. Navigate to the Project Directory

```bash
cd <project-directory>
```

3. Install Dependencies

```bash
npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
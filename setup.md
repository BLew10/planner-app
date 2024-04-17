# Setup

## Login
- Usernae: Joyce
- Password: Onelife55

## Models

### Calendar Editions
 - Ability to add/edit/delete new editions
 - Functionality
    - Remove or add calendars as your business progress

### Advertisment Types
- Ability to add/edit/delete the types of advertisments on your calendar
- Day type vs Non Day Type
- Day Type
    - Locks at 35 slots per month. There are 35 date slots in a calendar month
- Non Day Type
    - types that go outside the date blocks
- Once saved, you cannot edit the type.

### Address Books
- Create address books as you please

### Contacts
- Fill out all required information
- Validate email, it is neccessary to have payments sent and may cause issues down the road if 


## Stripe
- Create Stripe Account with all relevant information
- Grab the test and live API key
    - Let me know when you wanna do real payments with real customers
- setup webhooks and events
    - Grab signing secrets with test env and live env
    - test: https://planner-app-git-dev-personal-8f38e0d6.vercel.app/api/webhooks
    - live: https://planner-app-joyce.vercel.app/api/webhooks
- Send emails to brandonlewis.10@gmail.com on live version or yourself

## Vercel (After testing for a few weeks and deciding on whether she likes it or not)
- Have joyce setup a vercel account
- Link to project, add payment info to pay for deployment

## Notes on Models
- Will not be able to create payments for customers who don't have an email

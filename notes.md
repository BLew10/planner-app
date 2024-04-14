# Testing

## Payments

- If Joyce has any failed payments, that needs to be handled within stripe. 
- The system should just be aware when payments are made and update. If the subscription is cancelled, it should know as well.

### Payment Test Cases for Webhooks 
- Creating a payment
    - Verify a subscription schedule is created
    - Verify the first invoice is created
    - Verify the that when a new invoice is sent, the system picks up on it
    - 



### Sync with Stripe
- When Joyce clicks 'Sync', it should grab all subscriptions, check the status
    - if id does not exists, move status to `Cancelled`
- My system should just interface with status, joyce will need to check stripe be see payment updates and issues. 


## Setup
- Have joyce setup a vercel account

## CHANGES
- Invoices not sending when finalized
- light mode?
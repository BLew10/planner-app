# Testing

## Payments

- If Joyce has any failed payments, that needs to be handled within stripe. 
- The system should just be aware when payments are made and update. If the subscription is cancelled, it should know as well.



### Sync with Stripe
- When Joyce clicks 'Sync', it should grab all subscriptions, check the status
    - if id does not exists, move status to `Cancelled`
- My system should just interface with status, joyce will need to check stripe be see payment updates and issues. 
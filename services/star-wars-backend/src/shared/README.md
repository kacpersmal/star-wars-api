# Shared module

This one contains all of the infrastructure, error handling, caching etc

## Breakdown

### Configuration Module

I've centralized configurtion management for validation and ease of use of env vars and more!

### Benefits

- type safe config
- validation of env variables (who did not forgot to add new env vars to terraform or smth)
- ease of mocking the config

### Database module

Db connection management and drizzle schemas

### Benefits

- ORM!

### Redis Module

Redis and caching capabilities (may be reused for transport layer also!)

### Benefits

- cool caching proxy pattern
- cache management

### Error Module

Global error handling and logging

### Benefits

- consistent error responses (cool ts pattern in there =) )
- request correlation in logs
- error sanitization

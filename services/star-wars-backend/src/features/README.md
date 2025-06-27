# Two project structures in here!

## Why?

I wanted to showcase a bit different approaches for handling project structure complicities. I decided on the following two:

- Classic (controller -> service -> repository)
- CQRS (controller -> cqrs -> repository)

## Pros & Cons

## Classic

```
feature/
├── feature.module.ts
├── feature.integration.spec.ts
├── controllers/
│   └── feature.controller.ts
├── services/
│   └── feature.service.ts
├── repositories/
│   └── feature.repository.ts
└── dto/
    └── feature-response.dto.ts
```

### Pros

- It is very easy to understand this structure, good for small apis
- less boilerplate code, just create new service and endpoint
- consolidated logic (good for small cases)

### Cons

- very tightly coupled
- service classes may overgrow to 1k lines!
- harder to test individual operations
- lots of conflicts when merging
- violates srp

## CQRS

```
feature/
├── feature.controller.ts
├── feature.module.ts
├── repositories/
│   └── feature.repository.ts
└── actions/
    ├── get-feature/
    │   ├── index.ts
    │   ├── get-feature.dto.ts
    │   └── get-feature.handler.ts
    ├── create-feature/
    ├── update-feature/
    └── delete-feature/
```

### Pros

- clear separation of concerns, SRP!
- scalability, very easy to add new features
- easly isolated tests
- very maintanable and collab friendly
- decoupled

### Cons

- much more boilerplate code to start new feature
- harder to understand for newer devs
- overkill for small apis (awesome for larger ones!)
- too much filees

## My notes/thoughts during development

- missing some better way for managing multiple handlers in cqrs
- should have used path aliases (maybe i'll implement later)
- db schemas are currently in the shared folder, would be nice to put them inside specific features modules
- i dont like the classic one
- im missing automapper from dotnet :')

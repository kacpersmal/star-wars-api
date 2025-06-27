# Event-Based System

This application implements an event-based system using Bull Queue for job processing and Redis as the message broker.

## Architecture

### Events Module (`src/shared/events/`)

- **EventService**: Publishes events to the Bull queue
- **Event Types**: Defines event payloads (e.g., `CharacterCreatedEvent`)

### Jobs Module (`src/jobs/`)

- **CharacterEventProcessor**: Processes character-related events
- Handles background job processing with retry mechanisms

## Demo Flow

When a user creates a character:

1. **Characters Service** creates the character in the database
2. **EventService** publishes a `character-created` event with `id` and `name` payload
3. **CharacterEventProcessor** picks up the event from the queue
4. **Job logs** the character creation and can perform additional processing

## Usage

### Creating a Character

```bash
POST /characters
{
  "name": "Luke Skywalker",
  "height": 172,
  // ... other fields
}
```

### What Happens

1. Character is saved to database
2. Event `character-created` is published with:
   ```json
   {
     "id": "generated-uuid",
     "name": "Luke Skywalker"
   }
   ```
3. Job processor logs:
   ```
   Processing character-created event: Character "Luke Skywalker" with ID "generated-uuid" was created
   Successfully processed character-created event for character: Luke Skywalker (ID: generated-uuid)
   ```

## Configuration

The system uses Redis for both caching and job queue. Configuration is handled through the existing `ConfigurationService`.

## Monitoring

You can monitor job queues using:

- Redis CLI
- Bull Dashboard (can be added as additional dependency)
- Application logs

## Extending the System

To add new events:

1. Create event type in `src/shared/events/types/`
2. Add publisher method in `EventService`
3. Create processor method in appropriate processor
4. Use the event service in your business logic

# Terraform

Here would go whole terraform configuration, i would use layered approach with envs. I can talk about this!

-> s3 + dynamodb for state management and state locking

-> i would go with ecs for the containerized deployment of the api, aurora for postgres db, elasti cache for redis caching. Would swap out bull redis into sqs (would require rework of jobs since bull uses redis)

-> ALB could be used with WAF

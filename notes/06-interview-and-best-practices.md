# Social Media B — Interview & Engineering Playbook

## Core mental model
```text
UI → Router → Auth state → HTTP contract → Express middleware → Controller → MongoDB → External service → UI state
```

## React questions
1. Why does AuthContext need loading?
2. What causes premature redirects?
3. What does useParams read?
4. Controlled vs uncontrolled inputs?
5. How do you avoid state updates after unmount?

## Node/Express questions
6. Why middleware?
7. How does req.user get created?
8. Why centralize auth parsing?
9. Why centralized error handling?

## MongoDB questions
10. $push vs $addToSet?
11. $pull?
12. References vs embedded documents?
13. What does populate do?
14. How would you model millions of follows?

## Security questions
15. Why HttpOnly?
16. Why are frontend guards not authorization?
17. What does JWT verification establish?
18. Why normalize email?
19. Why are cookie flags environment-dependent?

## System-design questions
20. How would you make follow atomic?
21. How would you paginate followers?
22. How would you rate-limit follow requests?
23. How would you cache profiles?
24. How would you generate notifications after follow?

## Viva exercises
- Remove auth loading and predict the redirect bug.
- Change $addToSet to $push and create a duplicate follow.
- Change one response field and debug the broken UI by tracing contracts.
- Call the protected endpoint without the UI and explain why frontend protection is not security.
- Remove one profile field and identify the UI dependency.

## Best-practice checklist
Validation, centralized errors, secure cookies, rate limiting, integration tests, response contracts, pagination, observability, transaction/consistency strategy, and API documentation.

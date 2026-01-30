# Contributing to CityFix

Thank you for your interest in contributing to CityFix! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help create a positive environment for all contributors

## Getting Started

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/cityfix.git
   cd cityfix
   ```

2. **Set Up Development Environment**
   ```bash
   # Install git hooks
   make install-hooks
   
   # Start services
   make dev-up
   ```

3. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Backend Development

1. **Create/modify service**
   ```bash
   cd src/YourService
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Run tests**
   ```bash
   pytest
   pytest --cov=src
   ```

3. **Lint and format**
   ```bash
   black src/
   pylint src/
   ```

### Frontend Development

1. **Install dependencies**
   ```bash
   cd src/CityFixUI
   npm install
   ```

2. **Run development server**
   ```bash
   npm run dev
   ```

3. **Run tests**
   ```bash
   npm test
   ```

4. **Lint and format**
   ```bash
   npm run lint
   npx prettier --write "src/**/*.{ts,tsx}"
   ```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes

### Scopes
- `auth`: AuthService
- `admin`: AdminService
- `ticket`: TicketService
- `media`: MediaService
- `geo`: GeoService
- `notification`: NotificationService
- `orchestrator`: Orchestrator
- `frontend`: CityFixUI
- `infra`: Infrastructure (Docker, K8s)
- `docs`: Documentation

### Examples

```bash
feat(ticket): add real-time status updates

Implement WebSocket connection for live ticket status updates.
Citizens now receive immediate notifications when status changes.

Closes #123

---

fix(auth): resolve JWT token expiration issue

Fixed bug where tokens were expiring prematurely due to timezone mismatch.

Fixes #456

---

docs(readme): update deployment instructions

Added Kubernetes deployment section with examples.
```

## Pull Request Process

1. **Update Documentation**
   - Update README.md if needed
   - Add/update API documentation
   - Update CHANGELOG.md

2. **Write Tests**
   - Add unit tests for new code
   - Ensure existing tests pass
   - Aim for 80%+ coverage

3. **Run Pre-commit Checks**
   ```bash
   make lint
   make test
   make format
   ```

4. **Create Pull Request**
   - Use clear, descriptive title
   - Reference related issues
   - Provide detailed description
   - Add screenshots for UI changes

5. **Code Review**
   - Address reviewer feedback
   - Keep discussions focused
   - Be open to suggestions

## Testing Requirements

### Unit Tests
- Test individual functions/methods
- Mock external dependencies
- Fast execution (< 1 second per test)

### Integration Tests
- Test service interactions
- Use test database
- Clean up after tests

### E2E Tests (Future)
- Test complete user flows
- Use dedicated test environment

### Test Example

```python
# test_tickets.py
import pytest
from fastapi.testclient import TestClient

def test_create_ticket(client: TestClient, auth_token):
    response = client.post(
        "/api/v1/tickets",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "title": "Test Ticket",
            "description": "Test Description",
            "category": "street",
            "location": {"lat": 40.8333, "lng": 14.25}
        }
    )
    assert response.status_code == 201
    assert response.json()["title"] == "Test Ticket"
```

## Code Style

### Python
- Follow PEP 8
- Use Black for formatting (line length: 100)
- Use type hints
- Write docstrings for functions/classes

```python
def create_ticket(
    title: str,
    description: str,
    location: dict,
    db: Database
) -> dict:
    """
    Create a new maintenance ticket.
    
    Args:
        title: Ticket title
        description: Detailed description
        location: Geographic coordinates
        db: Database connection
        
    Returns:
        Created ticket dictionary
        
    Raises:
        ValidationError: If input is invalid
    """
    # Implementation
    pass
```

### TypeScript
- Use ESLint + Prettier
- Define types/interfaces
- Avoid `any` type
- Use functional components

```typescript
interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  location: Location;
  createdAt: Date;
}

const TicketCard: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
  // Implementation
};
```

## Documentation

### Code Comments
- Comment complex logic
- Avoid obvious comments
- Use TODO/FIXME for future work

### API Documentation
- FastAPI auto-generates docs
- Add descriptions to endpoints
- Document request/response schemas

```python
@router.post("/tickets", response_model=TicketResponse)
async def create_ticket(
    ticket_data: TicketCreate,
    db=Depends(get_database)
):
    """
    Create a new maintenance ticket.
    
    This endpoint allows citizens to report maintenance issues
    with geographic location and optional photo attachments.
    """
    # Implementation
```

## Performance Guidelines

- Optimize database queries (use indexes)
- Avoid N+1 queries
- Use async/await for I/O operations
- Cache frequently accessed data
- Monitor response times

## Security Guidelines

- Never commit secrets
- Use environment variables
- Validate all inputs
- Sanitize user data
- Use parameterized queries
- Follow OWASP guidelines

## Debugging Tips

### Backend
```bash
# Check service logs
docker logs cityfix-auth-service

# Access MongoDB
docker exec -it cityfix-mongodb mongosh

# Debug with Python debugger
import pdb; pdb.set_trace()
```

### Frontend
```bash
# Check browser console
# Use React DevTools
# Check network tab for API calls
```

## Questions?

- GitHub Discussions: https://github.com/yourusername/cityfix/discussions
- Discord: https://discord.gg/cityfix
- Email: dev@cityfix.app

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md
- Release notes
- Project README

Thank you for contributing to CityFix! 🚀

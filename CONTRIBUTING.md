# Contributing to MCP Holded

Thank you for your interest in contributing to MCP Holded!

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Build: `npm run build`
4. Run tests: `npm test`

## Code Style

This project uses ESLint and Prettier for code formatting. Before committing:

```bash
npm run lint        # Check for linting errors
npm run lint:fix    # Fix linting errors
npm run format      # Format code with Prettier
```

Pre-commit hooks will automatically run linting on staged files.

## Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for automated versioning and changelog generation.

Format: `<type>(<scope>): <description>`

Types:
- `feat`: New feature (triggers minor version bump)
- `fix`: Bug fix (triggers patch version bump)
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(documents): add bulk export functionality
fix(contacts): correct pagination handling
docs: update installation instructions
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Ensure tests pass: `npm test`
4. Ensure linting passes: `npm run lint`
5. Commit using conventional commits
6. Push and create a pull request

## Testing

Run tests with:

```bash
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## Questions?

Feel free to open an issue for any questions or concerns.

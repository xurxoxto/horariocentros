# Contributing to HorarioCentros

Thank you for your interest in contributing to HorarioCentros! This document provides guidelines for contributing to the project.

## Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/xurxoxto/horariocentros/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Your environment (OS, browser, Node version)

### Suggesting Features

1. Check [existing feature requests](https://github.com/xurxoxto/horariocentros/issues?q=is%3Aissue+label%3Aenhancement)
2. Open a new issue with:
   - Clear use case
   - Why this feature would be valuable
   - Proposed implementation (if you have ideas)

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following our coding standards
4. Write/update tests as needed
5. Ensure all tests pass
6. Commit with clear messages
7. Push to your fork
8. Open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/horariocentros.git
cd horariocentros

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your settings

# Start development
npm run dev
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types/interfaces
- Avoid `any` unless absolutely necessary
- Use meaningful variable names

### React

- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Follow React best practices

### Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Support both light and dark modes
- Keep accessibility in mind

### Git Commits

- Use clear, descriptive commit messages
- Reference issues when applicable
- Keep commits focused and atomic

Example:
```
feat: Add drag-and-drop support for timetable slots

- Implemented React DnD for slot dragging
- Added visual feedback during drag
- Closes #123
```

## Testing

```bash
# Run all tests
npm test

# Run server tests
npm run server:test

# Run client tests
npm run client:test
```

## Documentation

- Update README.md if adding features
- Add JSDoc comments for complex functions
- Update API documentation for new endpoints

## License

By contributing, you agree that your contributions will be licensed under the AGPLv3 license.

## Questions?

Feel free to open a discussion or reach out via email.

Thank you for contributing! 🎉

# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of HorarioCentros seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please do NOT:
- Open a public GitHub issue for security vulnerabilities
- Disclose the vulnerability publicly before it has been addressed

### Please DO:
1. Email security details to: xurxoxto@github.com
2. Include:
   - Type of vulnerability
   - Full paths of source file(s) related to the vulnerability
   - Location of the affected source code (tag/branch/commit or direct URL)
   - Step-by-step instructions to reproduce the issue
   - Proof-of-concept or exploit code (if possible)
   - Impact of the issue

### What to Expect:
- Acknowledgment within 48 hours
- Regular updates on progress
- Credit in security advisories (if desired)
- Coordinated disclosure timeline

## Security Best Practices

### For Deployment

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, random JWT secrets
   - Rotate secrets regularly

2. **HTTPS/TLS**
   - Always use HTTPS in production
   - Configure proper SSL/TLS certificates
   - Enable HSTS headers

3. **Database**
   - Use strong database passwords
   - Restrict database access to application only
   - Enable encryption at rest
   - Regular backups

4. **Access Control**
   - Implement rate limiting
   - Use RBAC properly
   - Audit logs regularly
   - Monitor for suspicious activity

5. **Dependencies**
   - Keep dependencies updated
   - Run `npm audit` regularly
   - Use Dependabot or similar tools

### For Development

1. **Input Validation**
   - Validate all user inputs
   - Use parameterized queries
   - Sanitize data before rendering

2. **Authentication**
   - Use secure password hashing (bcrypt)
   - Implement proper session management
   - Enable 2FA for admin accounts

3. **Authorization**
   - Check permissions on all routes
   - Implement proper RBAC
   - Test authorization boundaries

4. **Data Protection**
   - Encrypt sensitive data
   - Implement proper CORS
   - Use secure headers

## Known Security Considerations

### Current Implementation
- JWT tokens stored in localStorage (XSS risk - consider httpOnly cookies)
- In-memory data storage in MVP (not suitable for production)
- No rate limiting on auth endpoints (should be added)
- No 2FA support yet (planned feature)

### Planned Security Enhancements
- [ ] Implement rate limiting
- [ ] Add request validation middleware
- [ ] Enable CSRF protection
- [ ] Implement 2FA
- [ ] Add security headers middleware
- [ ] Implement audit logging
- [ ] Add intrusion detection

## Security Headers

Recommended security headers for production:

```javascript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});
```

## Compliance

### GDPR
- User data is stored securely
- Users can request data deletion
- Privacy policy available
- Data retention policies implemented

### AGPLv3
- Source code available
- Modifications must be disclosed
- Network use triggers distribution requirements
- Commercial license available for closed-source deployments

## Security Checklist for Production

- [ ] HTTPS enabled
- [ ] Strong JWT secret set
- [ ] Database credentials secured
- [ ] Environment variables protected
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] XSS prevention implemented
- [ ] CSRF protection enabled
- [ ] Security headers configured
- [ ] Regular backups scheduled
- [ ] Monitoring and alerting set up
- [ ] Incident response plan documented
- [ ] Regular security audits scheduled

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find similar problems
3. Prepare fixes for all supported versions
4. Release patches as soon as possible

## Attribution

We believe in responsible disclosure and will credit security researchers who report vulnerabilities responsibly.

## Questions?

If you have questions about this security policy, please contact xurxoxto@github.com

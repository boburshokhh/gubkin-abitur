# Auth Rollout Checklist

## Required Environment

- `JWT_SECRET`
- `TOKEN_PEPPER`
- `FRONTEND_ORIGIN`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

Use strong random values for `JWT_SECRET` and `TOKEN_PEPPER`. Do not reuse old demo secrets.

## Existing Users Migration

Run `init-db/03-auth-production.sql` against existing databases before deploying the new backend.

The migration marks existing users as `active` and sets `email_verified_at` where missing, so current users can sign in after the release. Existing old JWTs are not valid because access now requires an active `auth_sessions` record; users must sign in again.

## Smoke Test

- Register a new applicant and confirm the email link.
- Sign in with confirmed account.
- Verify silent refresh after access token expiry.
- Sign out and confirm protected pages redirect to `/auth`.
- Request password reset and set a new password from the email link.
- Confirm old sessions are revoked after password reset.
- Create an admin/reviewer invitation from the admin panel.
- Open invitation link, accept it, and verify assigned role.
- Revoke an unused invitation and confirm it cannot be accepted.
- Try reused/expired email, reset, and invite tokens; all must fail.

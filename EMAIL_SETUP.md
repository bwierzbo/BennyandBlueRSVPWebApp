# Email Confirmation Setup Guide

This guide will help you set up email confirmations for RSVP submissions using Resend.

## Prerequisites

- A Resend account (free tier includes 3,000 emails/month)
- Access to DNS settings for your domain (optional, for custom sender email)

## Step-by-Step Setup

### 1. Sign Up for Resend

1. Go to https://resend.com/signup
2. Create a free account
3. Verify your email address

### 2. Get Your API Key

1. Log in to your Resend dashboard
2. Navigate to **API Keys** section
3. Click "Create API Key"
4. Give it a name (e.g., "Wedding RSVP Production")
5. Copy the API key (starts with `re_`)

### 3. Add API Key to Environment Variables

**For Local Development:**

Add to your `.env.local` file:

```bash
RESEND_API_KEY="re_your_api_key_here"
```

**For Vercel Deployment:**

1. Go to your Vercel project settings
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name:** `RESEND_API_KEY`
   - **Value:** Your Resend API key
   - **Environment:** Production, Preview, Development
4. Click "Save"
5. Redeploy your application

### 4. Verify Domain (Optional but Recommended)

By default, Resend sends emails from `onboarding@resend.dev`. To use your own domain:

1. In Resend dashboard, go to **Domains**
2. Click "Add Domain"
3. Enter your domain (e.g., `bennyandbluersvp.com`)
4. Add the DNS records shown to your domain's DNS settings
5. Wait for verification (usually takes a few minutes)
6. Update the `from` field in `lib/email.ts`:

```typescript
from: 'Kourtney & Benjamin <rsvp@yourdomain.com>',
```

### 5. Test Email Sending

#### Local Testing

1. Make sure your `.env.local` has the `RESEND_API_KEY`
2. Restart your development server:
   ```bash
   npm run dev
   ```
3. Submit a test RSVP through your website
4. Check the Resend dashboard **Logs** section to see if email was sent
5. Check your inbox for the confirmation email

#### Production Testing

1. Deploy to Vercel with the environment variable set
2. Submit a test RSVP on your production site
3. Verify email delivery

## Email Template Customization

The email template is located at `emails/rsvp-confirmation.tsx`. You can customize:

- **Subject Line:** Edit in `lib/email.ts` (line 28)
- **Content:** Modify the React components in `emails/rsvp-confirmation.tsx`
- **Styling:** Update the inline styles at the bottom of `emails/rsvp-confirmation.tsx`
- **Colors:** The template uses your wedding color palette

## Troubleshooting

### Email Not Sending

1. **Check API Key:**
   - Verify `RESEND_API_KEY` is set correctly in environment variables
   - Make sure there are no extra spaces or quotes

2. **Check Logs:**
   - Look at your application logs (Vercel logs or terminal)
   - Check Resend dashboard **Logs** section

3. **Quota Limits:**
   - Free tier: 3,000 emails/month, 100 emails/day
   - Check your usage in Resend dashboard

### Email Going to Spam

- Verify your domain in Resend
- Add SPF, DKIM, and DMARC records
- Ask recipients to whitelist your sender email

### Email Not Received

- Check spam folder
- Verify email address is correct
- Check Resend logs to see if email was delivered

## Email Features

The confirmation email includes:

✅ Personalized greeting
✅ Complete wedding event schedule
✅ Venue address with Google Maps link
✅ RSVP details summary
✅ Dietary restrictions (if provided)
✅ Song requests (if provided)
✅ Links to wedding website and travel info
✅ Contact information
✅ Beautiful formatting with wedding colors

## Cost

**Resend Pricing:**
- **Free Tier:** 3,000 emails/month, 100 emails/day
- **Pro Plan:** $20/month for 50,000 emails/month
- **Additional:** $1 per 1,000 emails beyond plan limit

For a typical wedding with 100-200 guests, the free tier is more than sufficient.

## Support

- **Resend Documentation:** https://resend.com/docs
- **Resend Support:** support@resend.com
- **Wedding Website Issues:** bwierzbo@gmail.com

## Security Notes

- Never commit your API key to version control
- Use environment variables for all sensitive data
- Rotate API keys periodically for security
- Monitor email logs for suspicious activity

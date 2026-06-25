# Meta WhatsApp Cloud API Setup

## Environment Variables

Add the following variables to your `.env` file:

```bash
# Meta WhatsApp Cloud API Configuration
META_WHATSAPP_ACCESS_TOKEN=your_meta_access_token
META_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
ADMIN_WHATSAPP_NUMBER=+919876543210  # Admin's WhatsApp number to receive notifications
```

## Getting Meta WhatsApp Credentials

1. Go to Meta for Developers: https://developers.facebook.com
2. Create a new app or use an existing one
3. Add "WhatsApp" product to your app
4. Get your Access Token from WhatsApp → API Setup
5. Get your Phone Number ID from WhatsApp → API Setup
6. Add your admin's WhatsApp number (with country code) as `ADMIN_WHATSAPP_NUMBER`

## Business Verification

Meta requires business verification for production use:
- Go to Business Settings in Meta Business Suite
- Complete business verification with documents
- This is required for sending messages at scale

## Testing

1. Add your test phone number to the WhatsApp sandbox in Meta Console
2. Test the integration by creating a mutual match in the application
3. The admin should receive a WhatsApp message with match details

## Message Format

When a mutual match is created, the admin receives:

```
🎉 New Mutual Match Alert!

User A: [Full Name] ([City], [State])
User B: [Full Name] ([City], [State])

Match ID: [match_id]
Ticket Status: OPEN

Please review in admin panel.
```

## Advantages of Meta WhatsApp Cloud API

- ✅ No platform fees (lowest cost)
- ✅ Official Meta API
- ✅ High delivery rate
- ✅ Free to integrate
- ✅ Supports templates, media, buttons, catalogs
- ✅ Webhooks for real-time updates

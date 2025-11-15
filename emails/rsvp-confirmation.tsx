import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Link,
} from '@react-email/components'

interface RSVPConfirmationEmailProps {
  name: string
  isAttending: boolean
  numberOfGuests: number
  guestNames?: string[]
  dietaryRestrictions?: string
  songRequests?: string
  notes?: string
}

export default function RSVPConfirmationEmail({
  name,
  isAttending,
  numberOfGuests,
  guestNames = [],
  dietaryRestrictions,
  songRequests,
  notes,
}: RSVPConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your RSVP confirmation for Kourtney & Ben's Wedding</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>💕 Thank You!</Heading>

          <Text style={text}>Dear {name},</Text>

          <Text style={text}>
            Thank you for {isAttending ? 'letting us know you can make it to' : 'responding to the invitation for'} our wedding celebration!
          </Text>

          {isAttending && (
            <>
              <Section style={eventSection}>
                <Heading style={h2}>Wedding Events</Heading>

                <Text style={eventText}>
                  <strong>📅 Date:</strong> August 22, 2026
                </Text>

                <Text style={eventText}>
                  <strong>🍹 Cocktail Hour:</strong> 5:00 PM at Olympic Bluffs Cidery
                </Text>

                <Text style={eventText}>
                  <strong>💒 Ceremony:</strong> 6:30 PM at Salt & Cedar bed and breakfast
                </Text>

                <Text style={eventText}>
                  <strong>🎉 Reception:</strong> 7:00 PM - 11:00 PM at Olympic Bluffs Lavender Shop
                </Text>

                <Text style={eventText}>
                  <strong>🥞 Brunch:</strong> August 23, 2026 at 11:00 AM (Location TBD)
                </Text>

                <Hr style={hr} />

                <Text style={eventText}>
                  <strong>📍 Venue:</strong><br />
                  Olympic Bluffs Cidery & Lavender Farm<br />
                  1025 Finn Hall Road<br />
                  Port Angeles, WA 98362
                </Text>

                <Text style={text}>
                  <Link href="https://www.google.com/maps/place/1025+Finn+Hall+Rd,+Port+Angeles,+WA+98362" style={link}>
                    View on Google Maps
                  </Link>
                </Text>
              </Section>

              <Hr style={hr} />

              <Section>
                <Heading style={h2}>Your RSVP Details</Heading>

                <Text style={text}>
                  <strong>Number of Guests:</strong> {numberOfGuests + 1} (including you)
                </Text>

                {guestNames.length > 0 && (
                  <Text style={text}>
                    <strong>Guest Names:</strong><br />
                    • {name} (you)<br />
                    {guestNames.map((guestName, index) => (
                      `• ${guestName}\n`
                    )).join('')}
                  </Text>
                )}

                {dietaryRestrictions && (
                  <Text style={text}>
                    <strong>Dietary Restrictions:</strong><br />
                    {dietaryRestrictions}
                  </Text>
                )}

                {songRequests && (
                  <Text style={text}>
                    <strong>Song Requests:</strong><br />
                    {songRequests}
                  </Text>
                )}

                {notes && (
                  <Text style={text}>
                    <strong>Your Message:</strong><br />
                    {notes}
                  </Text>
                )}
              </Section>
            </>
          )}

          <Hr style={hr} />

          <Section>
            <Heading style={h2}>Need More Information?</Heading>

            <Text style={text}>
              Check out our wedding website for travel details, accommodations, and more:
            </Text>

            <Text style={text}>
              <Link href="https://bennyandbluersvp.vercel.app" style={link}>
                Visit Wedding Website
              </Link>
            </Text>

            <Text style={text}>
              <Link href="https://bennyandbluersvp.vercel.app/travel" style={link}>
                Travel & Accommodations
              </Link>
            </Text>
          </Section>

          <Hr style={hr} />

          <Section>
            <Text style={footer}>
              Questions? Contact us:<br />
              📧 <Link href="mailto:bwierzbo@gmail.com" style={link}>bwierzbo@gmail.com</Link><br />
              📱 <Link href="tel:+15712713751" style={link}>(571) 271-3751</Link>
            </Text>

            <Text style={footer}>
              We can't wait to celebrate with you!<br />
              — Kourtney & Ben
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f8f4f9',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '40px',
  borderRadius: '8px',
  maxWidth: '600px',
}

const h1 = {
  color: '#6B1F41',
  fontSize: '32px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0 0 30px',
}

const h2 = {
  color: '#6B1F41',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 15px',
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 15px',
}

const eventSection = {
  backgroundColor: '#fdf2f7',
  padding: '20px',
  borderRadius: '6px',
  marginBottom: '20px',
}

const eventText = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '1.8',
  margin: '0 0 10px',
}

const link = {
  color: '#D4A056',
  textDecoration: 'underline',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '30px 0',
}

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.6',
  textAlign: 'center' as const,
  margin: '0 0 15px',
}

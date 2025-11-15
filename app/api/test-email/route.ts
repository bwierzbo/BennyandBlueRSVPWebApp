import { NextResponse } from 'next/server'
import { sendRSVPConfirmation } from '@/lib/email'

export async function POST() {
  try {
    // Test email parameters
    const testParams = {
      email: 'bwierzbo@gmail.com',
      name: 'Benjamin (Test)',
      isAttending: true,
      numberOfGuests: 2,
      guestNames: ['Kourtney (Test)', 'Another Guest (Test)'],
      dietaryRestrictions: 'Vegetarian, no nuts (test data)',
      songRequests: 'Sweet Caroline, September by Earth Wind & Fire (test data)',
      notes: 'This is a test email to verify the confirmation system is working correctly.',
    }

    console.log('Sending test email to:', testParams.email)

    const result = await sendRSVPConfirmation(testParams)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully!',
        data: result.data,
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to send test email',
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

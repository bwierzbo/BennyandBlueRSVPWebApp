import { NextRequest, NextResponse } from "next/server"
import { submitRSVPJSON } from "@/lib/actions"
import { type RSVPFormData } from "@/lib/validations"
import { rateLimit, getClientIp } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const limiter = rateLimit(ip, 5, 60_000)
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429 }
      )
    }

    const data: RSVPFormData = await request.json()

    const result = await submitRSVPJSON(data)

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: result.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: "RSVP submitted successfully",
      data: result.data,
    })

  } catch (error) {
    console.error("API Route Error:", error)

    return NextResponse.json(
      {
        message: "Internal server error",
        errors: [{ field: "_form", message: "Something went wrong. Please try again." }],
      },
      { status: 500 }
    )
  }
}
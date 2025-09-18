import { NextRequest, NextResponse } from "next/server"
import { validateEmailUniqueness } from "@/lib/actions"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        {
          message: "Email is required",
          errors: [{ field: "email", message: "Email is required" }],
        },
        { status: 400 }
      )
    }

    const result = await validateEmailUniqueness(email)

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Email validation failed",
          errors: result.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: "Email is valid and available",
      available: result.data,
    })

  } catch (error) {
    console.error("Email Validation API Error:", error)

    return NextResponse.json(
      {
        message: "Internal server error",
        errors: [{ field: "email", message: "Unable to validate email at this time" }],
      },
      { status: 500 }
    )
  }
}
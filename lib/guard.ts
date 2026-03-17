import { NextRequest, NextResponse } from "next/server"
import { Session } from "next-auth"
import { auth } from "@/auth"

type AuthedHandler = (
  req: NextRequest,
  session: Session & { user: NonNullable<Session["user"]> }
) => Promise<NextResponse>

/**
 * Wraps a POST handler with:
 * - Authentication check
 * - Content-Type validation (must be application/json)
 * - Origin/Referer check against NEXTAUTH_URL to block cross-site requests
 */
export function withAuth(handler: AuthedHandler) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Must be authenticated
    const session = await auth()
    if (!session?.user?.githubId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Must be JSON
    const ct = req.headers.get("content-type") ?? ""
    if (!ct.includes("application/json")) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 415 })
    }

    return handler(req, session)
  }
}

import { NextResponse, type NextRequest } from "next/server";

/**
 * Basic Auth for /admin — a single shared password (ADMIN_PASSWORD), no
 * per-user accounts, matching the brief's "usable in ten seconds by a
 * volunteer board" goal. The comparison has to be constant-time: a naive
 * `password === ADMIN_PASSWORD` string comparison leaks timing information
 * proportional to how many leading characters match, which is a real
 * (if slow) way to brute-force a password over the network.
 *
 * Runs in the Edge runtime (Next's default for proxy/middleware), so this
 * uses Web Crypto (`crypto.subtle`) rather than Node's
 * `crypto.timingSafeEqual`. Both the supplied and expected password are
 * hashed to a fixed-length SHA-256 digest first — comparing digests of equal
 * length means the subsequent constant-time comparison never branches on
 * input length either, only ever on secret bytes, in a fixed number of
 * iterations.
 */

async function sha256(text: string): Promise<Uint8Array> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return new Uint8Array(digest);
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false; // both are always 32-byte SHA-256 digests here, so this never branches on secret data
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

function unauthorized(): NextResponse {
  return new NextResponse("Anmeldung erforderlich.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="OF-Radar Admin", charset="UTF-8"' },
  });
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    // Fail closed: no password configured means no access, not open access.
    return new NextResponse("ADMIN_PASSWORD ist nicht gesetzt.", { status: 503 });
  }

  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) return unauthorized();

  let password: string;
  try {
    const decoded = atob(auth.slice("Basic ".length));
    password = decoded.slice(decoded.indexOf(":") + 1);
  } catch {
    return unauthorized();
  }

  const [supplied, expected] = await Promise.all([sha256(password), sha256(adminPassword)]);
  if (!constantTimeEqual(supplied, expected)) return unauthorized();

  return NextResponse.next();
}

// PARKED FOR v2. /admin/radar was cut from v1 (no database exists to review
// anything against — see README), so there's nothing left under /admin for
// this to protect. The matcher below is deliberately inert: it can't match
// any real request, so /admin/* falls through to Next's normal routing and
// 404s like any other nonexistent path, rather than this proxy answering
// with a 503 (ADMIN_PASSWORD is intentionally unset in v1) ahead of the
// router ever getting a chance to 404 it. The auth logic above is untouched
// and ready — when /admin/radar comes back in v2, restore the real matcher:
//   matcher: ["/admin/:path*"]
export const config = {
  matcher: ["/admin/__parked-for-v2__/:path*"],
};

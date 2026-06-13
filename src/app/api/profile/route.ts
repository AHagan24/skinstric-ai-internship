import {
  isValidProfileValue,
  normalizeProfileValue,
} from "@/lib/profile-validation";

const PHASE_ONE_ENDPOINT =
  "https://us-central1-api-skinstric-ai.cloudfunctions.net/skinstricPhaseOne";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object") {
      return Response.json({ message: "Invalid request." }, { status: 400 });
    }

    const { name, location } = body as {
      name?: unknown;
      location?: unknown;
    };

    if (!isValidProfileValue(name)) {
      return Response.json(
        {
          message:
            "Enter a valid name using letters, spaces, hyphens, or apostrophes.",
        },
        { status: 400 },
      );
    }

    if (!isValidProfileValue(location)) {
      return Response.json(
        {
          message:
            "Enter a valid location using letters, spaces, hyphens, or apostrophes.",
        },
        { status: 400 },
      );
    }

    const response = await fetch(PHASE_ONE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: normalizeProfileValue(name),
        location: normalizeProfileValue(location),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      return Response.json(
        { message: "We could not start your analysis. Please try again." },
        { status: 502 },
      );
    }

    const result: unknown = await response.json();
    const message = getResponseMessage(result);

    return Response.json({ success: true, message });
  } catch {
    return Response.json(
      { message: "We could not start your analysis. Please try again." },
      { status: 500 },
    );
  }
}

function getResponseMessage(result: unknown) {
  if (!result || typeof result !== "object") {
    return "Profile submitted successfully.";
  }

  if ("message" in result && typeof result.message === "string") {
    return result.message;
  }

  if ("SUCCESS" in result && typeof result.SUCCESS === "string") {
    return result.SUCCESS;
  }

  return "Profile submitted successfully.";
}

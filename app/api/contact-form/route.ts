import { NextResponse } from "next/server";
import {
  submitContactForm,
  type ContactFormSubmissionPayload,
  type ContactFormSubmissionResponse,
  WordPressAPIError,
} from "@/lib/wordpress";

const CONTACT_FORM_ID = process.env.WORDPRESS_CONTACT_FORM_ID;

export async function POST(request: Request) {
  if (!CONTACT_FORM_ID) {
    return NextResponse.json(
      { message: "Contact form is not configured." },
      { status: 500 }
    );
  }

  let body: Partial<ContactFormSubmissionPayload>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request payload." },
      { status: 400 }
    );
  }

  const payload: ContactFormSubmissionPayload = {
    name: typeof body.name === "string" ? body.name.trim() : "",
    email: typeof body.email === "string" ? body.email.trim() : "",
    message: typeof body.message === "string" ? body.message.trim() : "",
    phone:
      typeof body.phone === "string" && body.phone.trim()
        ? body.phone.trim()
        : undefined,
    vesselTitle:
      typeof body.vesselTitle === "string" && body.vesselTitle.trim()
        ? body.vesselTitle.trim()
        : undefined,
    pageUrl:
      typeof body.pageUrl === "string" && body.pageUrl.trim()
        ? body.pageUrl.trim()
        : undefined,
  };

  const missingFields: string[] = [];

  if (!payload.name) {
    missingFields.push("name");
  }
  if (!payload.email) {
    missingFields.push("email");
  }
  if (!payload.message) {
    missingFields.push("message");
  }

  if (missingFields.length) {
    return NextResponse.json(
      {
        message: `Missing required field${missingFields.length > 1 ? "s" : ""}: ${missingFields.join(", ")}`,
      },
      { status: 400 }
    );
  }

  try {
    const cf7Response = await submitContactForm(CONTACT_FORM_ID, payload);

    if (cf7Response.status === "validation_failed") {
      return NextResponse.json(
        {
          message:
            cf7Response.message ||
            "We couldn't process your request. Please check the highlighted fields.",
          details: cf7Response.invalid_fields,
        },
        { status: 422 }
      );
    }

    if (cf7Response.status === "spam" || cf7Response.status === "aborted") {
      return NextResponse.json(
        {
          message:
            cf7Response.message ||
            "We couldn't process your request. Please try again later.",
        },
        { status: 400 }
      );
    }

    const message =
      cf7Response.status === "mail_sent"
        ? cf7Response.message || "Your inquiry has been sent."
        : "Thank you! We've received your request.";

    if (cf7Response.status !== "mail_sent") {
      console.warn(
        `Contact form sent but WordPress reported status "${cf7Response.status}".`
      );
    }

    return NextResponse.json({
      message,
      cf7Status: cf7Response.status,
    });
  } catch (error) {
    console.error("Contact form submission failed:", error);

    if (error instanceof WordPressAPIError) {
      const details = (error as WordPressAPIError & { details?: unknown })
        .details as ContactFormSubmissionResponse | undefined;

      return NextResponse.json(
        {
          message:
            error.message ||
            "We couldn't process your request. Please try again.",
          details: details?.invalid_fields,
        },
        { status: error.status || 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Unable to submit your request right now. Please try again later.",
      },
      { status: 500 }
    );
  }
}

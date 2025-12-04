import { NextResponse } from "next/server";
import {
  submitContactForm,
  type ContactFormSubmissionPayload,
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
    const response = await submitContactForm(CONTACT_FORM_ID, payload);

    if (response.status === "mail_sent") {
      return NextResponse.json({
        message: response.message || "Your inquiry has been sent.",
      });
    }

    const status =
      response.status === "validation_failed" ? 422 : 400;

    return NextResponse.json(
      {
        message:
          response.message ||
          "We couldn't process your request. Please check the form and try again.",
        details: response.invalid_fields,
      },
      { status }
    );
  } catch (error) {
    console.error("Contact form submission failed:", error);
    return NextResponse.json(
      {
        message: "Unable to submit your request right now. Please try again later.",
      },
      { status: 500 }
    );
  }
}

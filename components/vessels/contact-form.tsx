"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ContactFormCopy {
  nameLabel: string;
  emailLabel: string;
  phoneLabel: string;
  messageLabel: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  phonePlaceholder: string;
  messagePlaceholder: string;
}

interface ContactFormMessages {
  success: string;
  submit: string;
  sending: string;
  error: string;
}

interface ContactFormProps {
  vesselTitle: string;
  copy?: ContactFormCopy;
  messages?: ContactFormMessages;
}

const defaultCopy: ContactFormCopy = {
  nameLabel: "Name",
  emailLabel: "Email",
  phoneLabel: "Phone",
  messageLabel: "Message",
  namePlaceholder: "Your name",
  emailPlaceholder: "your@email.com",
  phonePlaceholder: "+1 (555) 123-4567",
  messagePlaceholder: "I'm interested in this vessel...",
};

const defaultMessages: ContactFormMessages = {
  success: "Thank you for your inquiry! We will contact you shortly.",
  submit: "Send Inquiry",
  sending: "Sending...",
  error: "We couldn't send your request. Please try again.",
};

export function ContactForm({
  vesselTitle,
  copy,
  messages,
}: ContactFormProps) {
  const mergedCopy = copy ? { ...defaultCopy, ...copy } : defaultCopy;
  const mergedMessages = messages
    ? { ...defaultMessages, ...messages }
    : defaultMessages;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/contact-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          vesselTitle,
          pageUrl: currentUrl || undefined,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        console.error("Contact form submission error:", payload);
        throw new Error(
          payload?.message || mergedMessages.error
        );
      }

      setStatusMessage({
        type: "success",
        text:
          payload?.message || mergedMessages.success,
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      const fallbackError = mergedMessages.error;
      setStatusMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message || fallbackError
            : fallbackError,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          {mergedCopy.nameLabel} *
        </Label>
        <Input
          id="name"
          type="text"
          required
          placeholder={mergedCopy.namePlaceholder}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          {mergedCopy.emailLabel} *
        </Label>
        <Input
          id="email"
          type="email"
          required
          placeholder={mergedCopy.emailPlaceholder}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{mergedCopy.phoneLabel}</Label>
        <Input
          id="phone"
          type="tel"
          placeholder={mergedCopy.phonePlaceholder}
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">
          {mergedCopy.messageLabel} *
        </Label>
        <Textarea
          id="message"
          required
          placeholder={mergedCopy.messagePlaceholder || defaultCopy.messagePlaceholder}
          rows={4}
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
        />
      </div>

      <Button type="submit" className="w-full" size="lg">
        {isSubmitting ? mergedMessages.sending : mergedMessages.submit}
      </Button>
      {statusMessage && (
        <p
          role="status"
          className={`text-sm ${statusMessage.type === "success" ? "text-green-600" : "text-red-600"}`}
        >
          {statusMessage.text}
        </p>
      )}
    </form>
  );
}

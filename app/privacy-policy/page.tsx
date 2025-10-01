import { Section, Container, Prose } from "@/components/craft";
import Balancer from "react-wrap-balancer";
import { siteConfig } from "@/site.config";

export const metadata = {
    title: `Privacy Policy - ${siteConfig.site_name}`,
    description: "Privacy Policy for Rivers Marine",
};

export default function PrivacyPolicy() {
    return (
        <Section>
            <Container>
                <Prose>
                    <h1>
                        <Balancer>Privacy Policy</Balancer>
                    </h1>

                    <p className="text-muted-foreground">
                        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>

                    <h2>Introduction</h2>
                    <p>
                        Rivers Marine LLC ("we," "our," or "us") is committed to protecting your privacy.
                        This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                        when you visit our website.
                    </p>

                    <h2>Information We Collect</h2>
                    <h3>Information You Provide</h3>
                    <p>
                        We may collect information that you voluntarily provide to us when you:
                    </p>
                    <ul>
                        <li>Contact us via email or contact forms</li>
                        <li>Request information about our services</li>
                        <li>Subscribe to our newsletter or updates</li>
                    </ul>

                    <h3>Automatically Collected Information</h3>
                    <p>
                        When you visit our website, we may automatically collect certain information about your device,
                        including information about your web browser, IP address, time zone, and some of the cookies
                        that are installed on your device.
                    </p>

                    <h2>How We Use Your Information</h2>
                    <p>
                        We use the information we collect to:
                    </p>
                    <ul>
                        <li>Respond to your inquiries and provide customer service</li>
                        <li>Send you marketing and promotional communications (with your consent)</li>
                        <li>Improve our website and services</li>
                        <li>Analyze usage trends and preferences</li>
                    </ul>

                    <h2>Disclosure of Your Information</h2>
                    <p>
                        We do not sell, trade, or rent your personal information to third parties.
                        We may share your information with:
                    </p>
                    <ul>
                        <li>Service providers who assist us in operating our website</li>
                        <li>Professional advisors and consultants</li>
                        <li>Law enforcement or regulatory authorities when required by law</li>
                    </ul>

                    <h2>Cookies and Tracking Technologies</h2>
                    <p>
                        We may use cookies and similar tracking technologies to track activity on our website
                        and hold certain information. You can instruct your browser to refuse all cookies or
                        to indicate when a cookie is being sent.
                    </p>

                    <h2>Third-Party Services</h2>
                    <p>
                        Our website may contain links to third-party websites. We are not responsible for
                        the privacy practices of these external sites. We encourage you to read their privacy policies.
                    </p>

                    <h2>Data Security</h2>
                    <p>
                        We implement appropriate technical and organizational security measures to protect your
                        personal information. However, no method of transmission over the Internet or electronic
                        storage is 100% secure.
                    </p>

                    <h2>Your Rights</h2>
                    <p>
                        Depending on your location, you may have certain rights regarding your personal information, including:
                    </p>
                    <ul>
                        <li>The right to access your personal information</li>
                        <li>The right to correct inaccurate information</li>
                        <li>The right to delete your personal information</li>
                        <li>The right to object to or restrict processing</li>
                    </ul>

                    <h2>Children's Privacy</h2>
                    <p>
                        Our services are not directed to individuals under the age of 18. We do not knowingly
                        collect personal information from children.
                    </p>

                    <h2>Changes to This Privacy Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of any changes
                        by posting the new Privacy Policy on this page and updating the "Last updated" date.
                    </p>

                    <h2>Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at:
                    </p>
                    <p>
                        <strong>Rivers Marine LLC</strong><br />
                        Email: <a href={`mailto:${siteConfig.site_email}`}>{siteConfig.site_email}</a><br />
                        St. Louis, MO, USA<br />
                        Asunción, Paraguay
                    </p>
                </Prose>
            </Container>
        </Section>
    );
}


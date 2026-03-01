import * as brevo from '@getbrevo/brevo';

// @ts-expect-error brevo types are incomplete
const apiInstance = new brevo.TransactionalEmailsApi();

if (process.env.BREVO_API_KEY) {
    // @ts-expect-error brevo types are incomplete
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
} else {
    console.warn("BREVO_API_KEY is not set.");
}

interface SendEmailParams {
    to: { email: string; name: string }[];
    subject: string;
    htmlContent: string;
    sender?: { email: string; name: string };
}

export const sendEmail = async ({ to, subject, htmlContent, sender = { email: "no-reply@aura.ai", name: "Aura.Ai" } }: SendEmailParams) => {
    // @ts-expect-error brevo types are incomplete
    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = sender;
    sendSmtpEmail.to = to;

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Email sent successfully:', data);
        return data;
    } catch (error) {
        console.error('Error sending email via Brevo:', error);
        throw error;
    }
};

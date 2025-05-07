import Mailjet from "node-mailjet";

const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY || 'your-api-key',
  apiSecret: process.env.MAILJET_API_SECRET || 'your-api-secret'
});

interface EmailAttachment {
  ContentType: string;
  Filename: string;
  Base64Content: string;
}

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  attachment: EmailAttachment;
}

const sendEmail = async ({ to, subject, text, attachment }: SendEmailParams): Promise<any> => {
  const message = {
    From: {
      Email: "joyce@metrocalendars.com",
      Name: "Joyce Nazabal"
    },
    To: [{ Email: to }],
    Subject: subject,
    TextPart: text,
    Attachments: attachment ? [attachment] : [],
  };

  try {
    const request = await mailjet.post("send", { version: "v3.1" }).request({ Messages: [message] });
    return request.body;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export default sendEmail;
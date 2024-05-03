let  mailjet = require("node-mailjet").connect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_API_SECRET
);

const sendEmail = async (to, subject, text, html, attachments = []) => {
  try {
    const request = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "brandonlewis.10@gmail.com", // Use your verified sender email address
            Name: "Joyce Nazabal",
          },
          To: [
            {
              Email: to,
            },
          ],
          Subject: subject,
          TextPart: text,
          HTMLPart: html,
          Attachments: attachments,
        },
      ],
    });

    console.log("Send email:", request.body);
    return request.body;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = { sendEmail };

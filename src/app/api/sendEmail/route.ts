import sendEmail from "@/utils/sendEmail";

export async function POST(req: Request) {
    try {
      const { to, subject, text, attachment } = await req.json();
      const data = await sendEmail({ to, subject, text, attachment });
      return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
      console.error("Error during email send:", error);
      return new Response(JSON.stringify({ error: "Failed to send email" }), { status: 500 });
    }
  }
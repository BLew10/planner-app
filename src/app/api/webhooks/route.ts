import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { deletePaymentByScheduleId } from "@/actions/payments/deletePayment";
import { updatePaymentFromStripeSchedule } from "@/lib/data/payment";
import { handleInvoicePaid, updateInvoiceStatus, updateInvoice, updateInvoiceSentDate, createInvoice , updateInvoiceUrl } from "@/lib/data/paymentInvoice";
import { sendInvoiceEmail, setInvoiceToAutoAdvanced } from "@/lib/helpers/stripeHelpers";

// TODO: add webhook secret to env
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST as string || process.env.STRIPE_SECRET_KEY_LIVE as string);
export async function POST(request: NextRequest) {
  try {
    // Ensure method is POST
    console.log("Stripe webhook");
    const sig = request.headers.get("stripe-signature");
    const reqBuffer = await request.arrayBuffer();

    let event: Stripe.Event;

    try {
      if (!sig) throw new Error("Missing Stripe signature");
      const buf = Buffer.from(reqBuffer);
      event = stripe.webhooks.constructEvent(
        buf,
        sig,
        endpointSecret as string
      );
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return new NextResponse("Webhook Error: signature verification failed", {
        status: 400,
      });
    }

    // Handle the Stripe event
    let subscriptionScheduleId: string | null = null;
    if (event.type.startsWith('invoice.')) {
      const invoice: Stripe.Invoice = event.data.object as Stripe.Invoice;
      const schedules = await stripe.subscriptionSchedules.list();
      const schedule = schedules.data.find((schedule) => schedule.subscription === invoice.subscription);
      subscriptionScheduleId = schedule?.id as string || null;
  
    }
    switch (event.type) {
      
      case "subscription_schedule.canceled":
        // Example event type handling
        const canceledSubscriptionSchedule = event.data.object as Stripe.SubscriptionSchedule;
        console.log(`Canceled Subscription Schedule was successful! Subscription Schedule ID: ${canceledSubscriptionSchedule.id}`);
        await deletePaymentByScheduleId(canceledSubscriptionSchedule);
        break;
      case "subscription_schedule.completed":
        // Not supporting completed subscription schedule as of now, will set as completed with invoices
        const completedSubscriptionSchedule = event.data.object as Stripe.SubscriptionSchedule;
        console.log(`Completed Subscription Schedule was successful! PaymentIntent ID: ${completedSubscriptionSchedule.id}`);
        break;
      case "subscription_schedule.aborted":
        const abortedSubscriptionSchedule = event.data.object as Stripe.SubscriptionSchedule;
        console.log(`Aborted Subscription Schedule was successful! PaymentIntent ID: ${abortedSubscriptionSchedule.id}`);
        await deletePaymentByScheduleId(abortedSubscriptionSchedule);

        break;
      case "subscription_schedule.released":
        // Not supporting released subscription schedule as of now
        const releasedSubscriptionSchedule = event.data.object as Stripe.SubscriptionSchedule;
        console.log(`Released Subscription Schedule was successful! PaymentIntent ID: ${releasedSubscriptionSchedule.id}`);
        break;
      case "subscription_schedule.updated":
        const updatedSubscriptionSchedule = event.data.object as Stripe.SubscriptionSchedule;
        console.log(`Updated Subscription Schedule was successful! PaymentIntent ID: ${updatedSubscriptionSchedule.id}`);
        await updatePaymentFromStripeSchedule(updatedSubscriptionSchedule);
        break;
      case "subscription_schedule.created":
        // Not supporting created subscription schedule as of now
        const createdSubscriptionSchedule = event.data.object as Stripe.SubscriptionSchedule;
        console.log(`Created Subscription Schedule was successful! PaymentIntent ID: ${createdSubscriptionSchedule.id}`);
        break;
      case "invoice.created":
        const createdInvoice = event.data.object as Stripe.Invoice;
        console.log(`Created Invoice was successful! Invoice ID: ${createdInvoice.id}`);
        if (!subscriptionScheduleId) {
          console.error("Subscription Schedule ID not found", createdInvoice);
          break
        }
        await createInvoice(createdInvoice, subscriptionScheduleId as string);
        break;
      case "invoice.sent":
        const sentInvoice = event.data.object as Stripe.Invoice;
        console.log(`Sent Invoice was successful! Invoice ID: ${sentInvoice.id}`);
        await updateInvoiceSentDate(sentInvoice.id);
        break;
      case "invoice.paid":
        const paidInvoice = event.data.object as Stripe.Invoice;
        console.log(`Paid Invoice was successful! Invoice ID: ${paidInvoice.id}`);
        await handleInvoicePaid(paidInvoice, new Date());
        break;
      case "invoice.payment_failed":
        const paymentFailedInvoice = event.data.object as Stripe.Invoice;
        console.log(`Payment Failed Invoice was successful! Invoice ID: ${paymentFailedInvoice.id}`);
        await updateInvoiceStatus(paymentFailedInvoice.id, "Failed");
        break;
      case "invoice.finalized":
        const finalizedInvoice = event.data.object as Stripe.Invoice;
        console.log(`Finalized Invoice was successful! Invoice ID: ${finalizedInvoice.id}`);
        await updateInvoiceUrl(finalizedInvoice);
        await setInvoiceToAutoAdvanced(finalizedInvoice.id)
        await sendInvoiceEmail(finalizedInvoice.id);
        break;
      case "invoice.marked_uncollectible":
        const markedUncollectibleInvoice = event.data.object as Stripe.Invoice;
        console.log(`Marked Uncollectible Invoice was successful! Invoice ID: ${markedUncollectibleInvoice.id}`);
        await updateInvoiceStatus(markedUncollectibleInvoice.id, "Uncollectible");
        break;
      case "invoice.upcoming":
        // Not supporting upcoming invoice as of now
        const upcomingInvoice = event.data.object as Stripe.Invoice;
        console.log(`Upcoming Invoice was successful! Invoice ID: ${upcomingInvoice.id}`);
        break;
      case "invoice.voided":
        const voidedInvoice = event.data.object as Stripe.Invoice;
        console.log(`Voided Invoice was successful! Invoice ID: ${voidedInvoice.id}`);
        await updateInvoiceStatus(voidedInvoice.id, "Voided");
        break;
      case "invoice.deleted":
        const deletedInvoice = event.data.object as Stripe.Invoice;
        console.log(`Deleted Invoice was successful! Invoice ID: ${deletedInvoice.id}`);
        await updateInvoiceStatus(deletedInvoice.id, "Cancelled");
        break;
      case "invoice.updated":
        const updatedInvoice = event.data.object as Stripe.Invoice;
        console.log(`Updated Invoice was successful! Invoice ID: ${updatedInvoice.id}`);
        await updateInvoice(updatedInvoice);
        break;
      case "invoice.payment_succeeded":
        // Not supporting payment succeeded invoice as of now, redundant due to invoice.paid
        const paymentSucceededInvoice = event.data.object as Stripe.Invoice;
        console.log(`Payment Succeeded Invoice was successful! Invoice ID: ${paymentSucceededInvoice.id}`);
        break;
      case "invoice.finalization_failed":
        // Not supporting finalization failed invoice as of now
        const finalizationFailedInvoice = event.data.object as Stripe.Invoice;
        console.log(`Finalization Failed Invoice was successful! Invoice ID: ${finalizationFailedInvoice.id}`);
        break;
      case "invoice.payment_action_required":
        // Not supporting payment action required invoice as of now
        const paymentActionRequiredInvoice = event.data.object as Stripe.Invoice;
        console.log(`Payment Action Required Invoice was successful! Invoice ID: ${paymentActionRequiredInvoice.id}`);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new NextResponse(JSON.stringify({ received: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    return new NextResponse(
      JSON.stringify({ message: `Server error: ${(err as Error).message}` }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

export async function GET() {
  console.log("Hello, Stripe!");
  return NextResponse.json({ message: "Hello, Stripe!" });
}

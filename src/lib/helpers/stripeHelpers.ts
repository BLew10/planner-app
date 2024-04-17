import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Helper to find or create a Stripe customer
export async function findOrCreateStripeCustomer(
  id: string,
  email: string
): Promise<Stripe.Customer | null> {
  try {
    if (id) {
      try {
        const customer = await stripe.customers.retrieve(id);
        if (!customer.deleted) {
          return customer;
        } else {
          return await stripe.customers.create({ email: email });
        }
      } catch (error: any) {
        if (
          error.type === "StripeInvalidRequestError" &&
          error.code === "resource_missing"
        ) {
          return await stripe.customers.create({ email: email });
        } else {
          throw error;
        }
      }
    } else {
      return await stripe.customers.create({ email: email });
    }
  } catch (error) {
    console.log("Error upserting customer", error);
    return null;
  }
}

export async function upsertStripeCustomer(
  id: string,
  email: string
): Promise<Stripe.Customer | null> {
  try {
    if (id) {
      try {
        const customer = await stripe.customers.retrieve(id);
        if (customer.deleted) {
          return await stripe.customers.create({ email: email });
        } else {
          return await stripe.customers.update(id, { email: email });
        }
      } catch (error: any) {
        if (
          error.type === "StripeInvalidRequestError" &&
          error.code === "resource_missing"
        ) {
          return await stripe.customers.create({ email: email });
        } else {
          throw error;
        }
      }
    } else {
      return await stripe.customers.create({ email: email });
    }
  } catch (error) {
    console.log("Error upserting customer", error);
    return null;
  }
}

export async function getStripeCustomerById(
  id: string
): Promise<Stripe.Customer | Stripe.DeletedCustomer | null> {
  try {
    return await stripe.customers.retrieve(id);
  } catch (error) {
    console.log("Error getting customer", error);
    return null;
  }
}

// Helper to create a Stripe price
export async function createStripePrice(
  amountInCents: number,
  frequency: string,
  companyName: string
): Promise<Stripe.Price | null> {
  try {
    const interval = stripeIntervalMap(frequency);
    return await stripe.prices.create({
      unit_amount: amountInCents,
      currency: "usd",
      recurring: { interval: interval },
      product_data: {
        name: `Advertisement Purchase for ${companyName}`,
      },
    });
  } catch (error) {
    console.log("Error creating price", error);
    return null;
  }
}

export async function getStripePriceById(
  id: string
): Promise<Stripe.Price | null> {
  try {
    return await stripe.prices.retrieve(id);
  } catch (error) {
    console.log("Error getting price", error);
    return null;
  }
}
// Helper to update a Stripe Payment Method
export async function updateStripePrice(
  amountInCents: number,
  price: Stripe.Price | Stripe.DeletedPrice,
  frequency: string,
  companyName: string,
  scheduleId: string
): Promise<Stripe.Price | null> {
  try {
    const interval = stripeIntervalMap(frequency);
    const oldPrice = await stripe.prices.retrieve(price.id);
    if (oldPrice?.recurring?.interval !== interval) {
      // Stripe does not allow to update the interval so we need to create a new price
      // and  update the schedule
      const stripePriceName = `${companyName}: Updated on ${new Date().toLocaleString()}`;
      const newPrice = await createStripePrice(
        amountInCents,
        frequency,
        stripePriceName
      );
      if (!newPrice) {
        return null;
      }
      await stripe.subscriptionSchedules.update(scheduleId, {
        phases: [
          {
            items: [{ price: newPrice.id, quantity: 1 }],
            iterations: 1,
          },
        ],
      });
      return newPrice;
    }
    return await stripe.prices.update(price.id, {
      currency_options: {
        usd: { unit_amount: amountInCents },
      },
    });
  } catch (error) {
    console.log("Error updating price", error);
    return null;
  }
}

const stripeIntervalMap = (
  frequency: string
): Stripe.SubscriptionScheduleCreateParams.Phase.Item.PriceData.Recurring.Interval => {
  switch (frequency) {
    case "Daily":
      return "day";
    case "Weekly":
      return "week";
    case "Monthly":
      return "month";
    case "Annually":
      return "year";
    default:
      throw new Error(`Unsupported frequency: ${frequency}`);
  }
};
// Helper to create a Stripe subscription schedule
export async function createStripeSubscriptionSchedule(
  customerId: string,
  priceId: string,
  startDate: string,
  totalPayments: number
): Promise<Stripe.SubscriptionSchedule | null> {
  try {
    const [year, month, day] = startDate.split("-");
    const startDateFormat = `${month}-${day}-${year}`;
    const isToday =
      new Date(startDateFormat).toDateString() === new Date().toDateString();
    const scheduleStartDate = isToday
      ? "now"
      : Math.floor(new Date(startDateFormat).getTime() / 1000);
    return await stripe.subscriptionSchedules.create({
      customer: customerId,
      start_date: scheduleStartDate,
      end_behavior: "cancel",
      phases: [
        {
          items: [{ price: priceId, quantity: 1 }],
          iterations: totalPayments,
          collection_method: "send_invoice",
          invoice_settings: {
            days_until_due: 30,
          },
          proration_behavior: "none",
        },
      ],
    });
  } catch (error) {
    console.log("Error creating subscription schedule", error);
    return null;
  }
}

// Helper to update a Stripe subscription schedule (Not used)
export async function updateStripeSubscriptionSchedule(
  scheduleId: string,
  iterations: number,
  startDate: string
): Promise<Stripe.SubscriptionSchedule | null> {
  try {
    const oldSchedule = await stripe.subscriptionSchedules.retrieve(scheduleId);
    const price = oldSchedule?.phases[0]?.items[0]?.price as Stripe.Price;
    const priceId = price as any;
    const [year, month, day] = startDate.split("-");
    const startDateFormat = `${month}-${day}-${year}`;
    const isToday =
      new Date(startDateFormat).toDateString() === new Date().toDateString();
    const scheduleStartDate = isToday
      ? "now"
      : Math.floor(new Date(startDateFormat).getTime() / 1000);
    return await stripe.subscriptionSchedules.update(scheduleId, {
      phases: [
        {
          items: [{ price: priceId, quantity: 1 }],
          start_date: scheduleStartDate,
          iterations: iterations,
        },
      ],
    });
  } catch (error) {
    console.log("Error updating subscription schedule", error);
    return null;
  }
}

// Helper to cancel a Stripe subscription schedule
export async function cancelStripeSchedule(
  scheduleId: string
): Promise<Stripe.SubscriptionSchedule | null> {
  console.log("Cancelling subscription", scheduleId);
  try {
    return await stripe.subscriptionSchedules.cancel(scheduleId);
  } catch (error) {
    console.log("Error canceling subscription", error);
    return null;
  }
}

export async function setInvoiceToAutoAdvanced(stripeInvoiceId: string) {
  try {
    const invoice = await stripe.invoices.update(stripeInvoiceId, {
      auto_advance: true,
    });
  } catch (e) {
    console.log("Error setting invoice to auto advance", e);
    return null;
  }
}

export async function sendInvoiceEmail(stripeInvoiceId: string) {
  try {
    const invoice = await stripe.invoices.sendInvoice(stripeInvoiceId);
  } catch (e) {
    console.log("Error sending invoice email", e);
    return null;
  }
}

export async function deleteStripeCustomer(stripeCustomerId: string) {
  try {
    const customer = await stripe.customers.del(stripeCustomerId);
    return customer;
  } catch (e) {
    console.log("Error deleting customer", e);
    return null;
  }
}

export async function addSubscriptionIdToPayment(
  stripeScheduleId: string,
  subscriptionId: string
) {
  try {
    const contact = await prisma?.payment.update({
      where: { stripeScheduleId: stripeScheduleId },
      data: { stripeSubscriptionId: subscriptionId },
    });
    return contact;
  } catch (e) {
    console.log("Error adding subscription to contact", e);
    return null;
  }
}

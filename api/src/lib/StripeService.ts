import * as Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRETKEY);
const subscriptionPlan = process.env.STRIPE_PLAN;

// create customer in stripe, return cus_id
export async function createCustomer(name: string, team_id: number, token: string) {
    const newCustomer = await stripe.customers.create({
        description: name,
        metadata: { team_id },
        source: token,
    });
    if (newCustomer && newCustomer.id) {
        return newCustomer.id;
    } else {
        throw new Error("stripe did not return a valid customer id");
    }
}

// get info from stripe and update CC, if needed
export async function updateSubscription(customer: string, token: string) {
    const stripeCustomer = await stripe.customers.update(customer, { source: token });

    // check if subscription already exists
    if (stripeCustomer.subscriptions.total_count < 1) {
        await stripe.subscriptions.create({
            customer,
            items: [{ plan: subscriptionPlan }],
        });
    }
}

// retuns the most recent credit card for customer
export async function getFundingSource(customer: string) {
    const stripeCustomer = await stripe.customers.retrieve(customer);
    if (stripeCustomer.sources.data[0]) {
        return stripeCustomer.sources.data[0];
    }

    return {};
}

import httpStatus from "http-status";
import Stripe from "stripe";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { AppError } from "../../utils/appError";
import { validateFields } from "../../utils/validateFields";
import { ICreatePaymentPayload } from "./payment.interface";

const createCheckoutSessionIntoDB = async (
  customerId: string,
  payload: ICreatePaymentPayload,
) => {
  validateFields(payload, ["rentalOrderId"]);

  const rentalOrder = await prisma.rentalOrder.findUnique({
    where: { id: payload.rentalOrderId },
    include: {
      customer: { omit: { password: true } },
      gearItem: true,
      payments: true,
    },
  });

  if (!rentalOrder) {
    throw new AppError(httpStatus.NOT_FOUND, "Rental order not found");
  }

  if (rentalOrder.customerId !== customerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to pay for this rental order",
    );
  }

  if (rentalOrder.status === "CANCELLED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cancelled rental order cannot be paid",
    );
  }

  if (rentalOrder.status === "PAID") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This rental order has already been paid",
    );
  }

  const isPaid = rentalOrder.payments.some(
    (payment) => payment.status === "PAID",
  );
  if (isPaid) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This rental order has already been paid",
    );
  }

  const amount = Number(rentalOrder.totalAmount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid payment amount");
  }

  const stripeAmount = Math.round(amount * 100);

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: rentalOrder.customer.email,
    client_reference_id: rentalOrder.id,
    success_url: `${config.app_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.app_url}/payment/cancel?rentalOrderId=${rentalOrder.id}`,
    line_items: [
      {
        price_data: {
          currency: config.stripe_currency,
          unit_amount: stripeAmount,
          product_data: {
            name: rentalOrder.gearItem.name,
            description: `GearUp rental order ${rentalOrder.id}`,
            metadata: {
              rentalOrderId: rentalOrder.id,
              customerId,
            },
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      rentalOrderId: rentalOrder.id,
      customerId,
    },
    payment_intent_data: {
      metadata: {
        rentalOrderId: rentalOrder.id,
        customerId,
      },
      description: `GearUp rental payment for ${rentalOrder.gearItem.name}`,
    },
  });

  return {
    sessionId: checkoutSession.id,
    url: checkoutSession.url,
  };
};

const handleCheckoutSessionCompleted = async (
  session: Stripe.Checkout.Session,
) => {
  const rentalOrderId = session.metadata?.rentalOrderId;
  const customerId = session.metadata?.customerId;

  if (!rentalOrderId || !customerId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Missing Stripe checkout session metadata",
    );
  }

  const amount = session.amount_total ? session.amount_total / 100 : 0;
  if (!amount) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Missing Stripe checkout session amount",
    );
  }

  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.upsert({
      where: { transactionId: session.id },
      create: {
        transactionId: session.id,
        amount,
        paymentMethod: "card",
        paymentProvider: "STRIPE",
        status: "PAID",
        paidAt: new Date(),
        rentalOrderId,
        customerId,
      },
      update: {
        status: "PAID",
        paidAt: new Date(),
      },
    });

    const rentalOrderUpdate = await tx.rentalOrder.updateMany({
      where: { id: rentalOrderId, customerId },
      data: { status: "PAID" },
    });

    console.log("Stripe checkout completed:", {
      sessionId: session.id,
      rentalOrderId,
      paymentId: payment.id,
      rentalOrderRowsUpdated: rentalOrderUpdate.count,
    });
  });
};

const handleCheckoutSessionExpired = async (
  session: Stripe.Checkout.Session,
) => {
  console.log("Stripe checkout session expired:", {
    sessionId: session.id,
    rentalOrderId: session.metadata?.rentalOrderId,
  });
};

const handleStripeWebhook = async (payload: Buffer, signature?: string) => {
  console.log("Stripe webhook received:", {
    signaturePresent: Boolean(signature),
    payloadIsBuffer: Buffer.isBuffer(payload),
  });

  if (!signature) {
    throw new AppError(httpStatus.BAD_REQUEST, "Missing Stripe signature");
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripe_webhook_secret,
    );
  } catch (err: any) {
    console.error("Stripe webhook signature verification failed:", err.message);
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Stripe webhook signature verification failed: ${err.message}`,
    );
  }

  console.log("Stripe webhook verified:", { eventType: event.type });

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(
        event.data.object as Stripe.Checkout.Session,
      );
      break;
    case "checkout.session.expired":
      await handleCheckoutSessionExpired(
        event.data.object as Stripe.Checkout.Session,
      );
      break;
    default:
      console.log("Unhandled Stripe webhook event:", event.type);
      break;
  }

  return { received: true };
};

const getCustomerPaymentsFromDB = async (customerId: string) => {
  const payments = await prisma.payment.findMany({
    where: { customerId },
    include: {
      rentalOrder: {
        include: {
          gearItem: true,
        },
      },
      customer: { omit: { password: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return payments;
};

const getCustomerPaymentByIdFromDB = async (id: string, customerId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      rentalOrder: {
        include: {
          gearItem: true,
        },
      },
      customer: { omit: { password: true } },
    },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }

  if (payment.customerId !== customerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to view this payment",
    );
  }

  return payment;
};

export const paymentService = {
  createCheckoutSessionIntoDB,
  handleStripeWebhook,
  getCustomerPaymentsFromDB,
  getCustomerPaymentByIdFromDB,
};

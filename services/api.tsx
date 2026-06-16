/**CURRENTLY DEFUNCT */

// -------------------------------------
// CREATE A BUSINESS

import { organisationsApi } from "@/lib/api/organisation";
import { data, redirect, type SessionData } from "react-router";
import type {
  AddedLine,
  BackendResponse,
  Client,
  ClientUpdateParams,
  Customer,
  InvoiceStatus,
  OrganisationCore,
  PaymentMethod,
  ServerActionState,
} from "types";
import {
  genericErrorState,
  genericNetworkError,
  getRateLimitMessage,
  safeParseJSON,
} from "utils";
import {
  BASE_URL,
  CREATE_BUSINESS_URL,
  LIST_BUSINESS_URL,
} from "utils/endpoints";

// -------------------------------------
export async function createOrg(formData: FormData, accessToken: string) {
  const name = formData.get("name") as string | undefined;
  const desc = formData.get("desc") as string | undefined;
  const email = formData.get("email") as string | undefined;
  const phone = formData.get("phone") as string | undefined;
  const address = formData.get("address") as string | undefined;
  const pfp = formData.get("pfp") as File | undefined;
  const url = formData.get("url") as string | undefined;

  const errors: Record<string, string> = {};

  if (!name) errors.name = "Please enter your name.";
  if (!email) errors.email = "Please enter your email address.";
  if (!desc)
    errors.desc = "Please provide a description for your organisation.";

  if (Object.keys(errors).length > 0)
    return data<ServerActionState>({ success: false, errors }, { status: 400 });

  try {
    const res = await fetch(BASE_URL + CREATE_BUSINESS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name,
        email,
        address,
        description: desc,
        phone_number: phone,
        logo: pfp,
        logo_url: url,
      }),
    });

    const raw = await res.json();
    const result = raw as BackendResponse;

    if (!res.ok) {
      console.log("LOG::CREATE_ORG_FAILED", raw);
      const error = result.error;

      if (error?.code === "RATE_LIMIT_EXCEEDED") {
        return data<ServerActionState>(
          {
            success: false,
            message: getRateLimitMessage(error.details?.retry_after),
          },
          { status: res.status },
        );
      }

      if (error?.code === "VALIDATION_ERROR") {
        return data<ServerActionState>(
          { success: false, message: error.message },
          { status: res.status },
        );
      }

      return data<ServerActionState>(genericErrorState(), {
        status: res.status,
      });
    }

    const resData = result.data as OrganisationCore;

    console.log("LOG::CREATE_ORG_SUCCESS", resData);

    return redirect(`/dashboard/org/${resData.id}`);
    // return redirect(`/dashboard/organisations`);
  } catch (err) {
    console.log("LOG::CREATE_ORG_ERROR", (err as Error).message);
    return data<ServerActionState>(
      {
        ...(genericNetworkError((err as Error).message) || genericErrorState()),
      },
      { status: 500 },
    );
  }
}

export async function fetchAllOrgs(
  accessToken: string,
): Promise<ServerActionState & { orgs?: OrganisationCore[] }> {
  try {
    const res = await fetch(BASE_URL + LIST_BUSINESS_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include", // 👈 important
    });

    const raw = await res.json();
    const result = raw as BackendResponse;

    if (!res.ok) {
      console.log("LOG::FETCH_ORGS_FAILED", raw);
      const error = result.error;

      if (error?.code === "RATE_LIMIT_EXCEEDED") {
        return {
          success: false,
          message: getRateLimitMessage(error.details?.retry_after),
        };
      }

      if (error?.code === "VALIDATION_ERROR") {
        return { success: false, message: error.message };
      }

      return genericErrorState();
    }

    const resData = result.data as OrganisationCore[];

    console.log("LOG::FETCH_ORGS_SUCCESS", resData);

    return { success: true, orgs: resData };
  } catch (err) {
    console.log("LOG::FETCH_ORGS_ERROR", (err as Error).message);
    return genericNetworkError((err as Error).message) || genericErrorState();
  }
}

export async function handleSalesActions({
  formData,
  id,
  session,
}: {
  session?: SessionData | null;
  formData: FormData;
  id: string;
}) {
  const intent = formData.get("intent");

  const invId = formData.get("invId") as string | undefined;

  // JSON
  const _lines = formData.get("lines") as string | undefined;
  const _client = formData.get("client") as string | undefined;

  const method = formData.get("method") as PaymentMethod | undefined;
  const _tax = formData.get("tax") as string | undefined;
  const _advance = formData.get("advance") as string | undefined;
  const onCredit = formData.get("on-credit") as string | undefined;
  const archived = formData.get("archived") as string | undefined;
  const due = formData.get("due-date") as string | undefined;
  const reason = formData.get("reason") as string | undefined;
  const status = formData.get("status") as InvoiceStatus | undefined;

  const _amount = formData.get("amount") as string | undefined;
  const restock = formData.get("restock") as string | undefined;

  // Parsing JSON data
  const lines = safeParseJSON<AddedLine[]>(_lines);
  const client = safeParseJSON<Client | ClientUpdateParams>(_client);

  // fuick check if client is empty object
  const hasData =
    client && typeof client === "object" && Object.keys(client).length > 0;
  // Converting formatted amounts back to numbers
  const advance = parseInt(`${_advance}`.replace(/\D/g, ""), 10) || 0;
  const tax = parseInt(`${_tax}`.replace(/\D/g, ""), 10) || 0;
  const amount = parseInt(`${_amount}`.replace(/\D/g, ""), 10) || 0;

  const totals = lines?.reduce(
    (acc, l) => {
      const lineTotal = l.qty * l.unit_price;
      const discount = l.qty * (l.discount || 0);

      acc.subtotal += lineTotal;
      acc.totalDiscount += discount; // or discount * l.quantity
      return acc;
    },
    { subtotal: 0, totalDiscount: 0 },
  );

  const total = (totals?.subtotal || 0) - (totals?.totalDiscount || 0) + tax;
  const errors: Record<string, string> = {};

  switch (intent) {
    case "create-invoice": {
      const isNewClient =
        "id" in client!
          ? { customer_id: client.id }
          : {
              customer_name: client?.name,
              customer_email: client?.email,
              customer_phone: client?.phone_number,
              customer_address: client?.address,
              customer_type: client?.customer_type.toUpperCase() as
                | Customer
                | undefined,
            };
      if (!lines?.length) errors.lines = "Please add products to the invoice.";
      if (!_client || !hasData)
        errors.client = "Please select or add a client..";
      if (advance + tax < total && !onCredit)
        errors.credit =
          "The amount paid appears to be less than the total. Please mark as 'credit'";
      if (onCredit && status !== "CREDIT")
        errors.status =
          "The status should be set to 'Credit' for credit invoices";

      if (onCredit) {
        if (!due) errors.due = "Please provide a due date for the credit.";
        if (!reason) errors.reason = "Please provide a reason for the credit.";
      }

      if (Object.keys(errors).length > 0) return { success: false, errors };

      if (session?.accessToken)
        return await organisationsApi.createInvoice(session.accessToken, {
          business_id: id,
          lines: lines!.map((l) => ({
            product_id: l.id,
            quantity: l.qty,
            discount: (l.discount || 0) * l.qty,
          })),
          is_credit: onCredit ? true : false,
          status: status?.toUpperCase() as InvoiceStatus,
          payment_method: method!,
          ...isNewClient,
          advance_paid: advance,
          due_date: due,
          reason,
          tax,
        });
      break;
    }
    case "update-invoice": {
      //onCredit here if actually `is_credit_settled`
      // if (!onCredit &&  status !== "CREDIT")
      //   errors.status =
      //     "The status should be set to 'Credit' for credit invoices";

      const _total = formData.get("total") as string | undefined;
      const total = parseInt(`${_total}`.replace(/\D/g, ""), 10) || 0;

      if (advance + tax < total + tax) {
        if (onCredit)
          errors.credit =
            "The amount paid appears to be less than the total. Please uncheck";
        if (status !== "CREDIT")
          errors.status =
            "The status should be set to 'Credit' for credit invoices";
      }

      if (Object.keys(errors).length > 0) return { success: false, errors };

      if (session?.accessToken && invId)
        return await organisationsApi.updateInvoice(
          session.accessToken,
          invId,
          {
            is_credit_settled: onCredit ? true : false,
            status: status,
            payment_method: method,
            advance_paid: advance,
            due_date: due,
            reason,
            is_archived: archived ? true : false,
            tax,
          },
        );
      break;
    }

    case "credit-invoice": {
      if (session?.accessToken && invId)
        return await organisationsApi.creditInvoice(
          session.accessToken,
          invId,
          {
            amount,
            payment_method: method!,
          },
        );
      break;
    }

    case "refund": {
      if (session?.accessToken && invId)
        return await organisationsApi.processRefund(
          session.accessToken,
          invId,
          {
            amount,
            reason: reason!,
            restore_stock: restock ? true : false,
          },
        );
      break;
    }

    default:
      return genericErrorState();
  }
  return genericErrorState();
}

export async function handleProductActions({
  formData,
  id,
  session,
}: {
  session?: SessionData | null;
  formData: FormData;
  id: string;
}) {
  const intent = formData.get("intent");

  const prodId = formData.get("id") as string | undefined;

  const name = formData.get("name") as string | undefined;
  const desc = formData.get("desc") as string | undefined;
  const code = formData.get("code") as string | undefined;
  const cat = formData.get("cat") as string | undefined;
  const subcat = formData.get("subcat") as string | undefined;
  const _purchase = formData.get("purchase") as string | undefined;
  const _unit = formData.get("unit") as string | undefined;
  const _qty = formData.get("qty") as string | undefined;
  const _min = formData.get("min") as string | undefined;
  const exp = formData.get("exp") as string | undefined;
  const onPromo = formData.get("on-promo") as string | undefined;
  const promoStart = formData.get("promo-start") as string | undefined;
  const promoEnd = formData.get("promo-end") as string | undefined;
  const _promo = formData.get("promo") as string | undefined;
  const pfp = formData.get("pfp") as File | undefined;
  const url = formData.get("url") as string | undefined;

  // Converting formatted amounts back to numbers
  const purchase = parseInt(`${_purchase}`.replace(/\D/g, ""), 10) || 0;
  const unit = parseInt(`${_unit}`.replace(/\D/g, ""), 10) || 0;
  const promo = parseInt(`${_promo}`.replace(/\D/g, ""), 10) || 0;

  // Converting string to actual numbers
  const qty = Number(_qty);
  const min = Number(_min);

  // For comparing the promo dates
  const isEarlier = (a?: string, b?: string) => {
    if (!a || !b) return;
    return new Date(a).getTime() < new Date(b).getTime();
  };

  const errors: Record<string, string> = {};

  if (!name) errors.name = "Please provide an product name.";
  if (!cat) errors.cat = "Please select a product category.";
  if (purchase <= 0) errors.purchase = "Please provide the purchase price.";
  if (unit <= 0) errors.unit = "Please provide the unit price.";
  else if (unit <= purchase)
    errors.unit = "Selling price must be greater than purchase price";
  if (min > qty)
    errors.min = "Low threshold should be lower than the initial quantity";

  if (onPromo) {
    if (promo <= 0) errors.promo = "Please provide the promotional price.";
    else if (promo >= unit)
      errors.promo = "Promotional price must be lower than selling price";

    if (!promoStart || !promoEnd) {
      errors.promo_end = "Provide a duartion for the promotion";
      errors.promo_start = "Provide a duartion for the promotion";
    }
    if (!isEarlier(promoStart, promoEnd)) {
      errors.promo_end =
        "The promotion end date should be after the start date.";
    }
  }

  if (Object.keys(errors).length > 0) {
    const firstError = Object.values(errors).find(Boolean);
    return {
      success: false,
      errors,
      message: firstError ?? "Please fix the form errors.",
    };
  }
  switch (intent) {
    case "add-product": {
      if (session?.accessToken)
        return await organisationsApi.addProduct(session.accessToken, id, {
          business_id: id,
          name: name!,
          category_id: cat!,
          purchase_price: purchase,
          unit_price: unit,

          // Optional
          barcode: code,
          description: desc,
          expiry_date: exp,
          min_quantity: min > 0 ? min : undefined,
          quantity: qty > 0 ? qty : undefined,
          on_promotion: Boolean(onPromo) || false,
          promo_price: promo > 0 ? promo : undefined,
          promotion_end_date: promoEnd,
          promotion_start_date: promoStart,
          subcategory_id: subcat,
          image: pfp || undefined,
          image_url: url,
        });
      break;
    }

    case "update-product": {
      if (session?.accessToken && prodId)
        return await organisationsApi.updateProduct(
          session.accessToken,
          prodId,
          {
            name: name,
            category_id: cat,
            purchase_price: purchase,
            unit_price: unit,
            barcode: code,
            description: desc,
            expiry_date: exp,
            min_quantity: min > 0 ? min : undefined,
            quantity: qty > 0 ? qty : undefined,
            subcategory_id: subcat,
          },
        );
      break;
    }

    default:
      return genericErrorState();
  }
  return genericErrorState();
}

export async function handleClientActions({
  formData,
  id,
  session,
}: {
  session?: SessionData | null;
  formData: FormData;
  id: string;
}) {
  const intent = formData.get("intent");

  const customer_type = formData.get("type") as Customer;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string | undefined;
  const address = formData.get("address") as string | undefined;
  const phone_number = formData.get("phone") as string | undefined;

  const errors: Record<string, string> = {};
  // if (!lines?.length) errors.lines = "Please add products to the invoice.";
  if (Object.keys(errors).length > 0) return { success: false, errors };

  switch (intent) {
    case "add-client": {
      if (session?.accessToken)
        return await organisationsApi.createClient(session.accessToken, {
          business_id: id,
          name,
          customer_type: customer_type.toUpperCase() as Customer,
          address,
          email,
          phone_number,
        });
      break;
    }

    default:
      return genericErrorState();
  }
  return genericErrorState();
}

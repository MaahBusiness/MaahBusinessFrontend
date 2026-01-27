/**CURRENTLY DEFUNCT */

// -------------------------------------
// CREATE A BUSINESS

import { data, redirect } from "react-router";
import type {
  BackendResponse,
  OrganisationCore,
  ServerActionState,
} from "types";
import {
  genericErrorState,
  genericNetworkError,
  getRateLimitMessage,
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
    console.log("LOG::CREATE_ORG_ERROR", (err as any).message);
    return data<ServerActionState>(
      {
        ...(genericNetworkError((err as any).message) || genericErrorState()),
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
    console.log("LOG::FETCH_ORGS_ERROR", (err as any).message);
    return genericNetworkError((err as any).message) || genericErrorState();
  }
}

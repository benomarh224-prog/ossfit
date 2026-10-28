import { NextRequest } from "next/server";
import { updateAccount } from "@/lib/account-update";

export async function PATCH(req: NextRequest) {
  return updateAccount(req, true);
}

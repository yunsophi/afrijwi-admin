import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** The `/admin/*` proxy guard already keeps non-Admins out; this just gives
 * server actions and pages a typed session to work with. */
export async function requireAdminSession() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }
  return session;
}

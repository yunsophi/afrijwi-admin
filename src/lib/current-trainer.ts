import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Resolves the Trainer profile for the signed-in session. The `/trainer/*`
 * proxy guard already keeps non-Trainer roles out, but every Trainer query
 * must still scope by this id — never trust a client-supplied trainerId.
 */
export async function requireCurrentTrainer() {
  const session = await auth();
  if (!session || session.user.role !== "TRAINER") {
    redirect("/login");
  }

  const trainer = await prisma.trainer.findUnique({
    where: { userId: session.user.id },
  });

  if (!trainer) {
    redirect("/login");
  }

  return trainer;
}

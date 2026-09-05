"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/current-admin";
import { toJsonArray } from "@/lib/constants";

export type ActionState = { error?: string; success?: boolean } | undefined;

// ---------------------------------------------------------------------------
// Farmers
// ---------------------------------------------------------------------------

export async function createFarmer(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!name || !phone) return { error: "Name and phone number are required." };

  const farmer = await prisma.farmer.create({
    data: {
      name,
      phone,
      whatsapp: (formData.get("whatsapp") as string) || phone,
      district: String(formData.get("district") ?? ""),
      sector: String(formData.get("sector") ?? ""),
      preferredLanguage: String(formData.get("preferredLanguage") ?? "Kinyarwanda"),
      farmingType: String(formData.get("farmingType") ?? "BOTH") as never,
      mainCrops: (formData.get("mainCrops") as string) || null,
      mainLivestock: (formData.get("mainLivestock") as string) || null,
      notes: (formData.get("notes") as string) || null,
    },
  });

  revalidatePath("/admin/farmers");
  redirect(`/admin/farmers/${farmer.id}`);
}

export async function updateFarmer(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const id = String(formData.get("id"));

  await prisma.farmer.update({
    where: { id },
    data: {
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      whatsapp: String(formData.get("whatsapp") ?? ""),
      district: String(formData.get("district") ?? ""),
      sector: String(formData.get("sector") ?? ""),
      preferredLanguage: String(formData.get("preferredLanguage") ?? ""),
      farmingType: String(formData.get("farmingType") ?? "BOTH") as never,
      mainCrops: (formData.get("mainCrops") as string) || null,
      mainLivestock: (formData.get("mainLivestock") as string) || null,
      notes: (formData.get("notes") as string) || null,
    },
  });

  revalidatePath(`/admin/farmers/${id}`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// Cases
// ---------------------------------------------------------------------------

export async function createCase(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();

  const farmerId = String(formData.get("farmerId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!farmerId || !title || !description) {
    return { error: "Farmer, title and description are required." };
  }

  const requiredExpertise = formData.getAll("requiredExpertise").map(String);

  const created = await prisma.case.create({
    data: {
      farmerId,
      category: String(formData.get("category") ?? "OTHER") as never,
      title,
      description,
      originalMessage: (formData.get("originalMessage") as string) || null,
      urgency: String(formData.get("urgency") ?? "NORMAL") as never,
      district: String(formData.get("district") ?? ""),
      sector: String(formData.get("sector") ?? ""),
      village: (formData.get("village") as string) || null,
      requiredExpertise: toJsonArray(requiredExpertise),
      farmVisitRequired: formData.get("farmVisitRequired") === "on",
      preferredLocation: (formData.get("preferredLocation") as string) || null,
      languageRequirement: (formData.get("languageRequirement") as string) || null,
      otherRequirements: (formData.get("otherRequirements") as string) || null,
      status: "NEW",
    },
  });

  if (created.farmVisitRequired) {
    await ensureFarmVisit(created.id, created.requiredExpertise);
  }

  revalidatePath("/admin/cases");
  redirect(`/admin/cases/${created.id}`);
}

/** Manual override — lets Admin correct or revert a Case's status directly
 * (e.g. back to In Progress after a wrong click), separate from the guided
 * workflow actions above. */
export async function updateCaseStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const caseId = String(formData.get("caseId"));
  const status = String(formData.get("status"));

  await prisma.case.update({ where: { id: caseId }, data: { status: status as never } });

  revalidatePath(`/admin/cases/${caseId}`);
  revalidatePath("/admin/cases");
  revalidatePath("/admin");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Feedback — collected once, when Admin completes the Case
// ---------------------------------------------------------------------------

export async function addFeedbackAndCompleteCase(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdminSession();

  const caseId = String(formData.get("caseId"));
  const trainerId = String(formData.get("trainerId"));
  const addressed = String(formData.get("addressed") ?? "");
  const ratingRaw = formData.get("rating");
  const comment = (formData.get("comment") as string) || null;

  if (!trainerId) return { error: "No Trainer is linked to this Case yet." };
  if (!["YES", "PARTIALLY", "NO"].includes(addressed)) {
    return { error: "Select whether the Farmer's problem was addressed." };
  }

  const rating = ratingRaw ? Number(ratingRaw) : null;
  if (rating !== null && (rating < 1 || rating > 5)) {
    return { error: "Rating must be between 1 and 5." };
  }

  await prisma.$transaction([
    prisma.feedback.upsert({
      where: { caseId },
      update: { trainerId, addressed: addressed as never, rating, comment },
      create: { caseId, trainerId, addressed: addressed as never, rating, comment },
    }),
    prisma.case.update({ where: { id: caseId }, data: { status: "COMPLETED" } }),
  ]);

  revalidatePath(`/admin/cases/${caseId}`);
  revalidatePath("/admin/cases");
  revalidatePath("/admin");
  revalidatePath("/admin/feedback");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Matching / Assignment
// ---------------------------------------------------------------------------

export async function assignTrainerToCase(caseId: string, trainerId: string) {
  await requireAdminSession();

  await prisma.$transaction([
    prisma.trainerAssignment.create({
      data: { caseId, trainerId, status: "SENT" },
    }),
    prisma.case.update({
      where: { id: caseId },
      data: { status: "SENT_TO_TRAINER" },
    }),
  ]);

  revalidatePath(`/admin/cases/${caseId}`);
  revalidatePath("/admin/cases");
  revalidatePath("/admin");
  redirect(`/admin/cases/${caseId}`);
}

// ---------------------------------------------------------------------------
// Advice review
// ---------------------------------------------------------------------------

export async function reviewAdviceSendToFarmer(adviceId: string) {
  await requireAdminSession();
  const advice = await prisma.advice.findUnique({ where: { id: adviceId } });
  if (!advice) throw new Error("Advice not found.");

  await prisma.$transaction([
    prisma.advice.update({
      where: { id: adviceId },
      data: { adminReviewStatus: "SENT_TO_FARMER" },
    }),
    prisma.case.update({
      where: { id: advice.caseId },
      data: { status: "FARMER_SUPPORTED" },
    }),
  ]);

  revalidatePath(`/admin/cases/${advice.caseId}`);
  revalidatePath("/admin/cases");
  revalidatePath("/admin");
}

export async function reviewAdviceRequestRevision(formData: FormData) {
  await requireAdminSession();
  const adviceId = String(formData.get("adviceId"));
  const advice = await prisma.advice.findUnique({ where: { id: adviceId } });
  if (!advice) throw new Error("Advice not found.");

  await prisma.$transaction([
    prisma.advice.update({
      where: { id: adviceId },
      data: { adminReviewStatus: "NEEDS_REVISION" },
    }),
    // Send the Case back to In Progress so the Trainer can resubmit Advice.
    prisma.case.update({
      where: { id: advice.caseId },
      data: { status: "IN_PROGRESS" },
    }),
  ]);

  revalidatePath(`/admin/cases/${advice.caseId}`);
}

export async function escalateCase(formData: FormData) {
  await requireAdminSession();
  const caseId = String(formData.get("caseId"));
  const trainerId = String(formData.get("trainerId"));
  if (!trainerId) throw new Error("Select a Trainer to escalate to.");

  await prisma.$transaction([
    prisma.trainerAssignment.create({
      data: { caseId, trainerId, status: "SENT" },
    }),
    prisma.case.update({
      where: { id: caseId },
      data: { status: "ESCALATED" },
    }),
  ]);

  revalidatePath(`/admin/cases/${caseId}`);
  revalidatePath("/admin/cases");
}

// ---------------------------------------------------------------------------
// Trainer verification / admin management
// ---------------------------------------------------------------------------

export async function updateTrainerVerification(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAdminSession();
  const trainerId = String(formData.get("trainerId"));

  const verificationStatus = String(formData.get("verificationStatus"));
  const applicationStatus = String(formData.get("applicationStatus"));

  await prisma.trainer.update({
    where: { id: trainerId },
    data: {
      applicationStatus: applicationStatus as never,
      verificationStatus: verificationStatus as never,
      verificationDate: verificationStatus === "VERIFIED" ? new Date() : null,
      verifiedBy: verificationStatus === "VERIFIED" ? session.user.email : null,
      adminNotes: (formData.get("adminNotes") as string) || null,
    },
  });

  revalidatePath(`/admin/trainers/${trainerId}`);
  revalidatePath("/admin/trainers");
  return { success: true };
}

export async function updateTrainerPilotIncentive(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdminSession();
  const trainerId = String(formData.get("trainerId"));

  const eligible = formData.get("eligible") === "on";
  const status = String(formData.get("status"));
  const amount = formData.get("amount") ? Number(formData.get("amount")) : null;

  await prisma.pilotIncentive.upsert({
    where: { trainerId },
    update: {
      eligible,
      status: status as never,
      amount,
      paymentDate: status === "PAID" ? new Date() : null,
    },
    create: {
      trainerId,
      eligible,
      status: status as never,
      amount,
      paymentDate: status === "PAID" ? new Date() : null,
    },
  });

  revalidatePath(`/admin/trainers/${trainerId}`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// Farm Visits
// ---------------------------------------------------------------------------

/** Creates the FarmVisit row for a Case if one doesn't already exist. Safe to
 * call multiple times (e.g. once from Case creation, again from Advice). */
export async function ensureFarmVisit(caseId: string, requiredExpertise?: string) {
  const existing = await prisma.farmVisit.findUnique({ where: { caseId } });
  if (existing) return existing;

  return prisma.farmVisit.create({
    data: { caseId, requiredExpertise: requiredExpertise ?? null, visitStatus: "REQUIRED" },
  });
}

export async function createFarmVisitForCase(caseId: string) {
  await requireAdminSession();
  const c = await prisma.case.findUnique({ where: { id: caseId } });
  if (!c) throw new Error("Case not found.");

  const visit = await ensureFarmVisit(caseId, c.requiredExpertise);
  await prisma.case.update({ where: { id: caseId }, data: { status: "VISIT_REQUIRED" } });

  revalidatePath(`/admin/cases/${caseId}`);
  redirect(`/admin/farm-visits/${visit.id}`);
}

export async function startSearchingForVisit(farmVisitId: string) {
  await requireAdminSession();
  await prisma.farmVisit.update({ where: { id: farmVisitId }, data: { visitStatus: "SEARCHING" } });
  revalidatePath(`/admin/farm-visits/${farmVisitId}`);
}

export async function assignFarmVisitTrainer(farmVisitId: string, trainerId: string) {
  await requireAdminSession();
  await prisma.farmVisit.update({
    where: { id: farmVisitId },
    data: { assignedTrainerId: trainerId, visitStatus: "ASSIGNED" },
  });
  revalidatePath(`/admin/farm-visits/${farmVisitId}`);
  revalidatePath("/admin/farm-visits");
}

export async function scheduleFarmVisit(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const farmVisitId = String(formData.get("farmVisitId"));
  const proposedDate = formData.get("proposedDate") as string;

  await prisma.farmVisit.update({
    where: { id: farmVisitId },
    data: {
      visitStatus: "SCHEDULED",
      proposedDate: proposedDate ? new Date(proposedDate) : null,
      notes: (formData.get("notes") as string) || null,
    },
  });

  revalidatePath(`/admin/farm-visits/${farmVisitId}`);
  revalidatePath("/admin/farm-visits");
  return { success: true };
}

export async function completeFarmVisit(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession();
  const farmVisitId = String(formData.get("farmVisitId"));

  const visit = await prisma.farmVisit.update({
    where: { id: farmVisitId },
    data: {
      visitStatus: "COMPLETED",
      completedDate: new Date(),
      notes: (formData.get("notes") as string) || null,
    },
  });

  revalidatePath(`/admin/farm-visits/${farmVisitId}`);
  revalidatePath("/admin/farm-visits");
  revalidatePath(`/admin/cases/${visit.caseId}`);
  return { success: true };
}

export async function cancelFarmVisit(farmVisitId: string) {
  await requireAdminSession();
  const visit = await prisma.farmVisit.update({
    where: { id: farmVisitId },
    data: { visitStatus: "CANCELLED" },
  });
  revalidatePath(`/admin/farm-visits/${farmVisitId}`);
  revalidatePath("/admin/farm-visits");
  revalidatePath(`/admin/cases/${visit.caseId}`);
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCurrentTrainer } from "@/lib/current-trainer";
import { toJsonArray } from "@/lib/constants";

export type ActionState = { error?: string; success?: boolean } | undefined;

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export async function updateTrainerProfile(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const trainer = await requireCurrentTrainer();

  const expertise = formData.getAll("expertise").map(String);
  const supportMethods = formData.getAll("supportMethods").map(String);

  if (expertise.length === 0) {
    return { error: "Select at least one area of expertise." };
  }
  if (supportMethods.length === 0) {
    return { error: "Select at least one support method." };
  }

  await prisma.trainer.update({
    where: { id: trainer.id },
    data: {
      fullName: String(formData.get("fullName") ?? trainer.fullName),
      phone: String(formData.get("phone") ?? trainer.phone),
      whatsapp: String(formData.get("whatsapp") ?? trainer.whatsapp),
      email: String(formData.get("email") ?? trainer.email),
      district: String(formData.get("district") ?? trainer.district),
      sector: String(formData.get("sector") ?? trainer.sector),
      preferredLanguage: String(formData.get("preferredLanguage") ?? trainer.preferredLanguage),
      trainerType: String(formData.get("trainerType")) as never,
      organization: (formData.get("organization") as string) || null,
      fieldOfStudy: (formData.get("fieldOfStudy") as string) || null,
      occupation: (formData.get("occupation") as string) || null,
      yearsExperience: formData.get("yearsExperience")
        ? Number(formData.get("yearsExperience"))
        : null,
      experienceDescription: (formData.get("experienceDescription") as string) || null,
      expertise: toJsonArray(expertise),
      supportMethods: toJsonArray(supportMethods),
    },
  });

  revalidatePath("/trainer/profile");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Availability
// ---------------------------------------------------------------------------

export async function updateAvailability(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const trainer = await requireCurrentTrainer();

  const availability = String(formData.get("availability"));
  const maxActiveCases = Number(formData.get("maxActiveCases"));

  if (!["AVAILABLE", "TEMPORARILY_UNAVAILABLE"].includes(availability)) {
    return { error: "Invalid availability value." };
  }
  if (!Number.isFinite(maxActiveCases) || maxActiveCases < 0 || maxActiveCases > 20) {
    return { error: "Maximum active Cases must be between 0 and 20." };
  }

  await prisma.trainer.update({
    where: { id: trainer.id },
    data: {
      availability: availability as never,
      maxActiveCases,
    },
  });

  revalidatePath("/trainer/availability");
  revalidatePath("/trainer");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Request Accept / Decline
// ---------------------------------------------------------------------------

export async function acceptRequest(assignmentId: string) {
  const trainer = await requireCurrentTrainer();

  const assignment = await prisma.trainerAssignment.findUnique({
    where: { id: assignmentId },
  });

  // Never trust the id alone — confirm it actually belongs to this Trainer
  // and is still awaiting a response before mutating anything.
  if (!assignment || assignment.trainerId !== trainer.id || assignment.status !== "SENT") {
    throw new Error("This Request is no longer available.");
  }

  await prisma.$transaction([
    prisma.trainerAssignment.update({
      where: { id: assignment.id },
      data: { status: "ACCEPTED", respondedAt: new Date() },
    }),
    prisma.case.update({
      where: { id: assignment.caseId },
      data: { status: "IN_PROGRESS" },
    }),
  ]);

  revalidatePath("/trainer");
  revalidatePath("/trainer/requests");
  revalidatePath("/trainer/cases");
  redirect(`/trainer/cases/${assignment.caseId}/advice`);
}

export async function declineRequest(formData: FormData) {
  const trainer = await requireCurrentTrainer();

  const assignmentId = String(formData.get("assignmentId"));
  const declineReason = (formData.get("declineReason") as string) || null;
  const declineNote = (formData.get("declineNote") as string) || null;

  const assignment = await prisma.trainerAssignment.findUnique({
    where: { id: assignmentId },
  });

  if (!assignment || assignment.trainerId !== trainer.id || assignment.status !== "SENT") {
    throw new Error("This Request is no longer available.");
  }

  await prisma.$transaction([
    prisma.trainerAssignment.update({
      where: { id: assignment.id },
      data: {
        status: "DECLINED",
        declineReason: declineReason as never,
        declineNote,
        respondedAt: new Date(),
      },
    }),
    // Send the Case back to Matching so an Admin can pick another Trainer.
    prisma.case.update({
      where: { id: assignment.caseId },
      data: { status: "MATCHING" },
    }),
  ]);

  revalidatePath("/trainer");
  revalidatePath("/trainer/requests");
  redirect("/trainer/requests");
}

// ---------------------------------------------------------------------------
// Advice submission
// ---------------------------------------------------------------------------

export async function submitAdvice(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const trainer = await requireCurrentTrainer();
  const caseId = String(formData.get("caseId"));

  // A Trainer may only submit Advice on a Case they hold an accepted
  // assignment for — re-checked here regardless of what the form posted.
  const assignment = await prisma.trainerAssignment.findFirst({
    where: { caseId, trainerId: trainer.id, status: "ACCEPTED" },
  });
  if (!assignment) {
    return { error: "You are not assigned to this Case." };
  }

  const assessment = String(formData.get("assessment") ?? "").trim();
  const recommendedAction = String(formData.get("recommendedAction") ?? "").trim();
  const farmVisitNeeded = String(formData.get("farmVisitNeeded") ?? "NO");

  if (!assessment || !recommendedAction) {
    return { error: "Assessment and Recommended Action are required." };
  }

  await prisma.$transaction([
    prisma.advice.create({
      data: {
        caseId,
        trainerId: trainer.id,
        assessment,
        recommendedAction,
        additionalQuestions: (formData.get("additionalQuestions") as string) || null,
        farmVisitNeeded: farmVisitNeeded as never,
        farmVisitExpertise: (formData.get("farmVisitExpertise") as string) || null,
        farmVisitTrainerType: (formData.get("farmVisitTrainerType") as string) || null,
        farmVisitInstructions: (formData.get("farmVisitInstructions") as string) || null,
        additionalNotes: (formData.get("additionalNotes") as string) || null,
      },
    }),
    prisma.case.update({
      where: { id: caseId },
      data: { status: "ADVICE_SUBMITTED" },
    }),
  ]);

  revalidatePath("/trainer/cases");
  revalidatePath(`/trainer/cases/${caseId}/advice`);
  redirect("/trainer/cases");
}

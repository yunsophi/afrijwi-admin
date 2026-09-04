// Seeds a minimal but realistic Pilot dataset: one Admin login, three
// Trainers (with an active Case each), two Farmers, and one Case already
// through Advice → Admin review so every dashboard has something to show.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const trainerPasswordHash = await bcrypt.hash("trainer123", 10);

  await prisma.user.upsert({
    where: { email: "admin@afrijwi.test" },
    update: {},
    create: {
      email: "admin@afrijwi.test",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const ericUser = await prisma.user.upsert({
    where: { email: "eric@afrijwi.test" },
    update: {},
    create: {
      email: "eric@afrijwi.test",
      passwordHash: trainerPasswordHash,
      role: "TRAINER",
    },
  });

  const marieUser = await prisma.user.upsert({
    where: { email: "marie@afrijwi.test" },
    update: {},
    create: {
      email: "marie@afrijwi.test",
      passwordHash: trainerPasswordHash,
      role: "TRAINER",
    },
  });

  const jeanUser = await prisma.user.upsert({
    where: { email: "jean.student@afrijwi.test" },
    update: {},
    create: {
      email: "jean.student@afrijwi.test",
      passwordHash: trainerPasswordHash,
      role: "TRAINER",
    },
  });

  const eric = await prisma.trainer.upsert({
    where: { userId: ericUser.id },
    update: {},
    create: {
      userId: ericUser.id,
      fullName: "Eric Mugisha",
      phone: "+250788000001",
      whatsapp: "+250788000001",
      email: "eric@afrijwi.test",
      district: "Huye",
      sector: "Ngoma",
      preferredLanguage: "English",
      trainerType: "VETERINARIAN",
      organization: "Rwanda Agriculture Board",
      fieldOfStudy: "Veterinary Medicine",
      occupation: "Veterinarian",
      yearsExperience: 6,
      experienceDescription:
        "Six years treating livestock across the Southern Province, with a focus on cattle health.",
      expertise: JSON.stringify(["LIVESTOCK", "ANIMAL_HEALTH", "DAIRY_FARMING"]),
      supportMethods: JSON.stringify(["WHATSAPP", "PHONE", "FARM_VISIT"]),
      availability: "AVAILABLE",
      maxActiveCases: 2,
      applicationStatus: "APPROVED",
      verificationStatus: "VERIFIED",
      verificationDate: new Date(),
      verifiedBy: "AFRIJWI Admin",
    },
  });

  const marie = await prisma.trainer.upsert({
    where: { userId: marieUser.id },
    update: {},
    create: {
      userId: marieUser.id,
      fullName: "Marie Uwase",
      phone: "+250788000002",
      whatsapp: "+250788000002",
      email: "marie@afrijwi.test",
      district: "Nyanza",
      sector: "Busasamana",
      preferredLanguage: "English",
      trainerType: "AGRICULTURE_PROFESSIONAL",
      organization: "University of Rwanda",
      fieldOfStudy: "Animal Science",
      occupation: "Agribusiness Consultant",
      yearsExperience: 4,
      experienceDescription: "Advises smallholder dairy farmers on nutrition and productivity.",
      expertise: JSON.stringify(["DAIRY_FARMING", "LIVESTOCK", "AGRIBUSINESS"]),
      supportMethods: JSON.stringify(["WHATSAPP", "ONLINE_MEETING", "FARM_VISIT"]),
      availability: "AVAILABLE",
      maxActiveCases: 2,
      applicationStatus: "APPROVED",
      verificationStatus: "VERIFIED",
      verificationDate: new Date(),
      verifiedBy: "AFRIJWI Admin",
    },
  });

  await prisma.trainer.upsert({
    where: { userId: jeanUser.id },
    update: {},
    create: {
      userId: jeanUser.id,
      fullName: "Jean Baptiste Niyonzima",
      phone: "+250788000003",
      whatsapp: "+250788000003",
      email: "jean.student@afrijwi.test",
      district: "Huye",
      sector: "Tumba",
      preferredLanguage: "English",
      trainerType: "AGRICULTURE_STUDENT",
      organization: "University of Rwanda - CAVM",
      fieldOfStudy: "Crop Science",
      occupation: "Student",
      yearsExperience: 1,
      experienceDescription: "Final-year agriculture student, active in a campus crop demonstration plot.",
      expertise: JSON.stringify(["CROP_PRODUCTION", "CROP_DISEASES", "SOIL_FERTILIZER"]),
      supportMethods: JSON.stringify(["WHATSAPP", "ONLINE_MEETING"]),
      availability: "AVAILABLE",
      maxActiveCases: 1,
      applicationStatus: "SUBMITTED",
      verificationStatus: "NOT_VERIFIED",
    },
  });

  const jeanFarmer = await prisma.farmer.create({
    data: {
      name: "Jean Nsengimana",
      phone: "+250788111001",
      whatsapp: "+250788111001",
      district: "Huye",
      sector: "Ngoma",
      preferredLanguage: "Kinyarwanda",
      farmingType: "LIVESTOCK",
      mainLivestock: "Cattle (2 cows)",
      notes: "Contacted AFRIJWI via WhatsApp on Sept 2.",
    },
  });

  const aliceFarmer = await prisma.farmer.create({
    data: {
      name: "Alice Mukamana",
      phone: "+250788111002",
      whatsapp: "+250788111002",
      district: "Nyanza",
      sector: "Busasamana",
      preferredLanguage: "Kinyarwanda",
      farmingType: "CROPS",
      mainCrops: "Maize, beans",
      notes: null,
    },
  });

  // Case #1 — in progress with Eric (cattle not eating)
  const case1 = await prisma.case.create({
    data: {
      farmerId: jeanFarmer.id,
      category: "LIVESTOCK",
      title: "Cow has stopped eating",
      description:
        "One of two cows has not eaten for two days and seems lethargic. No visible injuries reported.",
      originalMessage: "Inka yanjye ntikirya kuva ku wa kabiri, iraruhutse cyane.",
      urgency: "HIGH",
      district: "Huye",
      sector: "Ngoma",
      requiredExpertise: JSON.stringify(["LIVESTOCK", "ANIMAL_HEALTH"]),
      farmVisitRequired: false,
      status: "IN_PROGRESS",
    },
  });

  await prisma.trainerAssignment.create({
    data: {
      caseId: case1.id,
      trainerId: eric.id,
      status: "ACCEPTED",
      respondedAt: new Date(),
    },
  });

  // Case #2 — advice submitted, waiting on Admin review
  const case2 = await prisma.case.create({
    data: {
      farmerId: aliceFarmer.id,
      category: "CROP",
      title: "Maize leaves turning yellow",
      description:
        "Maize leaves are yellowing from the bottom up across roughly a third of the field, planted five weeks ago.",
      urgency: "NORMAL",
      district: "Nyanza",
      sector: "Busasamana",
      requiredExpertise: JSON.stringify(["CROP_DISEASES", "SOIL_FERTILIZER"]),
      farmVisitRequired: false,
      status: "AFRIJWI_REVIEW",
    },
  });

  await prisma.trainerAssignment.create({
    data: {
      caseId: case2.id,
      trainerId: marie.id,
      status: "ACCEPTED",
      respondedAt: new Date(),
    },
  });

  await prisma.advice.create({
    data: {
      caseId: case2.id,
      trainerId: marie.id,
      assessment:
        "Likely nitrogen deficiency given the bottom-up yellowing pattern and field age.",
      recommendedAction:
        "Apply a top-dressing of nitrogen fertilizer (e.g. Urea) at the recommended rate and monitor for improvement over 7-10 days.",
      additionalQuestions: "Has any fertilizer been applied since planting?",
      farmVisitNeeded: "NO",
      adminReviewStatus: "PENDING",
    },
  });

  // Case #3 — brand new, not yet matched
  await prisma.case.create({
    data: {
      farmerId: jeanFarmer.id,
      category: "POULTRY",
      title: "Chickens losing feathers",
      description: "Several chickens have started losing feathers around the neck over the past week.",
      urgency: "LOW",
      district: "Huye",
      sector: "Ngoma",
      requiredExpertise: JSON.stringify(["POULTRY", "ANIMAL_HEALTH"]),
      farmVisitRequired: false,
      status: "NEW",
    },
  });

  // Case #4 — just sent to Eric, awaiting Accept/Decline
  const case4 = await prisma.case.create({
    data: {
      farmerId: aliceFarmer.id,
      category: "LIVESTOCK",
      title: "Goat has a swollen leg",
      description:
        "One goat has had a swollen front leg for three days and is limping. No sign of an open wound.",
      urgency: "NORMAL",
      district: "Nyanza",
      sector: "Busasamana",
      requiredExpertise: JSON.stringify(["LIVESTOCK", "ANIMAL_HEALTH"]),
      farmVisitRequired: true,
      status: "SENT_TO_TRAINER",
    },
  });

  await prisma.trainerAssignment.create({
    data: {
      caseId: case4.id,
      trainerId: eric.id,
      status: "SENT",
    },
  });

  await prisma.farmVisit.create({
    data: {
      caseId: case4.id,
      requiredExpertise: case4.requiredExpertise,
      visitStatus: "REQUIRED",
    },
  });

  console.log("Seed complete.");
  console.log("Admin login:   admin@afrijwi.test / admin123");
  console.log("Trainer login: eric@afrijwi.test / trainer123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Shared enum label maps + option lists. Keeping labels here (rather than
// scattering title-cased strings across pages) means one place to touch when
// Kinyarwanda / multi-language labels are added later.

export const TRAINER_TYPE_LABELS: Record<string, string> = {
  AGRICULTURE_STUDENT: "Agriculture Student",
  VETERINARY_ANIMAL_SCIENCE_STUDENT: "Veterinary / Animal Science Student",
  AGRICULTURE_PROFESSIONAL: "Agriculture Professional",
  VETERINARIAN: "Veterinarian",
  AGRICULTURAL_EXTENSION_WORKER: "Agricultural Extension Worker",
  EXPERIENCED_FARMER: "Experienced Farmer",
  AGRIBUSINESS_PROFESSIONAL: "Agribusiness Professional",
  RESEARCHER: "Researcher",
  LECTURER_TEACHER: "Lecturer / Teacher",
  OTHER: "Other",
};

export const EXPERTISE_LABELS: Record<string, string> = {
  CROP_PRODUCTION: "Crop Production",
  CROP_DISEASES: "Crop Diseases",
  PEST_MANAGEMENT: "Pest Management",
  SOIL_FERTILIZER: "Soil & Fertilizer",
  IRRIGATION: "Irrigation",
  LIVESTOCK: "Livestock",
  ANIMAL_HEALTH: "Animal Health",
  POULTRY: "Poultry",
  DAIRY_FARMING: "Dairy Farming",
  PIG_FARMING: "Pig Farming",
  GOAT_FARMING: "Goat Farming",
  AGRIBUSINESS: "Agribusiness",
  AGRICULTURAL_TECHNOLOGY: "Agricultural Technology",
  POST_HARVEST_PROCESSING: "Post-harvest / Food Processing",
  OTHER: "Other",
};

export const SUPPORT_METHOD_LABELS: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  PHONE: "Phone",
  ONLINE_MEETING: "Online Meeting",
  FARM_VISIT: "Farm Visit",
  TRAINING_WORKSHOP: "Training / Workshop",
};

export const CASE_CATEGORY_LABELS: Record<string, string> = {
  CROP: "Crop",
  LIVESTOCK: "Livestock",
  POULTRY: "Poultry",
  ANIMAL_HEALTH: "Animal Health",
  PLANT_HEALTH: "Plant Health",
  SOIL: "Soil",
  IRRIGATION: "Irrigation",
  PEST_DISEASE: "Pest / Disease",
  AGRIBUSINESS: "Agribusiness",
  OTHER: "Other",
};

export const CASE_STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  MATCHING: "Matching",
  SENT_TO_TRAINER: "Sent to Trainer",
  ACCEPTED: "Accepted",
  IN_PROGRESS: "In Progress",
  ADVICE_SUBMITTED: "Advice Submitted",
  AFRIJWI_REVIEW: "AFRIJWI Review",
  FARMER_SUPPORTED: "Farmer Supported",
  COMPLETED: "Completed",
  DECLINED: "Declined",
  NO_RESPONSE: "No Response",
  ESCALATED: "Escalated",
  VISIT_REQUIRED: "Visit Required",
  CANCELLED: "Cancelled",
};

// Status → badge color token. Kept as a small closed palette (not per-status
// literals scattered in JSX) so the badge system reads as one object.
export const CASE_STATUS_TONE: Record<string, "neutral" | "info" | "warning" | "success" | "danger"> = {
  NEW: "neutral",
  MATCHING: "info",
  SENT_TO_TRAINER: "info",
  ACCEPTED: "info",
  IN_PROGRESS: "warning",
  ADVICE_SUBMITTED: "warning",
  AFRIJWI_REVIEW: "warning",
  FARMER_SUPPORTED: "success",
  COMPLETED: "success",
  DECLINED: "danger",
  NO_RESPONSE: "danger",
  ESCALATED: "danger",
  VISIT_REQUIRED: "warning",
  CANCELLED: "neutral",
};

export const VISIT_STATUS_LABELS: Record<string, string> = {
  REQUIRED: "Required",
  SEARCHING: "Searching",
  ASSIGNED: "Assigned",
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const VISIT_STATUS_TONE_CLASSES: Record<string, string> = {
  REQUIRED: "bg-tone-neutral-bg text-tone-neutral-text",
  SEARCHING: "bg-tone-info-bg text-tone-info-text",
  ASSIGNED: "bg-tone-info-bg text-tone-info-text",
  SCHEDULED: "bg-tone-warning-bg text-tone-warning-text",
  COMPLETED: "bg-tone-success-bg text-tone-success-text",
  CANCELLED: "bg-tone-neutral-bg text-tone-neutral-text",
};

export const DECLINE_REASON_LABELS: Record<string, string> = {
  TOO_BUSY: "Too busy",
  OUTSIDE_EXPERTISE: "Outside my expertise",
  TOO_FAR: "Too far",
  CANNOT_VISIT: "Cannot conduct farm visit",
  OTHER: "Other",
};

export const RWANDA_DISTRICTS = [
  "Gasabo",
  "Kicukiro",
  "Nyarugenge",
  "Bugesera",
  "Gatsibo",
  "Kayonza",
  "Kirehe",
  "Ngoma",
  "Nyagatare",
  "Rwamagana",
  "Burera",
  "Gakenke",
  "Gicumbi",
  "Musanze",
  "Rulindo",
  "Gisagara",
  "Huye",
  "Kamonyi",
  "Muhanga",
  "Nyamagabe",
  "Nyanza",
  "Nyaruguru",
  "Ruhango",
  "Karongi",
  "Ngororero",
  "Nyabihu",
  "Nyamasheke",
  "Rubavu",
  "Rusizi",
  "Rutsiro",
];

export function enumLabel(map: Record<string, string>, value: string): string {
  return map[value] ?? value;
}

/** Parse a JSON-encoded string array column (SQLite has no native array type). */
export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function toJsonArray(values: string[]): string {
  return JSON.stringify(values);
}

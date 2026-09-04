import { RWANDA_DISTRICTS } from "@/lib/constants";
import type { Farmer } from "@prisma/client";

const FARMING_TYPES = [
  { value: "CROPS", label: "Crops" },
  { value: "LIVESTOCK", label: "Livestock" },
  { value: "BOTH", label: "Both" },
];

/** Shared field set for the Farmer create and edit forms. */
export function FarmerFormFields({ farmer }: { farmer?: Farmer }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <TextField label="Name" name="name" defaultValue={farmer?.name} required />
      <TextField label="Phone Number" name="phone" defaultValue={farmer?.phone} required />
      <TextField label="WhatsApp Number" name="whatsapp" defaultValue={farmer?.whatsapp} />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">District</label>
        <select
          name="district"
          defaultValue={farmer?.district ?? ""}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="" disabled>
            Select…
          </option>
          {RWANDA_DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <TextField label="Sector" name="sector" defaultValue={farmer?.sector} />
      <TextField
        label="Preferred Language"
        name="preferredLanguage"
        defaultValue={farmer?.preferredLanguage ?? "Kinyarwanda"}
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Farming Type</label>
        <select
          name="farmingType"
          defaultValue={farmer?.farmingType ?? "BOTH"}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          {FARMING_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <TextField label="Main Crops" name="mainCrops" defaultValue={farmer?.mainCrops ?? ""} />
      <TextField label="Main Livestock" name="mainLivestock" defaultValue={farmer?.mainLivestock ?? ""} />
      <div className="sm:col-span-2 flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Notes</label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={farmer?.notes ?? ""}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}

function TextField({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
      />
    </div>
  );
}

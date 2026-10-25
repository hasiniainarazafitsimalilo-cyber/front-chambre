export type AvailabilitySearchForm = {
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children?: number;
  room_type_id?: string;
};

export function formatDateForInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDefaultDates() {
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 7);

  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 3);

  return {
    check_in_date: formatDateForInput(checkIn),
    check_out_date: formatDateForInput(checkOut),
  };
}

export function getNightCount(checkIn: Date, checkOut: Date) {
  const diffMs = checkOut.getTime() - checkIn.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return Number.isFinite(diffDays) ? Math.max(0, Math.floor(diffDays)) : 0;
}

export function toAvailabilityQuery(input: AvailabilitySearchForm) {
  return {
    check_in_date: input.check_in_date,
    check_out_date: input.check_out_date,
    adults: input.adults,
    children: input.children ?? 0,
    room_type_id: input.room_type_id,
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

export type PaymentMethod = "CASH" | "CARD" | "BANK_TRANSFER" | "MOBILE_MONEY";

export type PaymentCreatePayload = {
  reservation_id: string;
  amount: number;
  payment_method: PaymentMethod;
  transaction_reference?: string | null;
};

export type PaymentResult = {
  id: string;
  status: string;
  amount: number;
};

interface ApiErrorShape {
  response?: { status?: number; data?: { error?: string; message?: string } };
}

const asApiError = (error: unknown): ApiErrorShape =>
  typeof error === 'object' && error !== null ? (error as ApiErrorShape) : {};

/** Código de erro do backend (ex: "TAG_ALREADY_EXISTS"). */
export const apiErrorCode = (error: unknown) => asApiError(error).response?.data?.error;

export const apiErrorStatus = (error: unknown) => asApiError(error).response?.status;

/** Mensagem legível do backend ou o fallback informado. */
export const apiErrorMessage = (error: unknown, fallback: string) =>
  asApiError(error).response?.data?.message || fallback;

import { BookingFormData, ResortMapData } from '../types';

interface BookCabanaResponse {
  message: string;
  booking: {
    cabanaId: string;
    roomNumber: string;
    guestName: string;
    bookedAt: string;
  };
}

function toErrorMessage(errorBody: unknown): string {
  if (typeof errorBody !== 'object' || errorBody === null) {
    return 'Request failed.';
  }

  const message = (errorBody as Record<string, unknown>).message;

  if (typeof message !== 'string' || !message.trim()) {
    return 'Request failed.';
  }

  return message;
}

async function parseResponseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function fetchMapData(): Promise<ResortMapData> {
  const response = await fetch('/api/map', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  const payload = await parseResponseJson(response);

  if (!response.ok) {
    throw new Error(toErrorMessage(payload));
  }

  return payload as ResortMapData;
}

export async function bookCabana(cabanaId: string, formData: BookingFormData): Promise<BookCabanaResponse> {
  const response = await fetch(`/api/cabanas/${encodeURIComponent(cabanaId)}/book`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(formData),
  });

  const payload = await parseResponseJson(response);

  if (!response.ok) {
    throw new Error(toErrorMessage(payload));
  }

  return payload as BookCabanaResponse;
}

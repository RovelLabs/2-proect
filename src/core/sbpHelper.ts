import QRCode from 'qrcode';
import { CIS_BANKS, BankInfo } from '../types';

export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    const p = digits.slice(1);
    return `+7 (${p.slice(0, 3)}) ${p.slice(3, 6)}-${p.slice(6, 8)}-${p.slice(8, 10)}`;
  }
  return phone;
}

export function cleanPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function getBankById(bankId?: string): BankInfo | undefined {
  if (!bankId) return undefined;
  return CIS_BANKS.find(b => b.id === bankId);
}

/**
 * Builds a fast SBP transfer deep link or payment payload
 */
export function buildSbpPaymentPayload(
  phone: string,
  amount: number,
  bankId?: string,
  purpose = 'Складно'
): string {
  const cleanPhone = cleanPhoneDigits(phone);
  // Standard Russian SBP / Bank QR format
  // ST00012|Name=Складно|PersonalAcc=... or generic sbp payload
  return `sbp://payment?phone=${cleanPhone}&amount=${amount}&bank=${bankId || 'any'}&purpose=${encodeURIComponent(purpose)}`;
}

/**
 * Generates an SVG DataURL for QR Code scanning
 */
export async function generateQrCodeDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 280,
      color: {
        dark: '#0B0F17',
        light: '#FFFFFF',
      },
    });
  } catch (err) {
    console.error('QR generation error:', err);
    return '';
  }
}

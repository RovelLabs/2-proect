import { describe, it, expect } from 'vitest';
import { formatPhoneNumber, cleanPhoneDigits, getBankById, buildSbpPaymentPayload } from '../src/core/sbpHelper';

describe('sbpHelper', () => {
  it('formats standard 11-digit Russian phone numbers correctly', () => {
    expect(formatPhoneNumber('79991234567')).toBe('+7 (999) 123-45-67');
    expect(formatPhoneNumber('89991234567')).toBe('+7 (999) 123-45-67');
    expect(formatPhoneNumber('+7 (999) 123-45-67')).toBe('+7 (999) 123-45-67');
  });

  it('cleans non-digits properly', () => {
    expect(cleanPhoneDigits('+7 (999) 123-45-67')).toBe('79991234567');
  });

  it('finds CIS banks by ID', () => {
    const tinkoff = getBankById('tinkoff');
    expect(tinkoff).toBeDefined();
    expect(tinkoff?.shortName).toBe('Т-Банк');

    const sber = getBankById('sber');
    expect(sber).toBeDefined();
    expect(sber?.shortName).toBe('Сбер');

    const unknown = getBankById('nonexistent');
    expect(unknown).toBeUndefined();
  });

  it('builds SBP payment payload URI', () => {
    const payload = buildSbpPaymentPayload('79991234567', 450, 'tinkoff', 'Пицца');
    expect(payload).toContain('phone=79991234567');
    expect(payload).toContain('amount=450');
    expect(payload).toContain('bank=tinkoff');
  });
});

const OTP_NEAR_KEYWORD_REGEX = /(?:otp|one[-\s]?time|verification(?:\s+code)?|security\s?code|passcode|验证码|校验码|动态码|动态口令|验证(?:码)?)\D{0,20}([A-Z0-9]{4,8})/gi;
const OTP_LEADING_CODE_REGEX = /\b([A-Z0-9]{4,8})\b\D{0,20}(?:otp|verification(?:\s+code)?|security\s?code|passcode|验证码|校验码|动态码|动态口令|验证(?:码)?)/gi;
const OTP_KEYWORD_REGEX = /(otp|one[-\s]?time|verification|verify|security\s?code|passcode|验证码|校验码|动态码|动态口令|验证)/i;
const OTP_DIGIT_FALLBACK_REGEX = /\b\d{4,8}\b/g;

export function stripHtmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

export function pickOtpCandidates(sourceText: string): string[] {
  if (!sourceText) {
    return [];
  }

  const candidates: string[] = [];
  const upperText = sourceText.toUpperCase();

  for (const match of upperText.matchAll(OTP_NEAR_KEYWORD_REGEX)) {
    if (match[1]) {
      candidates.push(match[1]);
    }
  }

  for (const match of upperText.matchAll(OTP_LEADING_CODE_REGEX)) {
    if (match[1]) {
      candidates.push(match[1]);
    }
  }

  for (const line of upperText.split(/[\n\r]+/)) {
    if (!OTP_KEYWORD_REGEX.test(line)) {
      continue;
    }

    const digits = line.match(OTP_DIGIT_FALLBACK_REGEX);
    if (digits) {
      candidates.push(...digits);
    }
  }

  return Array.from(new Set(candidates)).slice(0, 3);
}

export function extractOtpCodes(subject = '', textContent = '', htmlContent = ''): string[] {
  return pickOtpCandidates([
    subject,
    textContent,
    stripHtmlToText(htmlContent),
  ].join('\n'));
}

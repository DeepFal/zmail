export interface MailboxAddressParts {
  fullAddress: string;
  localPart: string;
  domain: string;
}

export function getMailboxAddressParts(address: string, fallbackDomain = ''): MailboxAddressParts {
  const trimmedAddress = address.trim();
  const trimmedFallbackDomain = fallbackDomain.trim();
  const atIndex = trimmedAddress.lastIndexOf('@');

  if (atIndex <= 0 || atIndex === trimmedAddress.length - 1) {
    const localPart = trimmedAddress.replace(/@+$/, '');
    const domain = trimmedFallbackDomain;

    return {
      fullAddress: domain ? `${localPart}@${domain}` : localPart,
      localPart,
      domain,
    };
  }

  return {
    fullAddress: trimmedAddress,
    localPart: trimmedAddress.slice(0, atIndex),
    domain: trimmedAddress.slice(atIndex + 1),
  };
}

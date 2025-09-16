// NAS Configuration utilities for AAA projects

// Site/Template configurations
export const SITE_TEMPLATES = {
  'general_auth': {
    id: 'general_auth',
    name: 'General Authentication',
    siteId: '001', // 3-digit unique site ID
    description: 'General purpose authentication template'
  }
  // Future templates can be added here
  // 'enterprise_wifi': { id: 'enterprise_wifi', siteId: '002', ... },
  // 'guest_portal': { id: 'guest_portal', siteId: '003', ... },
} as const;

// AAA Server configuration
export const AAA_CONFIG = {
  primaryServer: '54.205.5.145', // Primary AAA server IP
  authPort: 1812,
  acctPort: 1813,
  protocol: 'RADIUS'
} as const;

/**
 * Generate a random number with specified digits
 * @param digits - Number of digits (1-10)
 * @returns Random number string with leading zeros if needed
 */
export function generateRandomDigits(digits: number): string {
  if (digits < 1 || digits > 10) {
    throw new Error('Digits must be between 1 and 10');
  }
  
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
  
  return randomNum.toString().padStart(digits, '0');
}

/**
 * Format organization ID to 4 digits with leading zeros
 * @param orgId - Organization ID (number or string)
 * @returns 4-digit organization ID string
 */
export function formatOrganizationId(orgId: number | string): string {
  const id = typeof orgId === 'string' ? parseInt(orgId, 10) : orgId;
  if (isNaN(id) || id < 0) {
    throw new Error('Invalid organization ID');
  }
  
  return id.toString().padStart(4, '0');
}

/**
 * Generate NAS-Identifier for a project
 * Format: 3 random digits + 3-digit site ID + 4-digit org ID + 3 random digits
 * Example: 123-001-0042-789
 * 
 * @param organizationId - Organization ID
 * @param siteTemplate - Site template key (defaults to 'general_auth')
 * @returns Generated NAS-Identifier string
 */
export function generateNasIdentifier(
  organizationId: number | string,
  siteTemplate: keyof typeof SITE_TEMPLATES = 'general_auth'
): string {
  const randomPrefix = generateRandomDigits(3);
  const siteId = SITE_TEMPLATES[siteTemplate].siteId;
  const orgId = formatOrganizationId(organizationId);
  const randomSuffix = generateRandomDigits(3);
  
  return `${randomPrefix}-${siteId}-${orgId}-${randomSuffix}`;
}

/**
 * Get NAS configuration data for a project
 * @param project - Project object
 * @param organizationId - Organization ID
 * @param siteTemplate - Site template (defaults to 'general_auth')
 * @returns NAS configuration object
 */
export function getNasConfiguration(
  project: { id: number; sharedSecret: string },
  organizationId: number | string,
  siteTemplate: keyof typeof SITE_TEMPLATES = 'general_auth'
) {
  return {
    aaaServer: AAA_CONFIG.primaryServer,
    aaaSecret: project.sharedSecret,
    authPort: AAA_CONFIG.authPort,
    acctPort: AAA_CONFIG.acctPort,
    nasIdentifier: generateNasIdentifier(organizationId, siteTemplate),
    siteInfo: SITE_TEMPLATES[siteTemplate]
  };
}

/**
 * Parse NAS-Identifier to extract components
 * @param nasIdentifier - NAS-Identifier string (format: XXX-YYY-ZZZZ-WWW)
 * @returns Parsed components or null if invalid format
 */
export function parseNasIdentifier(nasIdentifier: string) {
  const parts = nasIdentifier.split('-');
  if (parts.length !== 4) {
    return null;
  }
  
  const [randomPrefix, siteId, orgId, randomSuffix] = parts;
  
  // Find matching site template
  const siteTemplate = Object.entries(SITE_TEMPLATES).find(
    ([, template]) => template.siteId === siteId
  );
  
  return {
    randomPrefix,
    siteId,
    organizationId: parseInt(orgId, 10),
    randomSuffix,
    siteTemplate: siteTemplate ? siteTemplate[0] : null,
    isValid: randomPrefix.length === 3 && 
             siteId.length === 3 && 
             orgId.length === 4 && 
             randomSuffix.length === 3
  };
}

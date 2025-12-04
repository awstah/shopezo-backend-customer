import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * Validates phone numbers for Pakistan (PK) and UAE (AE)
 * 
 * Pakistan formats:
 * - +92XXXXXXXXXX (with country code)
 * - 0XXXXXXXXXX (without country code, starts with 0)
 * - 03XX-XXXXXXX (with dash)
 * 
 * UAE formats:
 * - +971XXXXXXXXX (with country code)
 * - 0XXXXXXXXX (without country code, starts with 0)
 * - 05X-XXXXXXX (with dash)
 */
export function IsPhoneNumberPKOrUAE(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isPhoneNumberPKOrUAE',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (typeof value !== 'string') {
                        return false;
                    }

                    // Remove spaces, dashes, and parentheses for validation
                    const cleaned = value.replace(/[\s\-\(\)]/g, '');

                    // Pakistan phone number patterns
                    // +92XXXXXXXXXX or 0XXXXXXXXXX (10 digits after 0 or 92)
                    const pkPattern1 = /^(\+92|92|0)?[0-9]{10}$/;
                    // UAE phone number patterns
                    // +971XXXXXXXXX or 0XXXXXXXXX (9 digits after 0 or 971)
                    const uaePattern1 = /^(\+971|971|0)?[0-9]{9}$/;

                    // Check Pakistan format
                    if (pkPattern1.test(cleaned)) {
                        // Additional validation: Pakistan numbers should start with 03, 04, 05, etc. when without country code
                        if (cleaned.startsWith('0')) {
                            return /^0[3-9]\d{9}$/.test(cleaned);
                        }
                        // With country code
                        if (cleaned.startsWith('92') || cleaned.startsWith('+92')) {
                            const withoutCode = cleaned.replace(/^(\+92|92)/, '');
                            return /^[3-9]\d{9}$/.test(withoutCode);
                        }
                        return true;
                    }

                    // Check UAE format
                    if (uaePattern1.test(cleaned)) {
                        // Additional validation: UAE numbers should start with 05, 04, 06, 07, 09, etc. when without country code
                        if (cleaned.startsWith('0')) {
                            return /^0[2-9]\d{8}$/.test(cleaned);
                        }
                        // With country code
                        if (cleaned.startsWith('971') || cleaned.startsWith('+971')) {
                            const withoutCode = cleaned.replace(/^(\+971|971)/, '');
                            return /^[2-9]\d{8}$/.test(withoutCode);
                        }
                        return true;
                    }

                    return false;
                },
                defaultMessage(args: ValidationArguments) {
                    return 'Phone number must be a valid Pakistan (PK) or UAE (AE) phone number';
                },
            },
        });
    };
}


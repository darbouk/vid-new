import React from 'react';
import type { BrandColor } from './types';

/**
 * Validates if a string is a valid hex color code.
 * @param hex - The color string to validate.
 * @returns True if it's a valid hex color, false otherwise.
 */
export const isValidHexColor = (hex: string): boolean => {
    const hexRegex = /^#([0-9A-F]{3}){1,2}$/i;
    return hexRegex.test(hex);
};

/**
 * Generates CSS variables from brand colors.
 * @param colors - An array of BrandColor objects.
 * @returns A style object with CSS custom properties.
 */
export const generateColorCssVariables = (colors: BrandColor[]): React.CSSProperties => {
    const variables: Record<string, string> = {};
    colors.forEach(color => {
        variables[`--brand-${color.name.toLowerCase().replace(' ', '-')}`] = color.hex;
    });
    return variables as React.CSSProperties;
};

/**
 * Utility helpers for Agent Jury
 */

type ClassValue = string | undefined | null | false | ClassValue[];

/**
 * Combines class names, filtering out falsy values. Supports nested arrays.
 */
export function cn(...classes: ClassValue[]): string {
    return (classes as ClassValue[])
        .flat(20)
        .filter(Boolean)
        .join(' ') as string;
}

/**
 * Truncates a string to a maximum length, appending an ellipsis if needed.
 */
export function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + '...';
}

/**
 * Returns a delay promise for async flows.
 */
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

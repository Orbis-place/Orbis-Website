import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
    y?: number;
    x?: number;
    start?: number;
    duration?: number;
};

export const flyAndScale = (
    node: Element,
    params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
    const style = getComputedStyle(node);
    const transform = style.transform === "none" ? "" : style.transform;

    return {
        duration: params.duration ?? 200,
        delay: 0,
        css: (t) => {
            const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
            const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
            const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

            return `
				transform: ${transform} translate3d(${x}px, ${y}px, 0) scale(${scale});
				opacity: ${t}
			`;
        },
        easing: cubicOut,
    };
};

export const scaleConversion = (
    value: number,
    domain: [number, number],
    range: [number, number]
) => {
    const [minDomain, maxDomain] = domain;
    const [minRange, maxRange] = range;
    return (
        ((value - minDomain) / (maxDomain - minDomain)) * (maxRange - minRange) +
        minRange
    );
};

export type WithElementRef<T = HTMLElement> = {
    ref?: T;
} & Record<string, unknown>;

export type WithoutChild<T> = Omit<T, "child">;

export type WithoutChildrenOrChild<T> = Omit<T, "children" | "child">;

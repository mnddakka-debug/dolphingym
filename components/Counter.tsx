import React from 'react';
import { motion, useSpring, useTransform } from 'motion/react';
import { useEffect } from 'react';
import './Counter.css';

interface NumberProps {
    key?: React.Key;
    mv: ReturnType<typeof useSpring>;
    number: number;
    height: number;
}

function Number({ mv, number, height }: NumberProps) {
    const y = useTransform(mv, (latest: number) => {
        const placeValue = latest % 10;
        const offset = (10 + number - placeValue) % 10;
        let memo = offset * height;
        if (offset > 5) {
            memo -= 10 * height;
        }
        return memo;
    });
    return (
        <motion.span className="counter-number" style={{ y }}>
            {number}
        </motion.span>
    );
}

interface DigitProps {
    key?: React.Key;
    place: number | '.';
    value: number;
    height: number;
    digitStyle?: React.CSSProperties;
}

function Digit({ place, value, height, digitStyle }: DigitProps) {
    const isDecimal = place === '.';
    const valueRoundedToPlace = isDecimal ? 0 : Math.floor(value / (place as number));
    const animatedValue = useSpring(valueRoundedToPlace);

    useEffect(() => {
        if (!isDecimal) {
            animatedValue.set(valueRoundedToPlace);
        }
    }, [animatedValue, valueRoundedToPlace, isDecimal]);

    if (isDecimal) {
        return (
            <span className="counter-digit" style={{ height, ...digitStyle, width: 'fit-content' }}>
                .
            </span>
        );
    }

    return (
        <span className="counter-digit" style={{ height, ...digitStyle }}>
            {Array.from({ length: 10 }, (_, i) => (
                <Number key={i} mv={animatedValue} number={i} height={height} />
            ))}
        </span>
    );
}

interface CounterProps {
    value: number;
    fontSize?: number;
    padding?: number;
    places?: (number | '.')[];
    gap?: number;
    borderRadius?: number;
    horizontalPadding?: number;
    textColor?: string;
    fontWeight?: number | string;
    containerStyle?: React.CSSProperties;
    counterStyle?: React.CSSProperties;
    digitStyle?: React.CSSProperties;
    gradientHeight?: number;
    gradientFrom?: string;
    gradientTo?: string;
    topGradientStyle?: React.CSSProperties;
    bottomGradientStyle?: React.CSSProperties;
}

export default function Counter({
    value,
    fontSize = 100,
    padding = 0,
    places,
    gap = 8,
    borderRadius = 4,
    horizontalPadding = 8,
    textColor = 'inherit',
    fontWeight = 'inherit',
    containerStyle,
    counterStyle,
    digitStyle,
    gradientHeight = 16,
    gradientFrom = 'black',
    gradientTo = 'transparent',
    topGradientStyle,
    bottomGradientStyle,
}: CounterProps) {
    // Auto-compute places from value digits if not provided
    const computedPlaces: (number | '.')[] = places ?? [...value.toString()].map((ch, i, a) => {
        if (ch === '.') return '.';
        const dotIdx = a.indexOf('.');
        const exp = dotIdx === -1
            ? a.length - i - 1
            : i < dotIdx
                ? dotIdx - i - 1
                : -(i - dotIdx);
        return 10 ** exp;
    });

    const height = fontSize + padding;

    const defaultCounterStyle: React.CSSProperties = {
        fontSize,
        gap,
        borderRadius,
        paddingLeft: horizontalPadding,
        paddingRight: horizontalPadding,
        color: textColor,
        fontWeight,
    };

    const defaultTopGradientStyle: React.CSSProperties = {
        height: gradientHeight,
        background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})`,
    };

    const defaultBottomGradientStyle: React.CSSProperties = {
        height: gradientHeight,
        background: `linear-gradient(to top, ${gradientFrom}, ${gradientTo})`,
    };

    return (
        <span className="counter-container" style={containerStyle}>
            <span className="counter-counter" style={{ ...defaultCounterStyle, ...counterStyle }}>
                {computedPlaces.map((place, idx) => (
                    <Digit key={idx} place={place} value={value} height={height} digitStyle={digitStyle} />
                ))}
            </span>
            <span className="gradient-container">
                <span
                    className="top-gradient"
                    style={topGradientStyle ?? defaultTopGradientStyle}
                />
                <span
                    className="bottom-gradient"
                    style={bottomGradientStyle ?? defaultBottomGradientStyle}
                />
            </span>
        </span>
    );
}

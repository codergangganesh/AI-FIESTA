'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ScrollRevealProps {
    children: ReactNode;
    delay?: number;
    className?: string;
    width?: 'fit-content' | '100%';
}

export default function ScrollReveal({
    children,
    delay = 0,
    className = "",
    width = "100%"
}: ScrollRevealProps) {
    return (
        <div style={{ width, overflow: 'hidden' }} className={className}>
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 75 },
                    visible: { opacity: 1, y: 0 }
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, margin: "-100px" }}
                transition={{ duration: 0.8, delay: delay, ease: "easeOut" }}
            >
                {children}
            </motion.div>
        </div>
    );
}

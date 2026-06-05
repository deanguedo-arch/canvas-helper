# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- External dependencies preserved: https://cdn.tailwindcss.com?plugins=forms,container-queries, https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;700;800&amp;family=IBM+Plex+Sans:wght@600&amp;family=Work+Sans:wght@400;600&amp;display=swap, https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap, https://lh3.googleusercontent.com/aida-public/AB6AXuAQVO7T55Vcbvu7l1Y-Pq2LG5DHe0HoIXbH6uFUj4X-gSBWUI708z4_N9h1PD7V2Px5M0ETz4ezeXPqthyJDmpW8Mx5wJ4Ov4imQ7M82KVUT_zuP-zeI6RsPMJU7LoZcRG007h1yv7rwxT8Si2gPaxpk0QYWljctY7hRRxsrKGAlzuZJBm2TExKPCMQxrss439kua1Z5jGQ2EuAEtICUgSbvrPnpdqx4_WLzjMj2aI8fPUjVDkhDwL0P0D_gr3aFglhCuu5riObfqkp, https://lh3.googleusercontent.com/aida-public/AB6AXuC32VwimeI-P67qQATHm1i1Ms-Rx8BQJ64vnSzL_oAdgkWC4Rx3d-UqMD4MrCyNrYlA599GiPGqKAcpYsnl-B5Xv1offm6kNEX28hpxz_AluHETerqVPCxMBMODsJLviRjSS-TnH6IpIPL8hd4jZrqH7nLg6OELRmM4lFSpJ8BP_lICoM5FSw9XCWUscvhohqDITB5CuRsDe6YRFZ8DRH--Js1uIXm_-afSlyla4mfcbBUVX9gwpXzUsiLoaQTUoQC5ZLRzV293vB0C

## Visual Signals
- No Tailwind color tokens detected.
- Hex colors: #154212, #F1F3F4, #a1d494, #454749, #131e17, #bdcabe, #edeeef, #93000a, #ba1a1a, #BA1A1A
- Repeated shape tokens: rounded-xl, rounded-full, rounded-2xl, rounded-lg, rounded-r
- Motion and interaction tokens: transition-all, hover:bg-white/5, hover:text-white, hover:bg-black/10, transition-colors, hover:scale-110, transition-transform, hover:opacity-100, transition-opacity, hover:text-primary

## Interaction Notes
- No notable interaction heuristics detected.

## Editing Guidance
- Prefer edits in workspace/ files only; raw/ is the preserved baseline.
- Preserve existing dependency URLs unless you intentionally replace the runtime.
- When rewriting content, keep heading hierarchy and repeated utility-class patterns consistent with the original style.

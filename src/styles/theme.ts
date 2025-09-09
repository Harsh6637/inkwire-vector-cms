export const inkwireTheme = {
colors: {
    primary: {
        main: '#0066FF',
light: '#3388FF',
dark: '#0052CC'
},
secondary: {
main: '#00C2FF',
light: '#33D1FF',
dark: '#009BCC'
},
background: {
default: '#F8FAFC',
paper: '#FFFFFF'
},
text: {
primary: '#1E1F36',
secondary: '#6B7280'
},
border: '#E5E7EB',
success: '#10B981',
warning: '#F59E0B',
error: '#EF4444'
},
typography: {
// Using DM Sans as configured globally - no font family overrides
weights: {
normal: 400,
medium: 500,
semibold: 600,
bold: 700
}
}
} as const;

// Tailwind class mappings for Inkwire Analyzer styling
export const themeClasses = {
// Primary colors (Modern Indigo)
primary: 'text-indigo-600',
primaryBg: 'bg-indigo-600',
primaryHover: 'hover:bg-indigo-700',
primaryBorder: 'border-indigo-600',
primaryLight: 'bg-indigo-50 text-indigo-600',

// Secondary colors (Modern Cyan)
secondary: 'text-cyan-600',
secondaryBg: 'bg-cyan-600',
secondaryHover: 'hover:bg-cyan-700',
secondaryLight: 'bg-cyan-50 text-cyan-600',

// Accent colors (Purple)
accent: 'text-violet-600',
accentBg: 'bg-violet-600',
accentHover: 'hover:bg-violet-700',
accentLight: 'bg-violet-50 text-violet-600',

// Background colors
bgDefault: 'bg-slate-50',
bgPaper: 'bg-white',
bgSurface: 'bg-slate-50',

// Text colors (Professional slate scale)
textPrimary: 'text-slate-900',
textSecondary: 'text-slate-500',
textMuted: 'text-slate-400',

// Border colors
borderLight: 'border-slate-100',
borderDefault: 'border-slate-200',
borderStrong: 'border-slate-300',

// Status colors
success: 'text-emerald-600',
successBg: 'bg-emerald-600',
successLight: 'bg-emerald-50 text-emerald-600',

warning: 'text-amber-600',
warningBg: 'bg-amber-600',
warningLight: 'bg-amber-50 text-amber-600',

error: 'text-red-600',
errorBg: 'bg-red-600',
errorLight: 'bg-red-50 text-red-600',

info: 'text-sky-600',
infoBg: 'bg-sky-600',
infoLight: 'bg-sky-50 text-sky-600',

// Typography weights (using DM Sans)
fontLight: 'font-light',
fontNormal: 'font-normal',
fontMedium: 'font-medium',
fontSemibold: 'font-semibold',
fontBold: 'font-bold',

// Modern shadows for depth
shadowSm: 'shadow-sm',
shadowMd: 'shadow-md',
shadowLg: 'shadow-lg',
shadowXl: 'shadow-xl',

// Modern gradients
gradientPrimary: 'bg-gradient-to-r from-indigo-600 to-purple-600',
gradientSecondary: 'bg-gradient-to-r from-cyan-500 to-blue-500',
gradientBg: 'bg-gradient-to-br from-slate-50 to-slate-100'
} as const;

export type ThemeClasses = typeof themeClasses;
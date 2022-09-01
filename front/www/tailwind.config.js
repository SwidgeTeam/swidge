module.exports = {
    content: [
        './index.html',
        './src/**/*.{vue,js,ts,jsx,tsx}',
        './node_modules/tw-elements/dist/js/**/*.js',
    ],
    darkMode: 'class', // or 'media' or 'class'
    theme: {
        fontFamily: {
            sans: ['Outfit', 'system-ui', 'sans-serif'],
            roboto: ['Roboto', 'system-ui', 'sans-serif'],
        },
        extend: {
            colors: {
                // delete later
                'background-dark': '#161619',
                'text-small': '#65676F',
                'text-dark-white-accent': '#C7C8CB',
                'text-light-gray-accent': '#93959C',
                'background-gray-accent': '#252527',
                'gray-border-color': '#2d2d32',
                'button-accent': '#3A93EE',
                'swapbridge-outer-background': '#1E1F2A',
                'swapbridge-inner-background': '#16151E',
                'swapbridge-inner-background-accent': '#1E1F2A',
                'swapbridge-border-color': '#292C3E',
                // delete until here
                'confirmation-green': '#00ED18',
                'background-main-dark': '#222129',
                'cards-background-dark-grey': '#31313E',
                'light-grey-2': '#6B6B6B',
                'light-grey-1': '#EDEDED',
                'light-grey-3': '#A5A5A5',
            },
            screens: {
                'sm': '640px', // => @media (min-width: 640px)
                'md': '768px', // => @media (min-width: 768px)
                'lg': '1024px', // => @media (min-width: 1024px)
                'xl': '1280px', // => @media (min-width: 1280px)
                '2xl': '1536px', // => @media (min-width: 1536px)
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/aspect-ratio'),
        require('@tailwindcss/typography'),
        require('tw-elements/dist/plugin')
    ],
}

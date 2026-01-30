const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        path.join(__dirname, "./index.html"),
        path.join(__dirname, "./src/**/*.{js,ts,jsx,tsx}"),
    ],
    theme: {
        extend: {
            colors: {
                background: '#FAFAF8',
                charcoal: '#2E2E2E',
                lightBlack: '#1F1F1F',
                primary: '#007EA8',
                'primary-hover': '#006B8F',
            }
        },
    },
    plugins: [],
}

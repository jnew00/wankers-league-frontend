/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"], // Adjust based on your file structure
  variants: {
    extend: {
      backgroundColor: ['print'],
      backgroundImage: ['hover', 'focus', 'print'],
    },
  },
  theme: {
    extend: {
      listStyleType: {
        "lower-alpha": "lower-alpha",
        "upper-alpha": "upper-alpha",
        "lower-roman": "lower-roman",
        "upper-roman": "upper-roman",
      },
    
    },
    
    safelist: [
      // Custom class for number input arrows
      {
        pattern: /no-arrows/,
      },
    ],
  },
  plugins: [],
};

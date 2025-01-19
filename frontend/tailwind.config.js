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
      backgroundImage: {
        'highlight': "url('data:image/svg+xml,%3Csvg xmlns%3D%22http%3A//www.w3.org/2000/svg%22 width%3D%22100%25%22 height%3D%22100%25%22%3E%3Crect width%3D%22100%25%22 height%3D%22100%25%22 fill%3D%22yellow%22 /%3E%3C/svg%3E')",
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

module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media',
  theme: {
    fontFamily: {
      display: ['Poppins', 'system-ui', 'sans-serif'],
      body: ['Poppins', 'system-ui', 'sans-serif'],
    },
    colors: {
      meteor: {
        50: '#fcf9f3',
        100: '#faf2e8',
        200: '#f2dfc4',
        300: '#eacba1',
        400: '#daa55b',
        500: '#ca7e14',
        600: '#b67112',
        700: '#985f0f',
        800: '#794c0c',
        900: '#633e0a',
      },
      dodger: {
        50: '#f5f9fe',
        100: '#ebf2fd',
        200: '#cde0fa',
        300: '#aecdf7',
        400: '#72a7f1',
        500: '#3581eb',
        600: '#3074d4',
        700: '#2861b0',
        800: '#204d8d',
        900: '#1a3f73',
      },
      dark: {
        42: '#18182a',
        80: '#323280',
      },
      white: {
        42: '#ffffff',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};

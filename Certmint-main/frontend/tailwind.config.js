module.exports = {
      content: [
        "./src/**/*.{html,js,ts,jsx,tsx}", 
        "./public/index.html", 
      ],
      theme: {
        extend: {
          fontFamily: {
            poppins: ['Poppins', 'sans-serif'],
            forum: ['Forum', 'cursive'],
            gothic: ["UnifrakturCook", "serif"],
            kosugi: ["Kosugi Maru", "sans-serif"],
            devnagari: ["Tiro Devanagari Hindi", "serif"],
          }
        },
      },
      plugins: [],
    };

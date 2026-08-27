cat << 'CSS_EOF' >> apps/mobile/global.css

@utility font-sans {
  font-family: 'Outfit_400Regular';
}
@utility font-heading {
  font-family: 'Poppins_700Bold';
}

@layer theme {
  .theme-tauheed {
    --color-primary-0: 209 250 229;
    --color-primary-50: 167 243 208;
    --color-primary-100: 110 231 183;
    --color-primary-200: 52 211 153;
    --color-primary-300: 16 185 129;
    --color-primary-400: 5 150 105;
    --color-primary-500: 4 120 87;
    --color-primary-600: 6 95 70;
    --color-primary-700: 6 78 59;
    --color-primary-800: 2 44 34;
    --color-primary-900: 2 44 34;
    --color-primary-950: 2 44 34;
    --background: rgba(6, 78, 59, 0.4);
  }

  .theme-saramara {
    --color-primary-0: 224 242 254;
    --color-primary-50: 186 230 253;
    --color-primary-100: 125 211 252;
    --color-primary-200: 56 189 248;
    --color-primary-300: 14 165 233;
    --color-primary-400: 2 132 199;
    --color-primary-500: 3 105 161;
    --color-primary-600: 7 89 133;
    --color-primary-700: 15 23 42;
    --color-primary-800: 15 23 42;
    --color-primary-900: 15 23 42;
    --color-primary-950: 15 23 42;
    --background: rgba(15, 23, 42, 0.4);
  }
}
CSS_EOF

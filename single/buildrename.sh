# npm install;
npm run build;

cd build/static/css;
mv main.*.css main.css;
mv main.*.css.map main.css.map;
cd ../js;
mv main.*.js main.js;
mv main.*.js.map main.js.map;

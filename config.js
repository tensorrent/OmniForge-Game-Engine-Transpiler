// Deploy-time settings for the OmniForge site. The public GitHub Pages site runs in the browser
// only, so no backend address is kept here. To point a deployment at a backend, run
//   node scripts/set_api_base.mjs https://api.example.org --env production
// and do not commit the result if the address is private.
window.OMNIFORGE_CONFIG = window.SPROUT_SPRZ_CONFIG = {
  environment: "static",
  apiBaseUrl: "",
  stagingApiBaseUrl: "",
  localApiBaseUrl: ""
};

export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ["@nuxtjs/tailwindcss"],

  runtimeConfig: {
    public: {
      apiBase: "",
      apiKey: "",
    },
  },

  app: {
    head: {
      title: "HungryHub Menu Manager",
      meta: [{ name: "description", content: "Restaurant Menu Management" }],
    },
  },
});

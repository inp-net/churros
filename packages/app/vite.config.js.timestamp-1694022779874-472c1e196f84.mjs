// vite.config.js
import { sveltekit } from "file:///home/uwun/projects/centraverse/node_modules/@sveltejs/kit/src/exports/vite/index.js";
import { fileURLToPath } from "node:url";
import { defineConfig, mergeConfig } from "file:///home/uwun/projects/centraverse/node_modules/vite/dist/node/index.js";
import icons from "file:///home/uwun/projects/centraverse/node_modules/unplugin-icons/dist/vite.mjs";
var __vite_injected_original_import_meta_url = "file:///home/uwun/projects/centraverse/packages/app/vite.config.js";
var commonConfig = defineConfig({
  plugins: [
    icons({
      compiler: "svelte",
      defaultClass: "icon",
      scale: 1.5
    })
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "${fileURLToPath(
          new URL("src/design/variables.scss", __vite_injected_original_import_meta_url)
        )}" as *;`
      }
    }
  }
});
var vite_config_default = mergeConfig(
  commonConfig,
  defineConfig({
    plugins: [sveltekit()]
  })
);
export {
  commonConfig,
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS91d3VuL3Byb2plY3RzL2NlbnRyYXZlcnNlL3BhY2thZ2VzL2FwcFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvdXd1bi9wcm9qZWN0cy9jZW50cmF2ZXJzZS9wYWNrYWdlcy9hcHAvdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdXd1bi9wcm9qZWN0cy9jZW50cmF2ZXJzZS9wYWNrYWdlcy9hcHAvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBzdmVsdGVraXQgfSBmcm9tICdAc3ZlbHRlanMva2l0L3ZpdGUnO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ25vZGU6dXJsJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbWVyZ2VDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCBpY29ucyBmcm9tICd1bnBsdWdpbi1pY29ucy92aXRlJztcblxuZXhwb3J0IGNvbnN0IGNvbW1vbkNvbmZpZyA9IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICBpY29ucyh7XG4gICAgICBjb21waWxlcjogJ3N2ZWx0ZScsXG4gICAgICBkZWZhdWx0Q2xhc3M6ICdpY29uJyxcbiAgICAgIHNjYWxlOiAxLjUsXG4gICAgfSksXG4gIF0sXG4gIGNzczoge1xuICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgIHNjc3M6IHtcbiAgICAgICAgYWRkaXRpb25hbERhdGE6IGBAdXNlIFwiJHtmaWxlVVJMVG9QYXRoKFxuICAgICAgICAgIG5ldyBVUkwoJ3NyYy9kZXNpZ24vdmFyaWFibGVzLnNjc3MnLCBpbXBvcnQubWV0YS51cmwpXG4gICAgICAgICl9XCIgYXMgKjtgLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxufSk7XG5cbi8vIEFkZCBzdmVsdGUta2l0IHRvIHZpdGUgY29uZmlnXG5leHBvcnQgZGVmYXVsdCBtZXJnZUNvbmZpZyhcbiAgY29tbW9uQ29uZmlnLFxuICBkZWZpbmVDb25maWcoe1xuICAgIHBsdWdpbnM6IFtzdmVsdGVraXQoKV0sXG4gIH0pXG4pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFzVCxTQUFTLGlCQUFpQjtBQUNoVixTQUFTLHFCQUFxQjtBQUM5QixTQUFTLGNBQWMsbUJBQW1CO0FBQzFDLE9BQU8sV0FBVztBQUg4SyxJQUFNLDJDQUEyQztBQUsxTyxJQUFNLGVBQWUsYUFBYTtBQUFBLEVBQ3ZDLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxNQUNKLFVBQVU7QUFBQSxNQUNWLGNBQWM7QUFBQSxNQUNkLE9BQU87QUFBQSxJQUNULENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxLQUFLO0FBQUEsSUFDSCxxQkFBcUI7QUFBQSxNQUNuQixNQUFNO0FBQUEsUUFDSixnQkFBZ0IsU0FBUztBQUFBLFVBQ3ZCLElBQUksSUFBSSw2QkFBNkIsd0NBQWU7QUFBQSxRQUN0RCxDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQztBQUdELElBQU8sc0JBQVE7QUFBQSxFQUNiO0FBQUEsRUFDQSxhQUFhO0FBQUEsSUFDWCxTQUFTLENBQUMsVUFBVSxDQUFDO0FBQUEsRUFDdkIsQ0FBQztBQUNIOyIsCiAgIm5hbWVzIjogW10KfQo=

import injectProcessEnv from "rollup-plugin-inject-process-env";
import reactRefresh from "@vitejs/plugin-react-refresh";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default ({ mode }) => {
  return {
    plugins: [reactRefresh(), svgr()],
    define: {
      process: {
        env: {
          NODE_ENV: mode
        },
      },
    },
  };
};

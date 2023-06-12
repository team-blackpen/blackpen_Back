module.exports = {
  apps: [
    {
      name: "jeanhada",
      script: "./src/app.js",
      instances: 0,
      exec_mode: "cluster",

      output: "~/logs/pm2/console.log", // 로그 출력 경로 재설정
      error: "~/logs/pm2/onsoleError.log", // 에러 로그 출력 경로 재설정
    },
  ],
};

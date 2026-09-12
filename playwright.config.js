import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests/e2e', timeout:30000, fullyParallel:false, workers:1,
  use:{baseURL:'http://127.0.0.1:4317',browserName:'chromium',headless:true},
  webServer:[
    {command:'node server.js',url:'http://127.0.0.1:4317',reuseExistingServer:!process.env.CI,env:{PORT:'4317'}},
    {command:'node teacher-server.js',url:'http://127.0.0.1:4318',reuseExistingServer:!process.env.CI,env:{TEACHER_PORT:'4318',TEACHER_TOKEN:'test-only-teacher-password'}}
  ]
});

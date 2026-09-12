import { generateMission } from '../src/gemini.js';
try {
  const result=await generateMission({subject:'Ciências',topic:'Água e consumo consciente',grade:'6º ano',minutes:10,resources:'Um aparelho por grupo'},{apiKey:process.env.GEMINI_API_KEY,model:process.env.GEMINI_MODEL});
  console.log(JSON.stringify({ok:true,source:result.source,model:result.model,title:result.mission.title,steps:result.mission.steps.length,reviewed:result.reviewed}));
}catch(error){console.log(JSON.stringify({ok:false,status:error.status,message:error.message}));process.exitCode=1;}

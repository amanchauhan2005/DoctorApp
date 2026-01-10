const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const models = await genAI.listModels();
console.log(models);
run();
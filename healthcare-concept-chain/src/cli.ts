import { HealthcareConceptChain } from "healthcare-chain.js";
import { BaseCallbackHandler, CallbackManager } from "langchain/callbacks";
import { ChatOpenAI } from "langchain/chat_models";


class WeblogCallbackHandler extends BaseCallbackHandler {
  constructor() {
    super()
  }
  async handleLLMStart(_llm: { name: string; }, prompts: string[], _verbose?: boolean){
    console.error(prompts[0])
    report.steps.push({input: prompts[0]});
  }
  async handleLLMEnd(output: LLMResult, _verbose?: boolean) {
    console.error( output.generations[0][0].text)
    report.steps.slice(-1)[0].output = output.generations[0][0].text
  }
  async handleText(text: string, _verbose?: boolean) {
    console.error(JSON.stringify(text, null, 2))
    report.steps.slice(-1)[0].parsed = JSON.parse(JSON.stringify(text));
  }
}

const callbackManager = new CallbackManager();
callbackManager.addHandler(new WeblogCallbackHandler());
const q = process.argv[2];

const report: Record<string, any> = {
  input: q,
  steps: []
};

// console.log("Q", q);
let llm = new ChatOpenAI({ temperature: 0.3, concurrency: 3, callbackManager});
const hcc = new HealthcareConceptChain({ llm });

const res = await hcc.call({
  clinicalText: q,
});

// console.log("Final");
// console.log(JSON.stringify(res, null, 2));

report.plan = report.steps[0].parsed;
report.result = res;
console.log(JSON.stringify(report, null, 2))
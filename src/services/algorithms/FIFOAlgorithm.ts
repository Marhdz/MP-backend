import { AlgorithmResult, RunArgs, SimulationExecution } from "../../utils/types";
import AlgorithmInterface from "../AlgorithmInterface";
import Memory from "../Memory";

export default class FIFOAlgorithm extends AlgorithmInterface {
  protected fifoQueue: string[]
  protected memory: Memory

  constructor(args: { memoryInitalState: string[] }) {
    const { memoryInitalState } = args;
    super({ algorithmName: 'fifoAlgorithm' })
    this.fifoQueue = [];
    memoryInitalState.filter(cur => cur !== "0").map(cur => this.fifoQueue.unshift(cur));
    this.memory = new Memory({ memoryInitalState });
  }

  public findPageToReplace(): string {
    return this.fifoQueue.pop() || "";
  }

  public run(args: RunArgs): AlgorithmResult {
    const { pagesQueue, actionsQueue, shouldShowDetails } = args;
    const start = new Date().getTime();

    const simulationExecution: SimulationExecution[] = []
    let faults = 0;

    for (let i = 0; i < pagesQueue.length; i++) {
      const pageName = pagesQueue[i]
      const modified = actionsQueue[i] === "E"

      if (this.memory.referencePage(pageName)) {
        if (shouldShowDetails) simulationExecution.push({ fault: false, pageName, action: `La página ${pageName} está en la memoria`, memory: this.memory.getPages() })
      } else {
        faults++;
        if (this.memory.hasFreePosition()) {
          this.memory.replacePage(pageName, "0", modified);
          if (shouldShowDetails) simulationExecution.push({ fault: true, pageName, action: `La página ${pageName} se ha insertado en una ubicación de memoria libre.`, memory: this.memory.getPages() })
          this.fifoQueue.unshift(pageName);
        } else {
          const pageNameToReplace = this.findPageToReplace();
          this.memory.replacePage(pageName, pageNameToReplace, modified);
          if (shouldShowDetails) simulationExecution.push({ fault: true, pageName, action: `La página ${pageName} se ha insertado en lugar de la página ${pageNameToReplace}.`, memory: this.memory.getPages() })
          this.fifoQueue.unshift(pageName);
        }
      }
      this.memory.setModified(this.memory.findIndex(pageName), modified)
    }
    const end = new Date().getTime();
    const simulationTime = end - start;

    return {
      name: this.algorithmName,
      cont: faults,
      simulationTime,
      simulationExecution,
    }
  }
}

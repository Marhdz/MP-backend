import { AlgorithmResult, FindPageToReplaceArgs, RunArgs, SimulationExecution } from "../../utils/types";
import Memory from "../Memory";
import AlgorithmInterface from "../AlgorithmInterface";

export default class OptimalAlgorithm extends AlgorithmInterface {
  protected memory: Memory

  constructor(args: { memoryInitalState: string[] }) {
    const { memoryInitalState } = args;
    super({ algorithmName: 'optimalAlgorithm' });
    this.memory = new Memory({ memoryInitalState });
  }

  public findPageToReplace(args: FindPageToReplaceArgs): string {
    const { pagesQueue } = args
    const pagesReferences = this.memory.pagesInMemory.map(cur => {
      return {
        pageName: cur.pageName,
        index: pagesQueue?.findIndex((value) => value === cur.pageName)
      }
    });
    const notInQueue = pagesReferences?.find(cur => cur.index === -1);
    if (notInQueue) {
      return notInQueue.pageName;
    } else {
      pagesReferences?.sort((a, b) => a.index - b.index);
      return pagesReferences?.pop()?.pageName || "";
    }
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
        if (shouldShowDetails) simulationExecution.push({ fault: false, pageName, action: `La página ${pageName} está en la memoria.`, memory: this.memory.getPages() })
      } else {
        faults++;
        if (this.memory.hasFreePosition()) {
          this.memory.replacePage(pageName, "0", modified);
          if (shouldShowDetails) simulationExecution.push({ fault: true, pageName, action: `La página ${pageName} se ha insertado en una ubicación de memoria libre.`, memory: this.memory.getPages() })
        } else {
          const pageNameToReplace = this.findPageToReplace({ pagesQueue: pagesQueue.slice(i) });
          this.memory.replacePage(pageName, pageNameToReplace, modified);
          if (shouldShowDetails) simulationExecution.push({ fault: true, pageName, action: `Se insertó la página ${pageName} en lugar de la página ${pageNameToReplace}.`, memory: this.memory.getPages() })
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

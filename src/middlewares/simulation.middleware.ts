import { algorithmNamesList } from "../utils/algorithmList"

export const validateSimulationRequiredParamsMiddleware = async (req: any, res: any, next: any) => {
  if (!req.body.memorySize) {
    return res.status(400).send({ success: false, message: `El campo "Tamaño de la memoria" es obligatorio.` })
  } else if (!req.body.pagesQueueSize) {
    return res.status(400).send({ success: false, message: `El campo "Tamaño de cola de página" es obligatorio.` })
  } else if (!req.body.numberOfPages) {
    return res.status(400).send({ success: false, message: `El campo "Número de páginas" es obligatorio.` })
  } else if (!req.body.pages) {
    return res.status(400).send({ success: false, message: `El campo "Páginas" es obligatorio.` })
  } else if (!req.body.pagesQueue) {
    return res.status(400).send({ success: false, message: `El campo "Cola de páginas" es obligatorio.` })
  } else if (!req.body.actionsQueue) {
    return res.status(400).send({ success: false, message: `El campo "Cola de acciones" es obligatorio.` })
  } else if (!req.body.memoryInitalState) {
    return res.status(400).send({ success: false, message: `El campo "Estado inicial de la memoria" es obligatorio.` })
  } else if (!req.body.algorithms) {
    return res.status(400).send({ success: false, message: `El campo "Algoritmos" es obligatorio.` })
  } else if (!req.body.clockInterruption && (req.body.algorithms.includes("nruAlgorithm") || req.body.algorithms.includes("secondChanceAlgorithm") || req.body.algorithms.includes("wsClockAlgorithm"))) {
    return res.status(400).send({ success: false, message: `El campo "Interrupción del reloj" es obligatorio.` })
  } else if (!req.body.tau && req.body.algorithms.includes("wsClockAlgorithm")) {
    return res.status(400).send({ success: false, message: `El campo "τ (tau)" es obligatorio.` })
  } else {
    return next();
  }
}

export const validateSimulationParamsIntegrityMiddleware = async (req: any, res: any, next: any) => {
  const memorySize: number = req.body.memorySize
  const pagesQueueSize: number = req.body.pagesQueueSize
  const numberOfPages: number = req.body.numberOfPages
  const pages: string[] = req.body.pages
  const pagesQueue: string[] = (req.body.pagesQueue as string).split("|")
  const actionsQueue: string[] = (req.body.actionsQueue as string).split("|")
  const actionsQueueCharNotAllowed: string[] = actionsQueue.filter(cur => cur !== "|" && cur !== "E" && cur !== "L")
  const memoryInitalState: string[] = req.body.memoryInitalState.split("|")
  const clockInterruption: number = req.body.clockInterruption
  const algorithmsNotAllowed: string[] = (req.body.algorithms as string[]).filter(cur => !algorithmNamesList.includes(cur))

  if (memorySize !== memoryInitalState.length) {
    return res.status(400).send({
      success: false,
      message: `El campo "Estado de memoria inicial" debe tener una longitud igual al tamaño de la memoria.`
    })
  } else if (pagesQueueSize !== pagesQueue.length) {
    return res.status(400).send({
      success: false,
      message: `El campo "Cola de páginas" debe tener una longitud igual al tamaño de la cola de páginas.`
    })
  } else if (pagesQueueSize !== actionsQueue.length) {
    return res.status(400).send({
      success: false,
      message: `El campo "Cola de acciones" debe tener una longitud igual al tamaño de la cola de páginas.`
    })
  } else if (actionsQueueCharNotAllowed.length) {
    const plural = actionsQueueCharNotAllowed.length > 1 ? "s" : "";
    return res.status(400).send({
      success: false,
      message: `El campo "Cola de acciones" debe tener solo los caracteres "|", "E" e "L". Caracter${plural ? "es" : ""} no soportados${plural}: ${actionsQueueCharNotAllowed.join(", ")}.`
    })
  } else if (numberOfPages !== pages.length) {
    return res.status(400).send({
      success: false,
      message: `El campo "Páginas" debe tener una longitud igual al número de páginas.`
    })
  } else if (clockInterruption >= pagesQueueSize) {
    return res.status(400).send({
      success: false,
      message: `El campo "Interrupción del reloj" debe ser más pequeño que el tamaño de la cola de páginas.`
    })
  } else if (algorithmsNotAllowed.length) {
    const plural = algorithmsNotAllowed.length > 1 ? "s" : "";
    return res.status(400).send({
      success: false,
      message: `Algoritmo${plural} no soportado${plural}: ${algorithmsNotAllowed.join(", ")}.`
    })
  } else {
    return next();
  }
}

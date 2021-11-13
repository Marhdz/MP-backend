export const validateSimulationRatingRequiredParamsMiddleware = async (req: any, res: any, next: any) => {
  if (!req.body.rating) {
    return res.status(400).send({ success: false, message: `El campo "Evaluación" es obligatorio.` })
  } else {
    return next();
  }
}

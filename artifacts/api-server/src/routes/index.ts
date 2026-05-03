import { Router, type IRouter } from "express";
import healthRouter from "./health";
import edithRouter from "./edith";
import voiceRouter from "./voice";
import visionRouter from "./vision";
import statusRouter from "./status";

const router: IRouter = Router();

router.use(healthRouter);
router.use(edithRouter);
router.use(voiceRouter);
router.use(visionRouter);
router.use(statusRouter);

export default router;

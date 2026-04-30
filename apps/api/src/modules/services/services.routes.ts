import { Router } from 'express';
import * as servicesController from './services.controller';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/suggest-slug', servicesController.getSuggestedSlug);

router.route('/')
  .get(servicesController.getAllServices)
  .post(upload.single('serviceImage'), servicesController.createService);

router.route('/:id')
  .get(servicesController.getService)
  .patch(upload.single('serviceImage'), servicesController.updateService)
  .delete(servicesController.deleteService);

export default router;

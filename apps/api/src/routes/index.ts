import { Router } from 'express';
import adminRoutes from './admin.routes';
import websiteRoutes from './website.routes';

const router = Router();

router.use('/admin', adminRoutes);    // /api/v1/admin/*
router.use('/website', websiteRoutes); // /api/v1/website/*

export default router;
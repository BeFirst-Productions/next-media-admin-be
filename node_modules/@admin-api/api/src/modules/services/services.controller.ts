import { Request, Response } from 'express';
import { ServicesService } from './services.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/ApiResponse';

const servicesService = new ServicesService();

/** Safely extract a required string route param */
function requireParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== 'string') return ''; // Or throw error
  return value;
}

export const createService = asyncHandler(async (req: Request, res: Response) => {
  // Parse nested subHeadings and whyChooseUs if sent as JSON strings (common with multipart/form-data)
  if (typeof req.body.subHeadings === 'string') {
    req.body.subHeadings = JSON.parse(req.body.subHeadings);
  }
  if (typeof req.body.whyChooseUs === 'string') {
    req.body.whyChooseUs = JSON.parse(req.body.whyChooseUs);
  }

  const service = await servicesService.createService(req.body, req.file);
  sendSuccess(res, service, 'Service created successfully', 201);
});

export const getAllServices = asyncHandler(async (req: Request, res: Response) => {
  const result = await servicesService.getAllServices(req.query);
  sendSuccess(res, result, 'Services retrieved successfully');
});

export const getService = asyncHandler(async (req: Request, res: Response) => {
  const service = await servicesService.getServiceById(requireParam(req, 'id'));
  sendSuccess(res, service, 'Service retrieved successfully');
});

export const updateService = asyncHandler(async (req: Request, res: Response) => {
  if (typeof req.body.subHeadings === 'string') {
    req.body.subHeadings = JSON.parse(req.body.subHeadings);
  }
  if (typeof req.body.whyChooseUs === 'string') {
    req.body.whyChooseUs = JSON.parse(req.body.whyChooseUs);
  }

  const service = await servicesService.updateService(requireParam(req, 'id'), req.body, req.file);
  sendSuccess(res, service, 'Service updated successfully');
});

export const deleteService = asyncHandler(async (req: Request, res: Response) => {
  await servicesService.deleteService(requireParam(req, 'id'));
  sendSuccess(res, null, 'Service deleted successfully');
});

export const getSuggestedSlug = asyncHandler(async (req: Request, res: Response) => {
  const { title } = req.query;

  if (typeof title !== 'string') {
    sendSuccess(res, { slug: '' }, 'Valid title query parameter is required');
    return;
  }

  const slug = await servicesService.suggestSlug(title);
  sendSuccess(res, { slug }, 'Slug suggested successfully');
});

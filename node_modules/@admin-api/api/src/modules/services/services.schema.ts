import { Schema, model, Document } from 'mongoose';
import { applyBaseOptions } from '../../database/baseSchema';

export interface ISubHeading {
  heading: string;
  description: string;
  points: string[];
}

export interface IWhyChooseUsItem {
  heading: string;
  description: string;
}

export interface IService extends Document {
  title: string;
  serviceImage: string;
  excerpt: string;
  slug: string;
  serviceHeading: string;
  serviceDescription: string;
  subHeadings: ISubHeading[];
  whyChooseUs: {
    description: string;
    items: IWhyChooseUsItem[];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubHeadingSchema = new Schema<ISubHeading>({
  heading: { type: String, required: true },
  description: { type: String, required: true },
  points: [{ type: String }],
}, { _id: false });

const WhyChooseUsItemSchema = new Schema<IWhyChooseUsItem>({
  heading: { type: String, required: true },
  description: { type: String, required: true },
}, { _id: false });

const ServiceSchema = new Schema<IService>({
  title: { type: String, required: true, trim: true },
  serviceImage: { type: String, required: true },
  excerpt: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  serviceHeading: { type: String, required: true },
  serviceDescription: { type: String, required: true },
  subHeadings: [SubHeadingSchema],
  whyChooseUs: {
    description: { type: String, required: true },
    items: [WhyChooseUsItemSchema],
  },
  isActive: { type: Boolean, default: true },
});

applyBaseOptions(ServiceSchema);

export const Service = model<IService>('Service', ServiceSchema);

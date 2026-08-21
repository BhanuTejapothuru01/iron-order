import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().optional(),
  role: z.enum(['customer', 'owner']),
});

export const shopServiceSchema = z.object({
  service_name: z.string().min(1, 'Service name is required'),
  price: z.number().min(0, 'Price must be positive'),
});

export const shopHoursSchema = z.object({
  day_of_week: z.number().min(0).max(6),
  open_time: z.string().nullable().optional(),
  close_time: z.string().nullable().optional(),
  is_closed: z.boolean(),
});

export const shopRegistrationSchema = z.object({
  name: z.string().min(3, 'Shop name must be at least 3 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  address: z.string().min(5, 'Address is required'),
  phone: z.string().min(8, 'Phone number is required'),
  whatsapp: z.string().optional(),
  latitude: z.number({ message: 'Please select shop location on map' }),
  longitude: z.number({ message: 'Please select shop location on map' }),
  pickup_available: z.boolean().default(false),
  delivery_available: z.boolean().default(false),
  services: z.array(shopServiceSchema).min(1, 'Please add at least one service with pricing'),
  hours: z.array(shopHoursSchema).length(7, 'Operating hours for all 7 days are required'),
});

export const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(3, 'Review comment must be at least 3 characters').max(500, 'Comment too long'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ShopRegistrationFormData = z.infer<typeof shopRegistrationSchema>;
export type ShopServiceFormData = z.infer<typeof shopServiceSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;

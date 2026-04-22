import { z } from 'zod';

export const CategorySchema = z.enum([
  'flagship',
  'backbone',
  'specialist',
  'regional',
  'mission',
]);

export const StatusSchema = z.enum([
  'operational',
  'upgrading',
  'planned',
  'decommissioned',
]);

export const NationSchema = z.enum([
  'England',
  'Scotland',
  'Wales',
  'Northern Ireland',
]);

export const ITL1Schema = z.enum([
  'North East',
  'North West',
  'Yorkshire and The Humber',
  'East Midlands',
  'West Midlands',
  'East of England',
  'London',
  'South East',
  'South West',
  'Scotland',
  'Wales',
  'Northern Ireland',
]);

export const AccessTypeSchema = z.enum([
  'public-application',
  'federated',
  'restricted',
  'commercial',
]);

export const HardwareTagSchema = z.enum([
  'nvidia-gpu',
  'amd-gpu',
  'intel-gpu',
  'grace-hopper',
  'cerebras',
  'cpu-only',
  'cloud',
]);

const YearMonthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, 'Expected YYYY-MM');

export const SourceSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
});

export const ImageSchema = z.object({
  url: z.string().url(),
  credit: z.string().min(1),
  licence: z.string().min(1),
  source: z.string().min(1),
});

export const LocationSchema = z.object({
  institution: z.string().min(1),
  city: z.string().min(1),
  nation: NationSchema,
  itl1: ITL1Schema,
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});

export const KeyFactsSchema = z.object({
  hardware: z.string().min(1),
  performance: z.string().min(1),
  funding: z.string().min(1),
  energy: z.string().min(1),
});

export const AccessSchema = z.object({
  route: z.string().min(1),
  accessType: AccessTypeSchema,
});

export const FacilitySchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    name: z.string().min(1),
    category: CategorySchema,
    status: StatusSchema,
    location: LocationSchema,
    operator: z.string().min(1),
    funder: z.string().min(1),
    opened: YearMonthSchema.nullable(),
    decommissioned: YearMonthSchema.nullable(),
    oneLiner: z.string().min(1).max(200),
    summary: z.string().min(1),
    keyFacts: KeyFactsSchema,
    access: AccessSchema,
    useCases: z.array(z.string().min(1)).min(1),
    hardwareTags: z.array(HardwareTagSchema).min(1),
    aiExaflops: z.number().nonnegative().nullable(),
    federationMembers: z.array(z.string().min(1)).nullable(),
    image: ImageSchema.nullable(),
    sources: z.array(SourceSchema).min(1),
  })
  .superRefine((facility, ctx) => {
    if (facility.status === 'decommissioned' && facility.decommissioned === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Decommissioned facilities must include a decommissioned date',
        path: ['decommissioned'],
      });
    }

    if (facility.status !== 'decommissioned' && facility.decommissioned !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Only decommissioned facilities may set a decommissioned date',
        path: ['decommissioned'],
      });
    }
  });

export type Facility = z.infer<typeof FacilitySchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Status = z.infer<typeof StatusSchema>;
export type Nation = z.infer<typeof NationSchema>;
export type ITL1 = z.infer<typeof ITL1Schema>;
export type AccessType = z.infer<typeof AccessTypeSchema>;
export type HardwareTag = z.infer<typeof HardwareTagSchema>;

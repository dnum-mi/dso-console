import { z } from 'zod'
import { allStatus, longestEnvironmentName } from '../utils/const.js'
import { PermissionSchema } from './permission.js'
import { ErrorSchema } from './utils.js'

export const EnvironmentSchema = z.object({
  id: z.string()
    .uuid(),
  name: z.string()
    .regex(/^[a-z0-9]+$/)
    .min(2)
    .max(longestEnvironmentName),
  projectId: z.string()
    .uuid(),
  quotaStageId: z.string()
    .uuid(),
  clusterId: z.string()
    .uuid(),
  status: z.enum(allStatus),
  permissions: z.lazy(() => PermissionSchema.array()),
})

export type Environment = Zod.infer<typeof EnvironmentSchema>

export const CreateEnvironmentSchema = {
  params: z.object({
    projectId: z.string()
      .uuid(),
  }),
  body: EnvironmentSchema.omit({ id: true, status: true, permissions: true }),
  responses: {
    201: EnvironmentSchema,
    400: ErrorSchema,
    401: ErrorSchema,
    500: ErrorSchema,
  },
}

export const GetEnvironmentsSchema = {
  params: z.object({
    clusterId: z.string()
      .uuid(),
  }),
  responses: {
    200: z.array(EnvironmentSchema),
    500: ErrorSchema,
  },
}

export const GetEnvironmentByIdSchema = {
  params: z.object({
    projectId: z.string()
      .uuid(),
    environmentId: z.string()
      .uuid(),
  }),
  responses: {
    200: EnvironmentSchema,
    401: ErrorSchema,
    404: ErrorSchema,
    500: ErrorSchema,
  },
}

export const UpdateEnvironmentSchema = {
  params: z.object({
    projectId: z.string()
      .uuid(),
    environmentId: z.string()
      .uuid(),
  }),
  body: EnvironmentSchema.partial(),
  responses: {
    200: EnvironmentSchema,
    500: ErrorSchema,
  },
}

export const DeleteEnvironmentSchema = {
  params: z.object({
    projectId: z.string()
      .uuid(),
    environmentId: z.string()
      .uuid(),
  }),
  responses: {
    204: null,
    500: ErrorSchema,
  },
}

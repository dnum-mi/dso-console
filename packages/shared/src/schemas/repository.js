import Joi from 'joi'
import { allStatus } from '../utils/const.js'

// TODO : isInfra, isPrivate et status doivent être required, prévoir migration
export const repoSchema = Joi.object({
  id: Joi.string()
    .uuid(),

  internalRepoName: Joi.string()
    .pattern(/^[a-zA-Z0-9-]+$/)
    .required(),

  externalRepoUrl: Joi.string()
    .uri({
      scheme: [
        'https',
      ],
    })
    .pattern(/^https:\/\/.*\.git$/)
    .required(),

  isPrivate: Joi.boolean(),
  // .required(),

  isInfra: Joi.boolean(),
  // .required(),

  externalUserName: Joi.string()
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .when('isPrivate', { is: true, then: Joi.required() })
    .when('isPrivate', { is: false, then: Joi.string().allow('') }),

  externalToken: Joi.string()
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .when('isPrivate', { is: true, then: Joi.required() })
    .when('isPrivate', { is: false, then: Joi.string().allow('') }),

  status: Joi.string()
    .valid(...allStatus),
  // .required(),
})

import express from 'express'
import {
  getProjectController,
  getProjectsController,
  createProjectController,
} from '../controllers/project.js'

const router = new express.Router()

router.post('/', createProjectController)
router.get('/', getProjectsController)
router.get('/:id', getProjectController)

export default router
import { BadRequestError, ForbiddenError } from '@/utils/errors.js'
import { getUserById } from '../queries-index.js'
import { allServices } from '@/utils/services.js'
import { User } from '@prisma/client'
import axios, { AxiosResponse } from 'axios'

export const checkServicesHealthBusiness = async (requestorId: User['id']) => {
  const user = await getUserById(requestorId)
  if (!user) throw new ForbiddenError('Vous n\'avez pas accès à cette information')

  try {
    return await Promise.all(Object.values(allServices)
      .map(async service => {
        const urlParsed = new URL(service.url).toString()
        let res: AxiosResponse<any>
        try {
          res = await axios.get(urlParsed, { validateStatus: () => true })
          return {
            name: service.name,
            status: res.status < 400 ? 'success' : 'error',
            message: `${res?.statusText}`,
            code: res?.status,
          }
        } catch (error) {
          return {
            name: service.name,
            status: res?.status < 400 ? 'success' : 'error',
            message: `Erreur : ${error.message}`,
            code: res?.status,
          }
        }
      }),
    )
  } catch (error) {
    if (error.message.match(/^Failed to parse URL from/)) throw new BadRequestError('Url de service invalide')
    throw new Error('Echec de la récupération de l\'état des services')
  }
}

import { PrismaClient, Prisma } from '@prisma/client' // Importa Prisma y PrismaClient
const prisma = new PrismaClient()
/* eslint-disable camelcase */

/**
 * *Valida si un ID de usuario existe en la base de datos
 * @param {string} id_user - El ID del usuario a validar.
 * @returns {boolean} - Devuelve `true` si el usuario existe, de lo contrario `false`.
 */

export const validateUserExistsService = async (data) => {
  const id_users = data
  const user = await prisma.users.findUnique({
    where: { id_users }
  })

  if (!user) {
    throw new Error('El usuario especificado no existe.')
  }
  return user
}

/**
 * *Valida si un ID de usuario existe en la base de datos
 * @param {string} id_user - El ID del usuario a validar.
 * @returns {boolean} - Devuelve `true` si el usuario existe, de lo contrario `false`.
 */

export const validateTemplateExistsService = async (data) => {
  const id_template = data
  const template = await prisma.templates.findUnique({
    where: { id_template }
  })

  if (!template) {
    throw new Error('El diseno especificado no existe.')
  }
  return template
}

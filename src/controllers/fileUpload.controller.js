/* eslint-disable camelcase */
import { handleAvatarUpload, createTemplateWithImageService, updateTemplateImageService, deleteTemplateImageService } from '../services/fileUpload.service.js'

export const uploadAvatarController = async (req, res) => {
  try {
    const result = await handleAvatarUpload(req.file, req.params.user_id)
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const createTemplateWithImageController = async (req, res) => {
  try {
    // `req.file` contiene la imagen si se subió
    const templateData = {
      id_users: req.body.id_users,
      design: req.body.design,
      decorator: req.file ? `${process.env.URL_READFILES}/uploads/design_images/${req.file.filename}` : null
    }

    // Llamar al servicio
    const newTemplate = await createTemplateWithImageService(templateData)

    res.status(201).json({
      message: 'Template creado exitosamente.',
      template: newTemplate
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const updateTemplateImageController = async (req, res) => {
  try {
    const { template_id } = req.params // Obtén el ID del template desde los parámetros de la ruta
    const file = req.file // El archivo subido

    const result = await updateTemplateImageService(template_id, file)

    res.status(200).json(result)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const deleteTemplateImageController = async (req, res) => {
  try {
    const { template_id } = req.params
    // console.log('template_id:', template_id) // Verifica que este log muestre un valor
    if (!template_id) {
      return res.status(400).json({ message: 'El ID del template es requerido.' })
    }

    const response = await deleteTemplateImageService(template_id)
    return res.status(200).json({
      message: 'Imagen eliminada con éxito.',
      data: response
    })
  } catch (error) {
    console.error(error.message)
    return res.status(400).json({ message: error.message })
  }
}

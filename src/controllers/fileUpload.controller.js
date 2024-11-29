import { handleAvatarUpload, handleReferenceImageUpload } from '../services/uploadService.js'

export const uploadAvatarController = async (req, res) => {
  try {
    const result = await handleAvatarUpload(req.file, req.params.user_id)
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const uploadDesignImageController = async (req, res) => {
  try {
    const result = await handleReferenceImageUpload(req.file, req.params.reference_id)
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

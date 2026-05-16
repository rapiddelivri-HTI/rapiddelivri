import supabase from './config.js'

export default async function handler(req, res) {
  try {
    const { userId, action } = req.body

    let updates = {}

    if (action === 'approve') {
      updates = {
        approved: true,
        status: 'active'
      }
    }

    if (action === 'reject') {
      updates = {
        approved: false,
        status: 'rejected'
      }
    }

    if (action === 'deactivate') {
      updates = {
        status: 'inactive'
      }
    }

    if (action === 'reactivate') {
      updates = {
        status: 'active'
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (error) throw error

    res.status(200).json({
      success: true,
      data
    })
  } catch (err) {
    res.status(500).json({
      error: err.message
    })
  }
}

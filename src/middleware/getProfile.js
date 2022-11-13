
const getProfile = async (req, res, next) => {
    const {Profile} = req.app.get('models')
    if (req.get('profile_id') === 'admin') {
        next()
        return
    }
    const profile = await Profile.findOne({where: {id: req.get('profile_id') || 0}})
    if(!profile) return res.status(401).end()
    req.profile = profile
    next()
}
module.exports = {getProfile}
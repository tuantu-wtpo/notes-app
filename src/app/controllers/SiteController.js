const { getBg } = require("../../util/helper");

class SiteController {
  // GET /home
  home(req, res, next) {
    res.render("partials/home");
  }

  // GET /background
  async getBackground(req, res, next) {
    try {
      const imgArr = await getBg();
      return res.json({ imgArr });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new SiteController();

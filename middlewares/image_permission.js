var Imagen = require("../models/imagenes");

module.exports = function (image, req, res) {
  // True = Si tienes permisos
  // Falso = Si no tienes permisos
  if (req.method === "GET" && req.path.indexOf("edit") < 0) {
    // Ver la imagen
    return true;
  }

  if (typeof image.creator == "undefined") return false;

  if (image.creator._id.toString() == res.locals.user._id) {
    // Esta imagen la subi yo
    return true;
  }

  return false;
};

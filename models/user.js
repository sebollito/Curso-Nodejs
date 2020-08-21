var mongoose = require("mongoose");
mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
var Schema = mongoose.Schema;

// crear conexion a mongoose
mongoose.connect("mongodb://localhost/fotos");

var posibles_valores = ["M", "F"];
var email_match = [
  /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  "Coloca un email válido",
];
var password_validation = {
  validator: function (p) {
    return this.password_confirmation == p;
  },
  message: "Las contraseñas no son iguales",
};

// Crear objeto entendible por mongoose
var user_schema = new Schema({
  name: String,
  last_name: String,
  username: {
    type: String,
    required: true,
    maxlength: [50, "Username muy grande"],
  },
  password: {
    type: String,
    minlength: [8, "El password es muy corto"],
    validate: password_validation,
  },
  age: {
    type: Number,
    min: [5, "la edad no puede ser menor que 5"],
    max: [100, "la edad no puede ser mayor que 100"],
  },
  email: {
    type: String,
    required: "El correo es obligatorio",
    match: email_match,
  },
  date_of_birth: Date,
  sex: {
    type: String,
    enum: { values: posibles_valores, message: "Opción no válida" },
  },
});

// Get establece la forma como se accede un atributo.
// Set establece la logica en la cual se asigna un valor al atributo.
// Atributo virtual es propio del objeto y no se almacena en la base de datos.
user_schema
  .virtual("password_confirmation")
  .get(function () {
    return this.p_c;
  })
  .set(function (password) {
    this.p_c = password;
  });

user_schema
  .virtual("full_name")
  .get(function () {
    return this.name + this.last_name;
  })
  .set(function (full_name) {
    var words = full_name.split(" ");
    this.name = words[0];
    this.last_name = words[1];
  });

// Modelos son instancias en mongoose que nos permiten
// llamar obejtos que realizan acciones en la base de datos.

// Colleciones serian tablas y los documentos serian las filas.
// Crea una coleccion llamada Users.
// Crea modelo que se conecta con la base de datos.
// Toda comunicacion con la base de datos se hace a traves de modelos.
var User = mongoose.model("User", user_schema);

module.exports.User = User;

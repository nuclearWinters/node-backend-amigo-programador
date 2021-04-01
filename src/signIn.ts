import { Router } from "express";
import { jwt } from "./jwt";
import bcrypt from "bcryptjs";
import { REFRESHSECRET, ACCESSSECRET } from "./config";

const signIn = Router();

signIn.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== "string" || !email)
      throw new Error("El correo no es una cadena valida.");
    if (typeof password !== "string" || !password)
      throw new Error("La contraseña no es una cadena valida.");
    const { usuarios } = req.app.context;
    const user = await usuarios.findOne({ email });
    if (!user) throw new Error("El usuario no existe.");
    const hash = await bcrypt.compare(password, user.password);
    if (!hash) throw new Error("La contraseña no coincide.");
    const refreshToken = await jwt.sign(
      { _id: user._id.toHexString() },
      REFRESHSECRET,
      { expiresIn: "1y" }
    );
    const accessToken = await jwt.sign(
      { _id: user._id.toHexString() },
      ACCESSSECRET,
      { expiresIn: "15m" }
    );
    res.status(200).json({
      refreshToken,
      accessToken,
    });
  } catch (e) {
    switch (e.message) {
      case "El usuario no existe." || "La contraseña no coincide.":
        res.status(401).send(e.message);
      default:
        res.status(400).send(e.message);
    }
  }
});

export { signIn };

import { Router } from "express";
import { jwt } from "./jwt";
import bcrypt from "bcryptjs";
import { REFRESHSECRET, ACCESSSECRET } from "./config";
import { ObjectID } from "mongodb";
import { sgMail } from "./sendGrid";
import { getCacheTopicsAndModules } from "./redisHelper";

const signUp = Router();

signUp.post("/", async (req, res) => {
  try {
    const { email, password, username } = req.body;
    if (typeof email !== "string" || !email)
      throw new Error("El correo no es una cadena valida.");
    if (typeof password !== "string" || !password)
      throw new Error("La contraseña no es una cadena valida.");
    if (typeof username !== "string" || !username)
      throw new Error("El usuario no es una cadena valida.");
    const { usuarios } = req.app.context;
    const user = await usuarios.findOne({ email });
    if (user) throw new Error("El email ya esta siendo usado.");
    const hash_password = await bcrypt.hash(password, 12);
    const _id = new ObjectID();
    const { redis, topicsAndModules } = req.app.context;
    const topicsAndModulesCached = await getCacheTopicsAndModules(
      redis,
      topicsAndModules
    );
    await usuarios.insertOne({
      _id,
      username,
      email,
      password: hash_password,
      currentTopic: "Inicio rápido",
      topicsAndModulesData: topicsAndModulesCached.map(({ _id, name }) => ({
        _id,
        name,
        currentModule: 0,
        modulesCompleted: [],
      })),
      arrayLikedComments: [],
    });
    const refreshToken = await jwt.sign(
      { _id: _id.toHexString() },
      REFRESHSECRET,
      { expiresIn: "1y" }
    );
    const accessToken = await jwt.sign(
      { _id: _id.toHexString() },
      ACCESSSECRET,
      { expiresIn: "15m" }
    );
    const msg = {
      to: email,
      from: "soporte@amigoprogramador.com",
      subject: "Sending with Twilio SendGrid is Fun",
      text: "and easy to do anywhere, even with Node.js",
      html: "<strong>and easy to do anywhere, even with Node.js</strong>",
    };
    sgMail.send(msg);
    res.status(200).json({
      refreshToken,
      accessToken,
    });
  } catch (e) {
    switch (e.message) {
      case "El email ya esta siendo usado.":
        res.status(401).send(e.message);
      default:
        res.status(400).send(e.message);
    }
  }
});

export { signUp };

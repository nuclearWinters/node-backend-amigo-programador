import sgMail from "@sendgrid/mail";
import { SEND_GRID } from "./config";
sgMail.setApiKey(SEND_GRID);
export { sgMail };

import { model } from "mongoose";
import TicketTokenSchema from "../schemas/ticket-token.schema";
import { ITicketTokenDocument, ITicketTokenModel } from "../types/ticket-token.type";

export const TicketTokenModel = model<ITicketTokenDocument>("token", TicketTokenSchema) as ITicketTokenModel;

import { Document, Model } from "mongoose";

export interface ITicketToken {
  tenantId: string;
  token: string;
}

export interface ITicketTokenDocument extends ITicketToken, Document {
  deleteToken: (this: ITicketTokenDocument, tenantId: string, token: string ) => Promise<void>;
}
export interface ITicketTokenModel extends Model<ITicketTokenDocument> {
  createToken: (
    this: ITicketTokenModel,
    {
      tenantId,
      token
    }: { tenantId: string; token: string }
  ) => Promise<ITicketTokenDocument>;

  findByToken: (
    this: ITicketTokenModel,
    tenantId: string,
    token: string
  ) => Promise<ITicketTokenDocument[]>;
}

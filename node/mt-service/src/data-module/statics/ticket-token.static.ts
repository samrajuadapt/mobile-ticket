import { Error } from "mongoose";
import { ITicketTokenDocument, ITicketTokenModel } from "../types/ticket-token.type";

// all static methods are defined here

export async function createToken(
  this: ITicketTokenModel,
  {
    tenantId,
    token
  }: {
    tenantId: string;
    token: string;
  }
): Promise<ITicketTokenDocument> {
  const record = await this.findOne({ tenantId, token });
  if (record) {
    throw new Error("Token already exists");
  } else {
    return this.create({ tenantId, token });
  }
}

export async function findByToken(
  this: ITicketTokenModel,
  tenantId: string,
  token: string
): Promise<ITicketTokenDocument[]> {
  return await this.find({ tenantId: tenantId, token: token });
}


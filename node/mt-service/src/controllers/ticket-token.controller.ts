import { Request, Response } from "express";
import { TicketTokenModel } from "../data-module/models/ticket-token.model";
import { generateToken } from "../scripts/ticket-token.helpers";
import TicketTokenService from "../services/ticket-token.service";

export class TicketTokenController {
  private ticketTokenService: TicketTokenService = new TicketTokenService();

  public async getToken(req: Request, res: Response) {
    
    const newTicketToken = new TicketTokenModel();
    newTicketToken.token = generateToken();    
    await this.ticketTokenService
      .createToken(newTicketToken)
      .then(async (ticketToken) => {  
        if (ticketToken.token) {
          return res.json({
            token: ticketToken.token
          });  
        } else {
          return res.status(500);
        }
      })
      .catch((error) => {
        return res.status(500);
      });
  }

  public async deleteOtp(req: Request, res: Response) {
    if (req.body.token) {
      const token = req.body.token;
      await this.ticketTokenService
        .deleteToken(token)
        .then(async (result) => {
          if(result.deletedCount === 0){
            return res.sendStatus(208);
          } else {
            return res.sendStatus(200);
          } 
        })
        .catch((error) => {
          return res.sendStatus(500);
        });
    } else {
      return res.sendStatus(400);
    }
  }
}

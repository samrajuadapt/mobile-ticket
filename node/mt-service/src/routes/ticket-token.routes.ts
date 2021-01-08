import { Application, Request, Response } from "express";
import { TicketTokenController } from "../controllers/ticket-token.controller";

export class TicketTokenRoutes {

    private ticketTokenController: TicketTokenController = new TicketTokenController();

    public route(app: Application) {
            
        app.post('/MTService/token/get', (req: Request, res: Response) => {
            this.ticketTokenController.getToken(req, res);
        });
        app.post('/MTService/token/delete', (req: Request, res: Response) => {
            this.ticketTokenController.deleteOtp(req, res);
        });
    }
}
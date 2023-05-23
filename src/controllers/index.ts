import { Request, Response } from "express";
import * as Services from '../services';

export async function fetchInformation(request: Request, response: Response) {
    try {
        if (!request.query?.uic) {
            response.status(404).send('Подай ЕИК на компанията с параметър в лентата на задачите ?uic=ЕИКТО_НА_ФИРМАТА');
        }
        const result = await Services.fetchAllInformation(request.query.uic as string[]);
        response.status(200).send(result);
    } catch (error) {
        
        response.status(500).send({
            success: false,
            message: 'Internal error'
        })
    }
}
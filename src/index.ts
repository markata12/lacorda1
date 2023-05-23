import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { fetchInformation } from './controllers';

const server = express();

server.listen(3000, () => {
    console.info('Server is listening on: localhost:3000')
})

server.use(bodyParser.json());
server.use(cors({
    origin: true
}))


server.get('/', (_request: express.Request, response: express.Response) => {
    response.send('Здрасти, Марио! Попълни остатъка от url-a с /data?uic=ЕИК_НА_ФИРМАТА и ще се свали цялата информация, която ти е нужна')
})

server.get('/data', fetchInformation);
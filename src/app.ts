import axios from 'axios'
import express, { Application, Request, Response } from 'express' 
import Tradex from './lib/db'
import main from './mainjob'
import path from 'path'
import { Op } from 'sequelize'
import fs from 'fs'

const app: Application = express() 
const port: number =  Number(process.env.PORT) || 3001
app.get('/hello', (req: Request, res: Response) => {
    res.send('Hello toto')
}) 
app.use(express.static(path.resolve('./ui')))

app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.resolve('ui/index.html'));

});
app.get("/totalProfits", async (req: Request, res: Response) => {
  const totalProfits  = await Tradex.sum('profit',{where :{sellAtTime: {
    [Op.gt]: 100
  }}})
  res.send( { totalProfits: totalProfits } )
});

app.get("/investments", async (req: Request, res: Response) => {
  console.log('here in investments query ')
  const investments  = await Tradex.sum('investment',{where :{sellAtTime: {
    [Op.gt]: 100
  }}})

  console.log(investments)
  res.send( { investments: investments } )
 
});

app.get("/totalTrades", async (req: Request, res: Response) => {
  const totalTrades  = await Tradex.count({ where :{sellAtTime: {
    [Op.gt]: 100
  }}})
  res.send( { totalTrades: totalTrades } )
});

app.get("/allClosedTrades", async (req: Request, res: Response) => {
  const allTrades  = await Tradex.findAll({ where :{sellAtTime: {
    [Op.gt]: 100
  }}})
  res.send( { allClosedTrades: allTrades } )
});

app.get("/allOpenTrades", async (req: Request, res: Response) => {
  const allTrades  = await Tradex.findAll({ where :{sellAtTime: null}})
  res.send( { allOpenTrades: allTrades } )
});

app.get("/allTrades", async (req: Request, res: Response) => {
  const allTrades  = await Tradex.findAll({
    order: [
       ['buyAtTime', 'DESC']]
  })
  res.send( { allTrades: allTrades } )
});


app.get("/deleteTrade/:id", async (req: Request, res: Response) => {
  // Delete everyone named "Jane"
await Tradex.destroy({
  where: {
    id: req.params['id']
  }
});
  res.send( { deleted: req.params['id'] } )
}); 

app.listen(port, function () {
  console.log(`App is listening on port ${port} !`)
})

main()

 


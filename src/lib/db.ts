import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export const sequelize :Sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './data/database.sqlite',
    logging: false,         
    pool: {
      max: 50,
      min: 0,
      acquire: 30000,
      idle: 10000
    }          
  });


  class Tradex extends Model<InferAttributes<Tradex>, InferCreationAttributes<Tradex>> { 
  // Model attributes are defined here
  declare id: CreationOptional<number>;
  declare tokenAddress: string;
  declare name: string ; // for nullable fields
  declare symbol: string ; // for nullable fields
  declare pairAddress: string ; // for nullable fields
  declare baseAddress: string ; // for nullable fields
  declare signaledAt: string ; // for nullable fields
  declare baseName: string ; // for nullable fields
  declare signalPrice: number ; // for nullable fields
  declare investment: number ; // for nullable fields
  declare buyAtTime: CreationOptional<Date>;   
  declare buyAtPrice: number ; // for nullable fields
  declare sellAtTime: CreationOptional<Date>;   
  declare sellAtPrice: number ; // for nullable fields
  declare profit: number ; // for nullable fields 
  declare prevQuote: number ; // for nullable fields 
  declare quantity: number ; // for nullable fields 
} ;

Tradex.init({
  // Model attributes are defined here
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  }, 
  tokenAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    
  },  
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  symbol: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pairAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  baseAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  signaledAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  baseName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  signalPrice: {
    type: DataTypes.FLOAT,
    defaultValue:0.0,
    allowNull: false
  },
  investment: {
    type: DataTypes.FLOAT,
    defaultValue:0.0,
    allowNull: false
  },
  buyAtTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  buyAtPrice: {
    type: DataTypes.FLOAT,
    defaultValue:0.0,
    allowNull: true
  },
  sellAtTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sellAtPrice: {
    type: DataTypes.FLOAT,
    defaultValue:0.0,
    allowNull: true
  },
  profit: {
    type: DataTypes.FLOAT,
    defaultValue:0.0,
    allowNull: false
  },
  prevQuote: {
    type: DataTypes.FLOAT,
    defaultValue:0.0,
    allowNull: true
  },
  quantity: {
    type: DataTypes.FLOAT,
    defaultValue:0.0,
    allowNull: false
  },
},  
{
  tableName: 'tradex',
  sequelize  
});
export default Tradex;
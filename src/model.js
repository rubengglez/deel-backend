const Sequelize = require('sequelize');
const { Op } = require("sequelize");

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite3',
});

class Profile extends Sequelize.Model {
  canAccess(contract) {
    if (this.isClient()) {
      return this.id === contract.ClientId
    }
    return this.id === contract.ContractorId
  }

  async retrieveContractsByStatus(statuses) {
    if (this.isClient()) {
      return this.getClient({
        where: {
          clientId: this.id,
          status: {
            [Op.in]: statuses
          }
        }
      })
    }
    return this.getContractor({
        where: {
          contractorId: this.id,
          status: {
            [Op.in]: statuses
          }
        }
      })
  }

  isClient() {
    return this.type === 'client'
  }

  async pay(job, t) {
    if (!this.isClient()) {
      return Promise.reject('only a client can be paid')
    }

    if (this.balance < job.price) {
     return Promise.reject('job can not be paid due to not enough money in balance')
    }

    this.balance -= job.price

    await this.save({ transaction: t })
    await job.pay(t)
  }
}

Profile.init(
  {
    firstName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    profession: {
      type: Sequelize.STRING,
      allowNull: false
    },
    balance:{
      type:Sequelize.DECIMAL(12,2)
    },
    type: {
      type: Sequelize.ENUM('client', 'contractor')
    }
  },
  {
    sequelize,
    modelName: 'Profile'
  }
);

class Contract extends Sequelize.Model {}
Contract.init(
  {
    terms: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    status:{
      type: Sequelize.ENUM('new','in_progress','terminated')
    }
  },
  {
    sequelize,
    modelName: 'Contract'
  }
);

class Job extends Sequelize.Model {
  async pay(t) {
    this.paid = true;
    this.paymentDate = new Date()
    return this.save({transaction: t})
  }
}

Job.init(
  {
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    price:{
      type: Sequelize.DECIMAL(12,2),
      allowNull: false
    },
    paid: {
      type: Sequelize.BOOLEAN,
      default:false
    },
    paymentDate:{
      type: Sequelize.DATE
    }
  },
  {
    sequelize,
    modelName: 'Job'
  }
);

Profile.hasMany(Contract, {as :'Contractor',foreignKey:'ContractorId'})
Contract.belongsTo(Profile, {as: 'Contractor'})
Profile.hasMany(Contract, {as : 'Client', foreignKey:'ClientId'})
Contract.belongsTo(Profile, {as: 'Client'})
Contract.hasMany(Job)
Job.belongsTo(Contract)

module.exports = {
  sequelize,
  Profile,
  Contract,
  Job
};

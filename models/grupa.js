const Sequelize = require("sequelize");

module.exports = function(sequelize,DataTypes){
    const Tip = sequelize.define("grupa",{
        naziv:Sequelize.STRING
    });
    return Tip;
};
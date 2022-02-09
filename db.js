const Sequelize = require("sequelize");
const sequelize = new Sequelize("raspored2021", "root", "root", { host: '127.0.0.1', dialect: 'mysql', logging: false });
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// import modela
db.predmet = require(__dirname + '/models/predmet.js')(sequelize, Sequelize);
db.grupa = require(__dirname + '/models/grupa.js')(sequelize, Sequelize);
db.aktivnost = require(__dirname + '/models/aktivnost.js')(sequelize, Sequelize);
db.dan = require(__dirname + '/models/dan.js')(sequelize, Sequelize);
db.tip = require(__dirname + '/models/tip.js')(sequelize, Sequelize);
db.student = require(__dirname + '/models/student.js')(sequelize, Sequelize);

// relacije
// Veza 1-n, pr. jedan predmet posjeduje vise grupa
db.predmet.hasMany(db.grupa, { foreignKey: { allowNull: false } });
db.grupa.belongsTo(db.predmet);

db.predmet.hasMany(db.aktivnost, { foreignKey: { allowNull: false } });
db.aktivnost.belongsTo(db.predmet);

db.dan.hasMany(db.aktivnost, { foreignKey: { allowNull: false } });
db.aktivnost.belongsTo(db.dan);

db.tip.hasMany(db.aktivnost, { foreignKey: { allowNull: false } });
db.aktivnost.belongsTo(db.tip);

// Veza 0-n
db.grupa.hasMany(db.aktivnost);
db.aktivnost.belongsTo(db.grupa);

// Veza n-m student moze imati vise grupa, a grupa vise studenata
db.studentGrupa = db.grupa.belongsToMany(db.student, { as: 'studenti', through: 'student_grupa', foreignKey: 'grupaId' });
db.student.belongsToMany(db.grupa, { as: 'grupe', through: 'student_grupa', foreignKey: 'studentId' });

db.sequelize.sync({ force: false }).then(function () {
});

module.exports = db;

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
let fs = require('fs');
const vratiTestove = require('./vratiTestove');


chai.use(chaiHttp);

var testniPodaciString = fs.readFileSync('test/testniPodaci.txt', 'utf8', function (err, data) { });
var nizTestovi = vratiTestove(testniPodaciString);


describe("Server testovi", () => {
    for (var i = 0; i < nizTestovi.length; i++) {
        const test = nizTestovi[i];
        if (test.operacija == "GET") {
            it(test.operacija + test.ruta, (done) => {
                chai.request(server)
                    .get(test.ruta)
                    .end(function (err, res) {
                        res.should.have.status(200);
                        res.body.should.be.a('array');
                        res.should.be.json;
                        res.body.should.be.eql(JSON.parse(test.izlaz));
                        done();
                    });
            });
        } else if (test.operacija == "POST") {
            it(test.operacija + test.ruta, (done) => {
                chai.request(server)
                    .post(test.ruta)
                    .send(JSON.parse(test.ulaz))
                    .end(function (err, res) {
                        res.should.have.status(200);
                        res.body.should.be.eql(JSON.parse(test.izlaz));
                        done();
                    });
                    
            });
        } else if (test.operacija == "DELETE") {
            it(test.operacija + test.ruta, (done) => {
                chai.request(server)
                    .delete(test.ruta)
                    .end(function (err, res) {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('message');
                        res.body.should.be.eql(JSON.parse(test.izlaz));
                        done();
                    });
            });
        }
    }
});
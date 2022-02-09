const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
var mysql = require('mysql');
const db = require('./db.js')
const { where } = require('sequelize');
const { grupa, tip, studentGrupa, aktivnost } = require('./db.js');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

//Spirala3
app.get('/v1/predmeti', function (req, res) {
    fs.readFile('\predmeti.txt', function read(err, data) {
        if (err) {
            throw err;
        }

        var predmeti = [];
        const naziviPredmeta = data.toString().split(/\r?\n/);
        for (let i = 0; i < naziviPredmeta.length; i++) {
            if (naziviPredmeta[i] != null && naziviPredmeta[i] != "") {
                let predmet = {
                    naziv: naziviPredmeta[i]
                };
                predmeti.push(predmet);
            }
        }

        res.json(predmeti);
    })
});
app.get('/v1/aktivnosti', function (req, res) {
    fs.readFile('\aktivnosti.txt', function read(err, data) {
        if (err) {
            throw err;
        }

        var aktivnosti = [];
        const redoviDatoteke = data.toString().split(/\r?\n/);

        for (let i = 0; i < redoviDatoteke.length; i++) {
            const stavkeAkt = redoviDatoteke[i].split(",");
            if (stavkeAkt[0] != null && stavkeAkt[0] != "") {

                let aktivnost = {
                    naziv: stavkeAkt[0],
                    tip: stavkeAkt[1],
                    pocetak: stavkeAkt[2],
                    kraj: stavkeAkt[3],
                    dan: stavkeAkt[4]
                };
                aktivnosti.push(aktivnost);
            }
        }

        res.json(aktivnosti);
    })
});

app.get('/v1/predmet/:naziv/aktivnost', function (req, res) {
    fs.readFile('\aktivnosti.txt', function read(err, data) {
        if (err) {
            throw err;
        }

        const naziv = req.params["naziv"];
        var aktivnosti = [];
        const redoviDatoteke = data.toString().split(/\r?\n/);

        for (let i = 0; i < redoviDatoteke.length; i++) {
            const stavkeAkt = redoviDatoteke[i].split(",");
            if (stavkeAkt[0] != null && stavkeAkt[0] != "" && stavkeAkt[0].toLocaleLowerCase() == naziv.toLocaleLowerCase()) {

                let aktivnost = {
                    naziv: stavkeAkt[0],
                    tip: stavkeAkt[1],
                    pocetak: stavkeAkt[2],
                    kraj: stavkeAkt[3],
                    dan: stavkeAkt[4]
                };
                aktivnosti.push(aktivnost);
            }
        }

        res.json(aktivnosti);
    })
});

function upisiPredmet(naziv, res, prviRed) {
    var novaLinija;
    if (prviRed) {
        novaLinija = naziv;
    } else {
        novaLinija = "\n" + naziv;
    }
    fs.appendFile("\predmeti.txt", novaLinija, function (err) {
        if (err) throw err;

        res.json({ message: "Uspješno dodan predmet!" });
    });
}

app.post('/v1/predmet', function (req, res) {
    let tijelo = req.body;
    var noviPredmet = tijelo["naziv"];
    var postojiPredmet = false;

    if (!fs.existsSync('\predmeti.txt') || fs.readFileSync('\predmeti.txt', 'utf8', function (err, data) { }).split(/\r?\n/)[0] == "") {
        upisiPredmet(noviPredmet, res, true);
    } else {
        fs.readFile('\predmeti.txt', "utf-8", function read(err, data) {
            if (err) {
                throw err;
            }

            const naziviPredmeta = data.toString().split(/\r?\n/);
            for (let i = 0; i < naziviPredmeta.length; i++) {
                if (naziviPredmeta[i] != null && naziviPredmeta[i] != "" && naziviPredmeta[i].toLocaleLowerCase() == noviPredmet.toLocaleLowerCase()) {
                    res.json({ message: "Naziv predmeta postoji!" });
                    postojiPredmet = true;
                    break;
                }
            }

            if (!postojiPredmet) {
                upisiPredmet(noviPredmet, res, false);
            }
        })
    }
});


function upisiAktivnost(tijelo, res, prviRed) {
    var novaLinija;
    if (prviRed) {
        novaLinija = tijelo["naziv"] + "," + tijelo["tip"] + "," + tijelo["pocetak"] + "," + tijelo["kraj"] + "," + tijelo["dan"];
    } else {
        novaLinija = "\n" + tijelo["naziv"] + "," + tijelo["tip"] + "," + tijelo["pocetak"] + "," + tijelo["kraj"] + "," + tijelo["dan"];
    }
    fs.appendFile("\aktivnosti.txt", novaLinija, function (err) {
        if (err) throw err;

        res.json({ message: "Uspješno dodana aktivnost!" });
    });
}

function zadaniPotrebniParam(tijelo) {
    if (tijelo["naziv"] != null && tijelo["naziv"] != "" && tijelo["pocetak"] != null && tijelo["pocetak"] != ""
        && tijelo["kraj"] != null && tijelo["kraj"] != "" && tijelo["dan"] != null && tijelo["dan"] != "") {
        return true;
    }
    return false;
}

app.post('/v1/aktivnost', function (req, res) {
    var tijelo = req.body;
    var pocetak = parseFloat(tijelo["pocetak"]);
    var kraj = parseFloat(tijelo["kraj"]);

    if (pocetak >= kraj || pocetak < 8 || pocetak > 20 || kraj < 8 || kraj > 20 ||
        (!Number.isInteger(pocetak) && (pocetak - Math.trunc(pocetak) != 0.5)) ||
        (!Number.isInteger(kraj) && (kraj - Math.trunc(kraj) != 0.5)) ||
        !zadaniPotrebniParam(tijelo)) {
        res.json({ message: "Aktivnost nije validna!" });
    } else if (!fs.existsSync('\aktivnosti.txt') || fs.readFileSync('\aktivnosti.txt', 'utf8', function (err, data) { }).split(/\r?\n/)[0] == "") {
        upisiAktivnost(tijelo, res, true);
    } else {
        fs.readFile('\aktivnosti.txt', "utf-8", function read(err, data) {
            if (err) {
                throw err;
            }

            const redoviDatoteke = data.toString().split(/\r?\n/);
            var aktivnostValidna = true;

            for (let i = 0; i < redoviDatoteke.length; i++) {
                const stavkeAkt = redoviDatoteke[i].split(",");
                const start = stavkeAkt[2], end = stavkeAkt[3], day = stavkeAkt[4].toLowerCase(), dan = tijelo["dan"].toLowerCase();
                if (day == dan && ((start <= pocetak && pocetak < end) || (start < kraj && kraj <= end) || (pocetak < start && kraj > start))) {
                    res.json({ message: "Aktivnost nije validna!" });
                    aktivnostValidna = false;
                }
            }

            if (aktivnostValidna) {
                upisiAktivnost(tijelo, res, false);
            }

        })

    }

});

app.delete('/v1/aktivnost/:naziv', function (req, res) {
    fs.readFile('\aktivnosti.txt', function read(err, data) {
        if (err) {
            throw err;
        }

        const naziv = req.params["naziv"];
        var desiloSeBrisanje = false;
        var redoviDatoteke = data.toString().split(/\r?\n/);

        for (let i = 0; i < redoviDatoteke.length; i++) {
            var stavkeAkt = redoviDatoteke[i].split(",");
            if (stavkeAkt[0] != null && stavkeAkt[0] != "" && stavkeAkt[0].toLocaleLowerCase() == naziv.toLocaleLowerCase()) {
                redoviDatoteke.splice(i, 1);
                i--;
                desiloSeBrisanje = true
            }
        }

        if (desiloSeBrisanje) {
            let sadrzaj = redoviDatoteke.join("\n");
            fs.writeFile('\aktivnosti.txt', sadrzaj, 'utf8', function (err) {
                if (err) throw err;
                res.json({ message: "Uspješno obrisana aktivnost!" });
            });
        } else {
            res.json({ message: "Greška - aktivnost nije obrisana!" });
        }

    })
});

app.delete('/v1/predmet/:naziv', function (req, res) {
    fs.readFile('\predmeti.txt', function read(err, data) {
        if (err) {
            throw err;
        }

        const naziv = req.params["naziv"];
        var desiloSeBrisanje = false;
        var redoviDatoteke = data.toString().split(/\r?\n/);

        for (let i = 0; i < redoviDatoteke.length; i++) {
            if (redoviDatoteke[i].toLocaleLowerCase() == naziv.toLocaleLowerCase()) {
                redoviDatoteke.splice(i, 1);
                let sadrzaj = redoviDatoteke.join("\n");
                fs.writeFile('\predmeti.txt', sadrzaj, 'utf8', function (err) {
                    if (err) throw err;
                    res.json({ message: "Uspješno obrisan predmet!" });
                });
                desiloSeBrisanje = true
            }
        }

        if (!desiloSeBrisanje) {
            res.json({ message: "Greška - predmet nije obrisan!" });
        }

    })
});

app.delete('/v1/all', function (req, res) {

    if (fs.existsSync('\aktivnosti.txt') && fs.existsSync('\predmeti.txt')) {
        fs.writeFile('\aktivnosti.txt', "", 'utf8', function (err) {
            if (err) {
                res.json({ message: "Greška - sadržaj datoteka nije moguće obrisati!" });
            } else {
                fs.writeFile('\predmeti.txt', "", 'utf8', function (err) {
                    if (err) {
                        res.json({ message: "Greška - sadržaj datoteka nije moguće obrisati!" });
                    }
                    res.json({ message: "Uspješno obrisan sadržaj datoteka!" });
                });
            }
        });

    } else {
        res.json({ message: "Greška - sadržaj datoteka nije moguće obrisati!" });
    }

});







//Spirala4 

//GET All

app.get('/v2/studenti', function (req, res) {
    db.student.findAll({ attributes: ['ime', 'index'] }).then(function (resSet) {
        res.json(resSet);
    })
});

app.get('/v2/grupe', function (req, res) {
    db.grupa.findAll().then(function (grupe) {
        res.json(grupe);
    })

});

app.get('/v2/grupeZaStudenta/:id', function (req, res) {
    const studentId = req.params["id"];

    db.grupa.findAll().then(function (grupe) {
        res.json(grupe);
    })

});

app.get('/v2/dani', function (req, res) {
    db.dan.findAll({ attributes: ['naziv'] }).then(function (dan) {
        res.json(dan);
    })
});

app.get('/v2/tipovi', function (req, res) {
    db.tip.findAll({ attributes: ['naziv'] }).then(function (tip) {
        res.json(tip);
    })
});

app.get('/v2/predmeti', function (req, res) {
    db.predmet.findAll({ attributes: ['naziv'] }).then(function (resSet) {
        res.json(resSet);
    })
});

app.get('/v2/aktivnosti', function (req, res) {
    db.aktivnost.findAll({ attributes: ['naziv', 'pocetak', 'kraj', 'predmetId', 'danId', 'tipId', 'grupaId'] }).then(function (resSet) {
        res.json(resSet);
    })
});




//GET sa id, One
app.get('/v2/predmet/:id', function (req, res) {
    const id = req.params["id"];
    db.predmet.findOne({ where: { id: id } }).then(function (p) {
        if (p != null) {
            let predmet = {
                naziv: p.naziv
            }
            res.json(predmet);
        }
    })
});

app.get('/v2/grupa/:id', function (req, res) {
    const id = req.params["id"];
    db.grupa.findOne({ where: { id: id } }).then(function (g) {
        if (g != null) {
            let grupa = {
                naziv: g.naziv,
                predmetId: g.predmetId
            }
            res.json(grupa);
        }
    })
});

app.get('/v2/dan/:id', function (req, res) {
    const id = req.params["id"];
    db.dan.findOne({ where: { id: id } }).then(function (d) {
        if (d != null) {
            let dan = {
                naziv: d.naziv
            }
            res.json(dan);
        }
    })
});

app.get('/v2/tip/:id', function (req, res) {
    const id = req.params["id"];
    db.tip.findOne({ where: { id: id } }).then(function (t) {
        if (t != null) {
            let tip = {
                naziv: t.naziv
            }
            res.json(tip);
        }
    })
});

//GET sa naziv, One
app.get('/v2/predmetNaziv/:naziv', function (req, res) {
    const naziv = req.params["naziv"];
    db.predmet.findOne({ where: { naziv: naziv } }).then(function (p) {
        if (p != null) {
            res.json(p);
        }
    })
});

app.get('/v2/danNaziv/:naziv', function (req, res) {
    const naziv = req.params["naziv"];
    db.dan.findOne({ where: { naziv: naziv } }).then(function (d) {
        if (d != null) {
            res.json(d);
        }
    })
});

app.get('/v2/tipNaziv/:naziv', function (req, res) {
    const naziv = req.params["naziv"];
    db.tip.findOne({ where: { naziv: naziv } }).then(function (t) {
        if (t != null) {
            res.json(t);
        }
    })
});



//POST

function nijeNull(naziv) {
    if (naziv == "" || naziv == null) return false;

    return true;
}
app.post('/v2/student', function (req, res) {
    let tijelo = req.body;
    var ime = tijelo["ime"];
    var index = tijelo["index"];

    if (!nijeNull(ime)) {
        res.json({ message: "Nije validno ime studenta!" });
    } else if (!nijeNull(index)) {
        res.json({ message: "Nije validan index studenta!" });
    } else {
        db.student.findOne({ where: { index: index } }).then(function (result) {
            if (result == null) {

                var uspjeh = function (x) {
                    res.json({ message: "Uspješno dodan student!" });
                }
                var neuspjeh = function (poruka) {
                    console.log("Došlo je do greške: " + poruka);
                }
                db.student.create({ ime: ime, index: index }).then(function (k) {
                    return new Promise(function (resolve, reject) { resolve(k); });
                }).then(uspjeh, neuspjeh);
            } else {
                res.json({ message: "Postoji student sa istim indeksnom u bazi!" });
            }
        })
    }
});
app.post('/v2/grupa', function (req, res) {
    let tijelo = req.body;
    var naziv = tijelo["naziv"];
    var predmetId = tijelo["predmetId"];

    if (!nijeNull(naziv)) {
        res.json({ message: "Nije validan naziv grupe!" });
    } else {
        db.predmet.findOne({ where: { id: predmetId } }).then(function (predmet) {
            if (predmet == null) {
                res.json({ message: "Zadani id ne odgovara niti jednom predmetu u bazi!" });
            } else {
                db.grupa.findOne({ where: { naziv: naziv, predmetId: predmetId } }).then(function (grupa) {
                    if (grupa == null) {

                        var uspjeh = function (x) {
                            res.json({ message: "Uspješno dodana grupa!" });
                        }
                        var neuspjeh = function (poruka) {
                            console.log("Došlo je do greške: " + poruka);
                        }
                        db.grupa.create({ naziv: naziv, predmetId: predmetId }).then(function (k) {
                            return new Promise(function (resolve, reject) { resolve(k); });
                        }).then(uspjeh, neuspjeh);
                    } else {
                        res.json({ message: "Ova grupa za zadani predmet, vec postoji u bazi!" });
                    }
                })

            }
        })
    }
});
app.post('/v2/studentGrupa', function (req, res) {
    let tijelo = req.body;
    var studentId = tijelo["studentId"];
    var grupaId = tijelo["grupaId"];

    db.student.findOne({ where: { id: studentId } }).then(function (student) {
        if (student == null) {
            res.json({ message: "Student sa zadanim id-om ne postoji u bazi!" });
        } else {
            db.grupa.findOne({ where: { id: grupaId } }).then(function (grupa) {
                if (grupa == null) {
                    res.json({ message: "Grupa sa zadanim id-om ne postoji u bazi!" });
                } else {
                    function upisanStudent() {
                        return new Promise(function (resolve, reject) {
                            grupa.getStudenti().then(function (resSet) {
                                var i;
                                for (i = 0; i < resSet.length; i++) {
                                    if (parseInt(resSet[i].id) === parseInt(studentId)) {
                                        resolve();
                                        break;
                                    }
                                }
                                if (i == resSet.length) reject();
                            })
                        });
                    }

                    var uspjeh = function () {
                        res.json({ message: "Uspješno upisan student u grupu!" });
                    }
                    var neuspjeh = function (poruka) {
                        console.log("Došlo je do greške: " + poruka);
                    }

                    var postojiUBazi = function () {
                        res.json({ message: "Student je vec upisanu u ovu grupu, u bazi!" });
                    }

                    upisanStudent().then(postojiUBazi,
                        function () {
                            grupa.getStudenti().then(function (resSet) {
                                var studentiGrupe = resSet;
                                studentiGrupe.push(student);
                                grupa.setStudenti(studentiGrupe).then(function (k) {
                                    return new Promise(function (resolve, reject) { resolve(k); });
                                }).then(uspjeh, neuspjeh);
                            })
                        });
                }
            })
        }
    })

});
app.post('/v2/tip', function (req, res) {
    let tijelo = req.body;
    var naziv = tijelo["naziv"];

    if (!nijeNull(naziv)) {
        res.json({ message: "Nije validan naziv tipa!" });
    } else {
        db.tip.findOne({ where: { naziv: naziv } }).then(function (result) {
            if (result == null) {

                var uspjeh = function (x) {
                    res.json({ message: "Uspješno dodan tip!" });
                }
                var neuspjeh = function (poruka) {
                    console.log("Došlo je do greške: " + poruka);
                }
                db.tip.create({ naziv: naziv }).then(function (k) {
                    return new Promise(function (resolve, reject) { resolve(k); });
                }).then(uspjeh, neuspjeh);
            } else {
                res.json({ message: "Tip postoji u bazi!" });
            }
        })
    }
});
app.post('/v2/dan', function (req, res) {
    let tijelo = req.body;
    var naziv = tijelo["naziv"];

    if (!nijeNull(naziv)) {
        res.json({ message: "Nije validan naziv dana!" });
    } else {
        db.dan.findOne({ where: { naziv: naziv } }).then(function (result) {
            if (result == null) {

                var uspjeh = function (x) {
                    res.json({ message: "Uspješno dodan dan!" });
                }
                var neuspjeh = function (poruka) {
                    console.log("Došlo je do greške: " + poruka);
                }
                db.dan.create({ naziv: naziv }).then(function (k) {
                    return new Promise(function (resolve, reject) { resolve(k); });
                }).then(uspjeh, neuspjeh);
            } else {
                res.json({ message: "Dan postoji u bazi!" });
            }
        })
    }
});
app.post('/v2/predmet', function (req, res) {
    let tijelo = req.body;
    var naziv = tijelo["naziv"];

    if (!nijeNull(naziv)) {
        res.json({ message: "Nije validan naziv predmeta!" });
    } else {
        db.predmet.findOne({ where: { naziv: naziv } }).then(function (result) {
            if (result == null) {

                var uspjeh = function (x) {
                    res.json({ message: "Uspješno dodan predmet!" });
                }
                var neuspjeh = function (poruka) {
                    console.log("Došlo je do greške: " + poruka);
                }
                db.predmet.create({ naziv: naziv }).then(function (k) {
                    return new Promise(function (resolve, reject) { resolve(k); });
                }).then(uspjeh, neuspjeh);
            } else {
                res.json({ message: "Predmet postoji u bazi!" });
            }
        })
    }
});

function upisiAktivnostDB(naziv, pocetak, kraj, predmetId, danId, tipId, grupaId, res) {

    db.aktivnost.findAll({ where: { danId: danId } }).then(function (aktivnosti) {
        var i;
        for (i = 0; i < aktivnosti.length; i++) {
            const start = aktivnosti[i].pocetak, end = aktivnosti[i].kraj;
            if ((start <= pocetak && pocetak < end) || (start < kraj && kraj <= end) || (pocetak < start && kraj > start)) {
                res.json({ message: "Aktivnost nije validna!" });
                return;
            }
        }
        if (i == aktivnosti.length) {
            var uspjeh = function (x) {
                res.json({ message: "Uspješno dodana aktivnost!" });
            }
            var neuspjeh = function (poruka) {
                console.log("Došlo je do greške: " + poruka);
            }
            db.aktivnost.create({ naziv: naziv, pocetak: pocetak, kraj: kraj, predmetId: predmetId, danId: danId, tipId: tipId, grupaId: grupaId }).then(function (a) {
                return new Promise(function (resolve, reject) { resolve(a); });
            }).then(uspjeh, neuspjeh);
        }
    })
}
function validnaAktivnost(naziv, tijelo) {
    var naziv = tijelo["naziv"];
    var pocetak = parseFloat(tijelo["pocetak"]);
    var kraj = parseFloat(tijelo["kraj"]);

    if (pocetak >= kraj || pocetak < 8 || pocetak > 20 || kraj < 8 || kraj > 20 ||
        (!Number.isInteger(pocetak) && (pocetak - Math.trunc(pocetak) != 0.5)) ||
        (!Number.isInteger(kraj) && (kraj - Math.trunc(kraj) != 0.5)) ||
        !nijeNull(naziv) || !nijeNull(tijelo["pocetak"]) || !nijeNull(tijelo["kraj"]) ||
        !nijeNull(tijelo["predmetId"]) || !nijeNull(tijelo["danId"]) || !nijeNull(tijelo["tipId"])) return false;

    return true;
}
app.post('/v2/aktivnost', function (req, res) {
    let tijelo = req.body;
    var naziv = tijelo["naziv"];
    var pocetak = parseFloat(tijelo["pocetak"]);
    var kraj = parseFloat(tijelo["kraj"]);
    var predmetId = tijelo["predmetId"];
    var danId = tijelo["danId"];
    var tipId = tijelo["tipId"];
    var grupaId = tijelo["grupaId"];
    if (grupaId == "") grupaId = null;

    if (!validnaAktivnost(naziv, tijelo)) {
        res.json({ message: "Aktivnost nije validna!" });
    } else {
        db.predmet.findOne({ where: { id: predmetId } }).then(function (predmet) {
            if (predmet == null) {
                res.json({ message: "Zadani id ne odgovara niti jednom predmetu u bazi!" });
            } else {
                db.dan.findOne({ where: { id: danId } }).then(function (dan) {
                    if (dan == null) {
                        res.json({ message: "Zadani id ne odgovara niti jednom danu u bazi!" });
                    } else {
                        db.tip.findOne({ where: { id: tipId } }).then(function (tip) {
                            if (tip == null) {
                                res.json({ message: "Zadani id ne odgovara niti jednom tipu u bazi!" });
                            } else {

                                if (grupaId != null) {
                                    db.grupa.findOne({ where: { id: grupaId } }).then(function (grupa) {
                                        if (grupa == null) {
                                            res.json({ message: "Zadani id ne odgovara niti jednoj grupi u bazi!" });
                                        } else {
                                            upisiAktivnostDB(naziv, pocetak, kraj, predmetId, danId, tipId, grupaId, res);
                                        }
                                    })
                                } else {
                                    upisiAktivnostDB(naziv, pocetak, kraj, predmetId, danId, tipId, null, res);
                                }
                            }
                        })
                    }
                })

            }
        })
    }
});



//PUT
app.put('/v2/student/:id', function (req, res) {
    let tijelo = req.body;
    var ime = tijelo["ime"];
    var index = tijelo["index"];
    const id = req.params["id"];

    if (!nijeNull(ime)) {
        res.json({ message: "Nije validno ime studenta kojim želite ažurirati!" });
    } else if (!nijeNull(index)) {
        res.json({ message: "Nije validan index studenta kojim želite ažurirati!" });
    } else {
        db.student.findOne({ where: { id: id } }).then(function (s) {
            if (s != null) {

                var uspjeh = function (x) {
                    res.json({ message: "Uspješno ažuriran student!" });
                }
                var neuspjeh = function (poruka) {
                    console.log("Došlo je do greške: " + poruka);
                }
                s.update({ ime: ime, index: index }).then(function (k) {
                    return new Promise(function (resolve, reject) { resolve(k); });
                }).then(uspjeh, neuspjeh);
            } else {
                res.json({ message: "Nije validan id studenta kojeg želite ažurirati!" });
            }
        })
    }
});
app.put('/v2/grupa/:id', function (req, res) {
    let tijelo = req.body;
    const id = req.params["id"];
    var naziv = tijelo["naziv"];
    var predmetId = tijelo["predmetId"];

    if (!nijeNull(naziv)) {
        res.json({ message: "Nije validan naziv grupe kojim želite ažurirati!" });
    } else {
        db.predmet.findOne({ where: { id: predmetId } }).then(function (predmet) {
            if (predmet == null) {
                res.json({ message: "Id predmeta kojim ažurirate, ne odgovara niti jednom predmetu u bazi!" });
            } else {
                db.grupa.findOne({ where: { id: id } }).then(function (g) {
                    if (g != null) {

                        var uspjeh = function (x) {
                            res.json({ message: "Uspješno ažurirana grupa!" });
                        }
                        var neuspjeh = function (poruka) {
                            console.log("Došlo je do greške: " + poruka);
                        }
                        g.update({ naziv: naziv, predmetId: predmetId }).then(function (k) {
                            return new Promise(function (resolve, reject) { resolve(k); });
                        }).then(uspjeh, neuspjeh);
                    } else {
                        res.json({ message: "Nije validan id grupe koju želite ažurirati!" });
                    }
                })

            }
        })
    }
});
app.put('/v2/tip/:id', function (req, res) {
    let tijelo = req.body;
    var naziv = tijelo["naziv"];
    const id = req.params["id"];

    if (!nijeNull(naziv)) {
        res.json({ message: "Nije validan naziv tip kojim želite izvršiti ažuriranje!" });
    } else {
        db.dan.findOne({ where: { id: id } }).then(function (t) {
            if (t != null) {
                var uspjeh = function () {
                    res.json({ message: "Uspješno ažuriran tip!" });
                }
                var neuspjeh = function (poruka) {
                    console.log("Došlo je do greške: " + poruka);
                }
                t.update({ naziv: naziv }).then(function (k) {
                    return new Promise(function (resolve, reject) { resolve(k); });
                }).then(uspjeh, neuspjeh);
            } else {
                res.json({ message: "Nije validan id tipa kojeg želite ažurirati!" });
            }
        })

    }
});
app.put('/v2/dan/:id', function (req, res) {
    let tijelo = req.body;
    var naziv = tijelo["naziv"];
    const id = req.params["id"];

    if (!nijeNull(naziv)) {
        res.json({ message: "Nije validan naziv dana kojim želite izvršiti ažuriranje!" });
    } else {
        db.dan.findOne({ where: { id: id } }).then(function (d) {
            if (d != null) {
                var uspjeh = function (x) {
                    res.json({ message: "Uspješno ažuriran dan!" });
                }
                var neuspjeh = function (poruka) {
                    console.log("Došlo je do greške: " + poruka);
                }
                d.update({ naziv: naziv }).then(function (k) {
                    return new Promise(function (resolve, reject) { resolve(k); });
                }).then(uspjeh, neuspjeh);
            } else {
                res.json({ message: "Nije validan id dana kojeg želite ažurirati!" });
            }
        })

    }
});
app.put('/v2/predmet/:id', function (req, res) {
    let tijelo = req.body;
    var naziv = tijelo["naziv"];
    const id = req.params["id"];

    if (!nijeNull(naziv)) {
        res.json({ message: "Nije validan naziv predmeta kojim želite izvršiti ažuriranje!" });
    } else {
        db.predmet.findOne({ where: { id: id } }).then(function (p) {
            if (p != null) {
                var uspjeh = function (x) {
                    res.json({ message: "Uspješno ažuriran predmet!" });
                }
                var neuspjeh = function (poruka) {
                    console.log("Došlo je do greške: " + poruka);
                }
                p.update({ naziv: naziv }).then(function (k) {
                    return new Promise(function (resolve, reject) { resolve(k); });
                }).then(uspjeh, neuspjeh);
            } else {
                res.json({ message: "Nije validan id predmeta kojeg želite ažurirati!" });
            }
        })

    }
});



//DELETE

app.delete('/v2/predmet', function (req, res) {
    let tijelo = req.body;
    var id = tijelo["id"];

    db.grupa.findAll({ where: { predmetId: id } }).then(function (grupe) {
        if (grupe != null) {
            for (var i = 0; i < grupe.length; i++) {
                var uspjeh = function (x) {
                    console.log("Uspješno obrisana grupa!");
                }
                var neuspjeh = function (poruka) {
                    console.log("Došlo je do greške: " + poruka);
                }
                db.grupa.destroy({ where: { id: grupe[i].id } }).then(function (k) {
                    return new Promise(function (resolve, reject) { resolve(k); });
                }).then(uspjeh, neuspjeh);
            }
        }

        db.aktivnost.findAll({ where: { predmetId: id } }).then(function (aktivnosti) {
            if (aktivnosti != null) {
                for (var i = 0; i < aktivnosti.length; i++) {
                    var uspjeh = function (x) {
                        console.log("Uspješno obrisana aktivnost!");
                    }
                    var neuspjeh = function (poruka) {
                        console.log("Došlo je do greške: " + poruka);
                    }
                    db.aktivnost.destroy({ where: { id: aktivnosti[i].id } }).then(function (k) {
                        return new Promise(function (resolve, reject) { resolve(k); });
                    }).then(uspjeh, neuspjeh);
                }
            }

            db.predmet.findOne({ where: { id: id } }).then(function (predmet) {
                if (predmet != null) {
                    var uspjeh = function (x) {
                        res.json({ message: "Uspješno obrisan predmet!" });
                    }
                    var neuspjeh = function (poruka) {
                        console.log("Došlo je do greške: " + poruka);
                    }
                    db.predmet.destroy({ where: { id: id } }).then(function (k) {
                        return new Promise(function (resolve, reject) { resolve(k); });
                    }).then(uspjeh, neuspjeh);

                }

            })

        })

    })

});
app.delete('/v2/dan', function (req, res) {
    let tijelo = req.body;
    var id = tijelo["id"];

    db.aktivnost.findAll({ where: { danId: id } }).then(function (aktivnosti) {
        if (aktivnosti != null) {
            for (var i = 0; i < aktivnosti.length; i++) {
                var uspjeh = function (x) {
                    console.log("Uspješno obrisana aktivnost!");
                }
                var neuspjeh = function (poruka) {
                    console.log("Došlo je do greške: " + poruka);
                }
                db.aktivnost.destroy({ where: { id: aktivnosti[i].id } }).then(function (k) {
                    return new Promise(function (resolve, reject) { resolve(k); });
                }).then(uspjeh, neuspjeh);
            }
        }

        db.dan.findOne({ where: { id: id } }).then(function (dan) {
            if (dan != null) {
                var uspjeh = function (x) {
                    res.json({ message: "Uspješno obrisan dan!" });
                }
                var neuspjeh = function (poruka) {
                    console.log("Došlo je do greške: " + poruka);
                }
                db.dan.destroy({ where: { id: id } }).then(function (k) {
                    return new Promise(function (resolve, reject) { resolve(k); });
                }).then(uspjeh, neuspjeh);

            }

        })

    })

});
app.delete('/v2/tip', function (req, res) {
    let tijelo = req.body;
    var id = tijelo["id"];

    db.aktivnost.findAll({ where: { danId: id } }).then(function (aktivnosti) {
        if (aktivnosti != null) {
            for (var i = 0; i < aktivnosti.length; i++) {
                var uspjeh = function () {
                    console.log("Uspješno obrisana aktivnost!");
                }
                var neuspjeh = function (poruka) {
                    console.log("Došlo je do greške: " + poruka);
                }
                db.aktivnost.destroy({ where: { id: aktivnosti[i].id } }).then(function () {
                    return new Promise(function (resolve, reject) { resolve(); });
                }).then(uspjeh, neuspjeh);
            }
        }

        db.tip.findOne({ where: { id: id } }).then(function (tip) {
            if (tip != null) {
                var uspjeh = function () {
                    res.json({ message: "Uspješno obrisan tip!" });
                }
                var neuspjeh = function (poruka) {
                    console.log("Došlo je do greške: " + poruka);
                }
                db.tip.destroy({ where: { id: id } }).then(function () {
                    return new Promise(function (resolve, reject) { resolve(); });
                }).then(uspjeh, neuspjeh);

            }

        })

    })

});
app.delete('/v2/aktivnost', function (req, res) {
    let tijelo = req.body;
    var id = tijelo["id"];

    db.aktivnost.findOne({ where: { id: id } }).then(function (aktivnost) {
        if (aktivnost != null) {
            var uspjeh = function (x) {
                res.json({ message: "Uspješno obrisana aktivnost!" });
            }
            var neuspjeh = function (poruka) {
                console.log("Došlo je do greške: " + poruka);
            }
            db.aktivnost.destroy({ where: { id: aktivnost.id } }).then(function (k) {
                return new Promise(function (resolve, reject) { resolve(k); });
            }).then(uspjeh, neuspjeh);

        }

    })

});



//Unos Studenata

function upisiStudentaUGrupu(ime, index, nazivGrupe) {
    db.student.findOne({ where: { ime: ime, index: index } }).then(function (student) {
        if (student == null) {
            console.log("Student sa zadanim id-om ne postoji u bazi!");
        } else {
            var studentId = student.id;
            db.grupa.findOne({ where: { naziv: nazivGrupe } }).then(function (grupa) {
                if (grupa == null) {
                    console.log("Grupa sa zadanim id-om ne postoji u bazi!");
                } else {
                    function upisanStudent() {
                        return new Promise(function (resolve, reject) {
                            grupa.getStudenti().then(function (resSet) {
                                var i;
                                for (i = 0; i < resSet.length; i++) {
                                    if (parseInt(resSet[i].id) === parseInt(studentId)) {
                                        resolve();
                                        break;
                                    }
                                }
                                if (i == resSet.length) reject();
                            })
                        });
                    }

                    var uspjeh = function () {
                        console.log("Uspješno upisan student u grupu!");
                    }
                    var neuspjeh = function (poruka) {
                        console.log("Došlo je do greške: " + poruka);
                    }

                    var postojiUBazi = function () {
                        console.log("Student je vec upisanu u ovu grupu, u bazi!");
                    }

                    upisanStudent().then(postojiUBazi,
                        function () {
                            grupa.getStudenti().then(function (resSet) {
                                var studentiGrupe = resSet;
                                studentiGrupe.push(student);
                                grupa.setStudenti(studentiGrupe).then(function (k) {
                                    return new Promise(function (resolve, reject) { resolve(k); });
                                }).then(uspjeh, neuspjeh);
                            })
                        });
                }
            })
        }
    })

}
function upisiStudentaUBazu(ime, index, nazivGrupe) {
    if (!nijeNull(ime)) {
        console.log("Nije validno ime studenta!");
    } else if (!nijeNull(index)) {
        console.log("Nije validan index studenta!");
    } else {
        return (db.student.findOne({ where: { index: index } }).then(function (result) {
            if (result == null) {
                var uspjeh = function (x) {
                    console.log("Uspješno dodan student!");
                    upisiStudentaUGrupu(ime, index, nazivGrupe);
                    return null;
                }
                var neuspjeh = function (poruka) {
                    console.log("Došlo je do greške: " + poruka);
                    return null;
                }
                db.student.create({ ime: ime, index: index }).then(function (k) {
                    return new Promise(function (resolve, reject) { resolve(k); });
                }).then(uspjeh, neuspjeh);
            } else {
                if (result.ime != ime) {
                    var poruka = "Student " + ime + " nije kreiran jer postoji student " + result.ime + " sa istim indexom " + index;
                    return new Promise(function (resolve, reject) { resolve(poruka); });
                }
                upisiStudentaUGrupu(ime, index, nazivGrupe);
                return null;
            }
        }));
    }
}
app.post('/v2/studenteZadatak2/:nazivGrupe', function (req, res) {
    let studenti = req.body;
    var nazivGrupe = req.params["nazivGrupe"];
    var rezultatListaPromisa = [];
    for (var i = 0; i < studenti.length; i++) {
        var ime = studenti[i].ime;
        var index = studenti[i].index;

        rezultatListaPromisa.push(upisiStudentaUBazu(ime, index, nazivGrupe));

    }

    Promise.all(rezultatListaPromisa).then(function (rezultati) {
        var results = [];
        for (var i = 0; i < rezultati.length; i++) {
            if (rezultati[i] != null) results.push(rezultati[i]);
        }
        res.json({ message: results });
    })

});
app.listen(8080);

module.exports = app;
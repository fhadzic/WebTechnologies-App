
//Ucitavanje listi predmeta i aktivnosti

function upisiHtmlPodatak(ul, podatak) {
    let stavka = document.createElement("li");
    ul.appendChild(stavka);
    stavka.innerHTML = podatak;
}


function upisiHtmlAktivnost(aktivnost, dan, tip) {
    var podatak = aktivnost.naziv + "," + tip.naziv + "," + aktivnost.pocetak + "," + aktivnost.kraj + "," + dan.naziv;
    upisiHtmlPodatak(document.getElementById("listaAktivnosti"), podatak);
}

function dohvatiTip(aktivnost, dan) {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            upisiHtmlAktivnost(aktivnost, dan, JSON.parse(req.response));
        }
    }
    req.open("GET", "http://localhost:8080/v2/tip/" + aktivnost.tipId, true);
    req.send();
}

function dohvatiDan(aktivnost) {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            dohvatiTip(aktivnost, JSON.parse(req.response));
        }
    }
    req.open("GET", "http://localhost:8080/v2/dan/" + aktivnost.danId, true);
    req.send();
}

function upisiHtmlListu(lista, ul, listaPred) {
    for (var i = 0; i < lista.length; i++) {
        if (listaPred) {
            upisiHtmlPodatak(ul, lista[i].naziv);
        } else {
            dohvatiDan(lista[i]);
        }
    }
}

function ucitajPredmete() {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            listaPredmeta = JSON.parse(req.response);
            var listaPred = true;
            upisiHtmlListu(listaPredmeta, document.getElementById("listaPredmeta"), listaPred);
        }
    }
    req.open("GET", "http://localhost:8080/v2/predmeti", true);
    req.send();
}

function ucitajAktivnosti() {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            listaAktivnosti = JSON.parse(req.response);
            var listaPred = false;
            upisiHtmlListu(listaAktivnosti, document.getElementById("listaAktivnosti"), listaPred);
        }
    }
    req.open("GET", "http://localhost:8080/v2/aktivnosti", true);
    req.send();
}

//Ucitavanje Dana i Tipova u HTML select

function upisiHtmlSelect(select, podatak) {
    let stavka = document.createElement("option");
    select.appendChild(stavka);
    stavka.innerHTML = podatak;
    stavka.value = podatak;
}

function upisiHtmlDanTip(lista, select) {
    for (var i = 0; i < lista.length; i++) {
        upisiHtmlSelect(select, lista[i].naziv);
    }
}

function ucitajDane() {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            var listaDana = JSON.parse(req.response);
            upisiHtmlDanTip(listaDana, document.getElementById("dan"));
        }
    }
    req.open("GET", "http://localhost:8080/v2/dani", true);
    req.send();
}
function ucitajTipove() {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            var listaTipova = JSON.parse(req.response);
            upisiHtmlDanTip(listaTipova, document.getElementById("tip"));
        }
    }
    req.open("GET", "http://localhost:8080/v2/tipovi", true);
    req.send();
}


var listaPredmeta;
var listaAktivnosti;

window.onload = function () {

    ucitajPredmete();
    ucitajAktivnosti();
    ucitajDane();
    ucitajTipove();

    var naziv = document.getElementById("naziv");
    var tip = document.getElementById("tip");
    var pocetak = document.getElementById("pocetak");
    var kraj = document.getElementById("kraj");
    var dan = document.getElementById("dan");
    

    document.getElementById("posalji").addEventListener("click", function () {
        if (naziv.value != "") {
            let aktivnost = {
                naziv: naziv.value,
                tip: tip.value,
                pocetak: pocetak.value,
                kraj: kraj.value,
                dan: dan.value
            };

            var i = 0;
            for (i = 0; i < listaPredmeta.length; i++) {
                if (listaPredmeta[i].naziv == aktivnost.naziv) break;
            }
            if (i == listaPredmeta.length) upisiPredmet(aktivnost.naziv);

            var predmetUpisan = (i == listaPredmeta.length);
            pripremaDanAkt(aktivnost, predmetUpisan);
        }
    })
}

function upisiPredmet(naziv) {

    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            var jsonRez = JSON.parse(ajax.responseText);
            if (jsonRez['message'] == "Uspješno dodan predmet!") {
                let predmet = {
                    naziv: naziv
                };
                listaPredmeta.push(predmet);
                upisiHtmlPodatak(document.getElementById("listaPredmeta"), predmet.naziv);
            }
        }
    }

    ajax.open("POST", "http://localhost:8080/v2/predmet", true);
    ajax.setRequestHeader("Content-Type", "application/json");
    ajax.send(JSON.stringify({ naziv: naziv }));
}

function pripremaDanAkt(aktivnost, predmetUpisan) {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            pripremaTipAkt(aktivnost, predmetUpisan, JSON.parse(req.response));
        }
    }
    req.open("GET", "http://localhost:8080/v2/danNaziv/" + aktivnost.dan, true);
    req.send();
}

function pripremaTipAkt(aktivnost, predmetUpisan, dan) {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            pripremaPredmetAkt(aktivnost, predmetUpisan, dan, JSON.parse(req.response));
        }
    }
    req.open("GET", "http://localhost:8080/v2/tipNaziv/" + aktivnost.tip, true);
    req.send();
}

function pripremaPredmetAkt(aktivnost, predmetUpisan, dan, tip) {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            upisiAktivnost(aktivnost, predmetUpisan, dan, tip, JSON.parse(req.response));
        }
    }
    req.open("GET", "http://localhost:8080/v2/predmetNaziv/" + aktivnost.naziv, true);
    req.send();
}



function upisiAktivnost(aktivnost, predmetUpisan, dan, tip, predmet) {

    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            var jsonRez = JSON.parse(ajax.responseText);
            if (jsonRez['message'] == "Uspješno dodana aktivnost!") {
                listaAktivnosti.push(aktivnost);
                upisiHtmlAktivnost(aktivnost, dan, tip);
                alert("Uspješno dodavanje aktivnosti!");
            } else if (jsonRez['message'] == "Aktivnost nije validna!" && predmetUpisan) {
                obrisiPredmet(predmet);
            }
        }
    }

    ajax.open("POST", "http://localhost:8080/v2/aktivnost", true);
    ajax.setRequestHeader("Content-Type", "application/json");
    ajax.send(JSON.stringify({ naziv: aktivnost.naziv, tipId: tip.id, pocetak: aktivnost.pocetak, kraj: aktivnost.kraj, danId: dan.id, predmetId: predmet.id, grupaId: null }));

}

function obrisiPredmet(predmet) {
    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            var jsonRez = JSON.parse(ajax.responseText);
            if (jsonRez['message'] == "Uspješno obrisan predmet!") {
                var ulPredmeta = document.getElementById("listaPredmeta");
                ulPredmeta.removeChild(ulPredmeta.lastElementChild);
                listaPredmeta.pop();
            }
        }
    }

    ajax.open("DELETE", "http://localhost:8080/v2/predmet", true);
    ajax.setRequestHeader("Content-Type", "application/json");
    ajax.send(JSON.stringify({ id: predmet.id, naziv: predmet.naziv }));
}
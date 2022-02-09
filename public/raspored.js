//Ucitavanje listi predmeta i aktivnosti

function iscrtajAktivnost(aktivnost, dan, tip) {
    IscrtajModul.dodajAktivnost(okvir, aktivnost.naziv, tip.naziv, aktivnost.pocetak, aktivnost.kraj, dan.naziv);
}


function dohvatiTip(aktivnost, dan) {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            var tip = JSON.parse(req.response);
            iscrtajAktivnost(aktivnost, dan, tip);
        }
    }
    req.open("GET", "http://localhost:8080/v2/tip/" + aktivnost.tipId, true);
    req.send();
}

function dohvatiDan(aktivnost) {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            var dan = JSON.parse(req.response);
            dohvatiTip(aktivnost, dan);
        }
    }
    req.open("GET", "http://localhost:8080/v2/dan/" + aktivnost.danId, true);
    req.send();
}

function ucitajAktivnosti() {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            listaAktivnosti = JSON.parse(req.response);
            for (var i = 0; i < listaAktivnosti.length; i++) {
                dohvatiDan(listaAktivnosti[i]);
            }
        }
    }
    req.open("GET", "http://localhost:8080/v2/aktivnosti", true);
    req.send();
}

//Ucitavanje Dana i Tipova u HTML select

function iscrtajRaspored() {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            var lista = JSON.parse(req.response);
            var listaDana = [];
            for (var i = 0; i < lista.length; i++) {
                listaDana.push(lista[i].naziv);
            }
            okvir = document.getElementById("okvir");
            IscrtajModul.iscrtajRaspored(okvir, listaDana, 8, 21);
        }
    }
    req.open("GET", "http://localhost:8080/v2/dani", true);
    req.send();
}

var listaAktivnosti;
let okvir;

window.onload = function () {
    iscrtajRaspored();
    ucitajAktivnosti();
}
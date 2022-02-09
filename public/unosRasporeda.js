
function upisiHtmlPodatak(ul, podatak) {
    let stavka = document.createElement("li");
    ul.appendChild(stavka);
    stavka.innerHTML = podatak;
}

function upisiHtmlAktivnost(aktivnost) {
    var podatak = aktivnost.naziv + "," + aktivnost.tip + "," + aktivnost.pocetak + "," + aktivnost.kraj + "," + aktivnost.dan;
    upisiHtmlPodatak(document.getElementById("listaAktivnosti"), podatak);
}

function upisiHtmlListu(lista, ul, listaPred) {
    for (var i = 0; i < lista.length; i++) {
        if (listaPred) {
            upisiHtmlPodatak(ul, lista[i].naziv);
        } else {
            upisiHtmlAktivnost(lista[i]);
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
    req.open("GET", "http://localhost:8080/v1/predmeti", true);
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
    req.open("GET", "http://localhost:8080/v1/aktivnosti", true);
    req.send();
}

var listaPredmeta;
var listaAktivnosti;

window.onload = function () {

    ucitajPredmete();
    ucitajAktivnosti();

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
            upisiAktivnost(aktivnost, predmetUpisan);
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

    ajax.open("POST", "http://localhost:8080/v1/predmet", true);
    ajax.setRequestHeader("Content-Type", "application/json");
    ajax.send(JSON.stringify({ naziv: naziv }));
}

function upisiAktivnost(aktivnost, predmetUpisan) {

    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            var jsonRez = JSON.parse(ajax.responseText);
            if (jsonRez['message'] == "Uspješno dodana aktivnost!") {
                listaAktivnosti.push(aktivnost);
                upisiHtmlAktivnost(aktivnost);
                alert("Uspješno doavanje aktivnosti!");
            } else if (jsonRez['message'] == "Aktivnost nije validna!" && predmetUpisan) {
                obrisiPredmet(aktivnost.naziv);
            }
        }
    }

    ajax.open("POST", "http://localhost:8080/v1/aktivnost", true);
    ajax.setRequestHeader("Content-Type", "application/json");
    ajax.send(JSON.stringify({ naziv: aktivnost.naziv, tip: aktivnost.tip, pocetak: aktivnost.pocetak, kraj: aktivnost.kraj, dan: aktivnost.dan }));
}

function obrisiPredmet(naziv) {

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

    ajax.open("DELETE", "http://localhost:8080/v1/predmet/" + naziv, true);
    ajax.setRequestHeader("Content-Type", "application/json");
    ajax.send();
}
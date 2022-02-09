function upisiHtmlSelect(select, podatak) {
    let stavka = document.createElement("option");
    select.appendChild(stavka);
    stavka.innerHTML = podatak;
    stavka.value = podatak;
}

function upisiHtml(lista, select) {
    for (var i = 0; i < lista.length; i++) {
        upisiHtmlSelect(select, lista[i].naziv);
    }
}


function ucitajGrupe() {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            var listaGrupa = JSON.parse(req.response);
            upisiHtml(listaGrupa, document.getElementById("grupe"));
        }
    }
    req.open("GET", "http://localhost:8080/v2/grupe", true);
    req.send();
}

window.onload = function () {

    ucitajGrupe();

    var studenti = document.getElementById("studenti");


    document.getElementById("posalji").addEventListener("click", function () {
        var students = [];
        const redoviTextarea = studenti.value.toString().split(/\r?\n/);

        for (let i = 0; i < redoviTextarea.length; i++) {
            const stavkeStudenta = redoviTextarea[i].split(",");
            if (stavkeStudenta[0] != null && stavkeStudenta[0] != "" && stavkeStudenta[1] != null && stavkeStudenta[1] != "") {
                let student = {
                    ime: stavkeStudenta[0],
                    index: stavkeStudenta[1]
                };
                students.push(student);
            }
        }

        upisiStudenteDB(students);
    })
}



function upisiStudenteDB(studenti) {
    var textarea = document.getElementById("studenti");
    let grupa = document.getElementById("grupe");

    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            var jsonRez = JSON.parse(ajax.responseText);
            var odgovori = jsonRez['message'];
            textarea.value = "";
            for(var i=0; i<odgovori.length; i++){
                textarea.value += (odgovori[i] + "\n");
            }
        }
    }

    ajax.open("POST", "http://localhost:8080/v2/studenteZadatak2/" + grupa.value, true);
    ajax.setRequestHeader("Content-Type", "application/json");
    ajax.send(JSON.stringify(studenti));
}
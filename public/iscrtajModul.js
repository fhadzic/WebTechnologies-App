

var IscrtajModul = (function () {

    const dajRed = function (tblBody) {
        let red = document.createElement("tr");
        tblBody.appendChild(red);
        return red;
    }

    const dajPoljeTH = function (red) {
        let polje = document.createElement("th");
        red.appendChild(polje)
        return polje;
    }

    const dajPoljeTD = function (red) {
        let polje = document.createElement("td");
        red.appendChild(polje)
        return polje;
    }


    const iscrtajRaspored = function (div, dani, satPocetak, satKraj) {

        if (satPocetak >= satKraj || satPocetak < 0 || satPocetak > 23 || satKraj < 1 || satKraj > 24
            || !Number.isInteger(satPocetak) || !Number.isInteger(satKraj) || dani.length == 0) {

            let text = document.createTextNode("Greška");
            div.appendChild(text);
            return;
        }


        var table = document.createElement("table");
        var tblBody = document.createElement("tbody");
        var red = dajRed(tblBody);
        red.setAttribute("id", "sat");
        var vremena = [0, 2, 4, 6, 8, 10, 12, 15, 17, 19, 21, 23];

        let iscrtanoVrijeme = false;
        for (let i = satPocetak; i < satKraj; i++) {
            if (vremena.includes(i)) {
                iscrtanoVrijeme = true;
                break;
            }
        }

        if (!iscrtanoVrijeme) {
            vremena.push(satPocetak);
        } else if (!vremena.includes(satPocetak)) {
            dajPoljeTH(red);
        }

        for (let i = satPocetak; i < satKraj; i++) {
            if (i == 15 && i != satPocetak) {
                dajPoljeTH(red);
            }

            if (vremena.includes(i)) {
                let polje = dajPoljeTH(red);
                polje.setAttribute("colspan", 2);
                let text;
                if (i < 10) {
                    text = document.createTextNode("0" + i + ":00");
                } else {
                    text = document.createTextNode(i + ":00");
                }
                polje.appendChild(text);
            }
            dajPoljeTH(red);
        }

        if (vremena.includes(satKraj)) {
            dajPoljeTH(red);
        }


        for (let i = 0; i < dani.length; i++) {
            red = dajRed(tblBody);
            red.setAttribute("id", dani[i]);
            for (let j = 0; j < (satKraj - satPocetak) * 2; j++) {
                if (j == 0) {
                    let dan = dajPoljeTH(red);
                    let text = document.createTextNode(dani[i]);
                    dan.appendChild(text);
                }
                dajPoljeTD(red);
            }

        }

        table.appendChild(tblBody);
        div.appendChild(table);

    }




    const pocetakRasporeda = function (sat) {
        var dodatak = 0.0;
        for (let cell of sat.cells) {
            let val = cell.innerText;
            if (val != "") {
                return parseInt(val) - dodatak;
            } else {
                dodatak += 0.5;
            }
        }
        return null;
    }

    const krajRasporeda = function (sat) {
        var dodatak = 0.5;
        for (let i = sat.cells.length - 1; i >= 0; i--) {
            let val = sat.cells[i].innerText;
            if (val != "") {
                return parseInt(val) + dodatak;
            } else {
                dodatak += 0.5;
            }
        }
        return null;
    }

    const daLiSePreklapa = function (red, i, brojPolja) {

        const duzinaProvjere = brojPolja + i;
        for (let j = i; j < duzinaProvjere; j++) {
            if (red.cells[j].className == "zauzeto") {
                return true;
            }
        }
        return false;
    }

    const upisiNastavu = function (naziv, tip, red, i, brojPolja) {

        red.cells[i].setAttribute("class", "zauzeto");
        red.cells[i].setAttribute("colspan", brojPolja);
        var textNaziv = document.createTextNode(naziv);
        var textTip = document.createTextNode(tip);
        red.cells[i].appendChild(textNaziv);
        var br = document.createElement("br");
        red.cells[i].appendChild(br);
        red.cells[i].appendChild(textTip);

    }


    const dodajAktivnost = function (raspored, naziv, tip, vrijemePocetak, vrijemeKraj, dan) {

        if (raspored == null || raspored.querySelector("table tbody tr") == null) {
            alert("Greška - raspored nije kreiran");
            return "Greška - raspored nije kreiran";
        }

        if (vrijemePocetak >= vrijemeKraj || vrijemePocetak < 0 || vrijemePocetak > 24 || vrijemeKraj < 0 || vrijemeKraj > 24 ||
            (!Number.isInteger(vrijemePocetak) && vrijemePocetak - Math.trunc(vrijemePocetak) != 0.5) ||
            (!Number.isInteger(vrijemeKraj) && vrijemeKraj - Math.trunc(vrijemeKraj) != 0.5)) {
            alert("Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin");
            return "Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin";
        }

        let sat = raspored.querySelector("table tbody #sat");
        let rasporedPocetak = pocetakRasporeda(sat);
        let rasporedKraj = krajRasporeda(sat);
        let red = raspored.querySelector("table tbody #" + dan);
        if (red == null || vrijemePocetak < rasporedPocetak || vrijemeKraj > rasporedKraj) {
            alert("Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin");
            return "Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin";
        }

        let vrijeme = rasporedPocetak;
        for (let i = 1; i < red.cells.length; i++) {

            if (vrijeme == vrijemePocetak) {
                if (red.cells[i].className == "ravnotezaParnosti") {
                    i++;
                }

                var brojPolja = (vrijemeKraj - vrijemePocetak) * 2;
                if (daLiSePreklapa(red, i, brojPolja)) {
                    alert("Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin");
                    return "Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin";
                }

                var duzinaBrisanja;
                if (brojPolja % 2 == 0) {
                    duzinaBrisanja = brojPolja + i - 1;
                } else {
                    duzinaBrisanja = brojPolja + i;
                }

                for (var j = i + 1; j < duzinaBrisanja; j++) {
                    if (red.cells[i + 1].className != "ravnotezaParnosti") {
                        red.deleteCell(i + 1);
                    }
                }

                upisiNastavu(naziv, tip, red, i, brojPolja);

                if (brojPolja % 2 == 0) {
                    if (vrijemeKraj == rasporedKraj) {
                        red.cells[i].setAttribute("style", "border-right: 1px solid black;");
                    } else if (!Number.isInteger(vrijemePocetak)) {
                        red.cells[i].setAttribute("style", "border-right: 1px dashed black;");
                    }

                    i++;
                    red.cells[i].setAttribute("class", "ravnotezaParnosti");
                }
                return;

            } else if (vrijeme > vrijemePocetak) {
                alert("Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin");
                return "Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin";
            } else {
                if (red.cells[i].className == "ravnotezaParnosti") {
                    continue;
                } else if (red.cells[i].innerText == "") {
                    vrijeme += 0.5;
                } else {
                    vrijeme += ((red.cells[i].colSpan) * 0.5);
                }
            }

        }
    }


    return {
        iscrtajRaspored: iscrtajRaspored,
        dodajAktivnost: dodajAktivnost
    }

}());
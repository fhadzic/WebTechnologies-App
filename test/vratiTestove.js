function vratiTestove(stringTestovi) {
    var redoviDatoteke = stringTestovi.toString().split(/\r?\n/);
    var testovi = [];
    for (var i = 0; i < redoviDatoteke.length; i++) {
        var stavke = redoviDatoteke[i].split(",");
        var operacija = stavke[0];
        var ruta = stavke[1];
        var ulaz = stavke[2];
        var j = 2;
        if (ulaz.startsWith('{')) {
            while (!ulaz.endsWith('}')) {
                j++;
                ulaz += stavke[j];
            }
        }
        ulaz = ulaz.split('\\').join('');
        ulaz = ulaz.split('""').join('","');

        j++;
        var izlaz = stavke[j];
        if (j + 1 < stavke.length) {
            j++;
            while (j != stavke.length) {
                izlaz += stavke[j];
                j++;
            }
        }

        izlaz = izlaz.split('\\').join('');
        izlaz = izlaz.split('""').join('","');
        izlaz = izlaz.split('}{').join('},{');

        let test = {
            operacija: operacija,
            ruta: ruta,
            ulaz: ulaz,
            izlaz: izlaz
        };
        testovi.push(test);

    }

    return testovi;
}
module.exports = vratiTestove;

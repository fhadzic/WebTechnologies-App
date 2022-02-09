window.alert = function () { };
let assert = chai.assert;
describe('IscrtajModul', function () {
  describe('iscrtajRaspored()', function () {
    var okvir = document.getElementById("okvir");

    beforeEach(function () {
      if (okvir.firstChild) {
        okvir.removeChild(okvir.firstChild);
      }
    });

    it('Početak rasporeda mora biti cijeli broj', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8.5, 21);
      assert.equal(okvir.innerHTML, "Greška", "Treba upisati greška u div");
    });

    it('Kraj rasporeda mora biti cijeli broj', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 21.5);
      assert.equal(okvir.innerHTML, "Greška", "Treba upisati greška u div");
    });

    it('Početak i kraj rasporeda ne smiju biti jednaki', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 8);
      assert.equal(okvir.innerHTML, "Greška", "Treba upisati greška u div");
    });

    it('Početak ne smije biti veći od kraja rasporeda', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 7);
      assert.equal(okvir.innerHTML, "Greška", "Treba upisati greška u div");
    });

    it('Kraj rasporeda ne smije biti veći od 24', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 25);
      assert.equal(okvir.innerHTML, "Greška", "Treba upisati greška u div");
    });

    it('Početak rasporeda ne smije biti negativan', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], -1, 21);
      assert.equal(okvir.innerHTML, "Greška", "Treba upisati greška u div");
    });

    it('Niz dana ne smije biti prazan', function () {
      IscrtajModul.iscrtajRaspored(okvir, [], 8, 21);
      assert.equal(okvir.innerHTML, "Greška", "Treba upisati greška u div");
    });

    it('Raspored mora sadržavati vrijeme', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 13, 15);
      let tabele = document.getElementsByTagName("table");
      let tabela = tabele[tabele.length - 1];
      let redovi = tabela.getElementsByTagName("tr");
      let kolone = redovi[0].getElementsByTagName("th");
      let ispravno = false;
      for (let i = 0; i < kolone.length; i++) {
        if (kolone[i].innerHTML.includes("13:00")) {
          ispravno = true;
          break;
        }
      }
      assert.equal(ispravno, true, "Treba upisati početno vrijeme, ako nema ni jedno vrijeme koje se ispisuje.");
    });

    it('Treba iscrtati 6 redova, ako je u nizu pet dana (sat i Ponedjeljak)', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 21);
      let tabele = document.getElementsByTagName("table");
      let tabela = tabele[tabele.length - 1];
      let redovi = tabela.getElementsByTagName("tr");
      assert.equal(redovi.length, 6, "Broj redova treba biti 6");
    });

    it('Treba iscrtati 2 reda, ako je u nizu dana samo Ponedjeljak(sat i Ponedjeljak)', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak"], 8, 21);
      let tabele = document.getElementsByTagName("table");
      let tabela = tabele[tabele.length - 1];
      let redovi = tabela.getElementsByTagName("tr");
      assert.equal(redovi.length, 2, "Broj redova treba biti 2");
    });

    it('Iznad kolona treba prikazati vremena samo za vrijednosti 8,10,12,15,17,19(ne i za 21)', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 21);
      var vremena = ["08:00", "10:00", "12:00", "15:00", "17:00", "19:00"];
      let tabele = document.getElementsByTagName("table");
      let tabela = tabele[tabele.length - 1];
      let redovi = tabela.getElementsByTagName("tr");
      let kolone = redovi[0].getElementsByTagName("th");
      let ispravno = true;
      for (let i = 0; i < kolone.length; i++) {
        if (!vremena.includes(kolone[i].innerHTML) && kolone[i].innerHTML != "") {
          ispravno = false;
          break;
        }
      }
      assert.equal(ispravno, true, "Treba prikazati samo zadate vrijednosti");
    });

    it('07:00 ne treba prikazati kao početno vrijeme u satu', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 7, 16);
      let tabele = document.getElementsByTagName("table");
      let tabela = tabele[tabele.length - 1];
      let redovi = tabela.getElementsByTagName("tr");
      let kolone = redovi[0].getElementsByTagName("th");
      let ispravno = false;
      for (let i = 0; i < kolone.length; i++) {
        if (kolone[i].innerHTML != "07:00" && kolone[i].innerHTML != "") {
          ispravno = true;
          break;
        }
      }
      assert.equal(ispravno, true, "Vremenski prikaz, treba početi od 8h");
    });

    it('Treba iscrtati 2 kolone, ako je vrijeme od 8h do 9h', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 9);
      let tabele = document.getElementsByTagName("table");
      let tabela = tabele[tabele.length - 1];
      let redovi = tabela.getElementsByTagName("tr");
      let kolone = redovi[1].getElementsByTagName("td");
      let brojPrikazanih = 0;
      for (let i = 0; i < kolone.length; i++) {
        let stil = window.getComputedStyle(kolone[i]);
        if (stil.display !== 'none') brojPrikazanih++;
      }
      assert.equal(brojPrikazanih, 2, "Broj prikazanih kolona treba biti 2");
    });

    it('Treba iscrtati 26 kolona, ako je vrijeme od 8h do 21h', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 21);
      let tabele = document.getElementsByTagName("table");
      let tabela = tabele[tabele.length - 1];
      let redovi = tabela.getElementsByTagName("tr");
      let kolone = redovi[1].getElementsByTagName("td");
      let brojPrikazanih = 0;
      for (let i = 0; i < kolone.length; i++) {
        let stil = window.getComputedStyle(kolone[i]);
        if (stil.display !== 'none') brojPrikazanih++;
      }
      assert.equal(brojPrikazanih, 26, "Broj prikazanih kolona treba biti 26");
    });

    it('Treba iscrtati 48 kolona, ako je vrijeme od 0h do 24h', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 0, 24);
      let tabele = document.getElementsByTagName("table");
      let tabela = tabele[tabele.length - 1];
      let redovi = tabela.getElementsByTagName("tr");
      let kolone = redovi[1].getElementsByTagName("td");
      let brojPrikazanih = 0;
      for (let i = 0; i < kolone.length; i++) {
        let stil = window.getComputedStyle(kolone[i]);
        if (stil.display !== 'none') brojPrikazanih++;
      }
      assert.equal(brojPrikazanih, 48, "Broj prikazanih kolona treba biti 48");
    });
  });




  describe('dodajAktivnost()', function () {
    var okvir = document.getElementById("okvir");

    beforeEach(function () {
      if (okvir.firstChild) {
        okvir.removeChild(okvir.firstChild);
      }
    });

    it('Referenca(div) ne smije biti null', function () {
      var ispisAlerta = IscrtajModul.dodajAktivnost(null, "WT", "predavanje", 9, 12, "Ponedjeljak");
      assert.equal(ispisAlerta, "Greška - raspored nije kreiran", "Treba ispisati 'Greška - raspored nije kreiran' u alert-u");
    });

    it('U referenci(div-u) nije iscrtan raspored', function () {
      var ispisAlerta = IscrtajModul.dodajAktivnost(okvir, "WT", "predavanje", 9, 12, "Ponedjeljak");
      assert.equal(ispisAlerta, "Greška - raspored nije kreiran", "Treba ispisati 'Greška - raspored nije kreiran' u alert-u");
    });

    it('Početak i kraj aktivnosti ne smiju biti jednaki', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 21);
      var ispisAlerta = IscrtajModul.dodajAktivnost(okvir, "WT", "predavanje", 9, 9, "Ponedjeljak");
      assert.equal(ispisAlerta, "Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin", "Treba ispisati 'Greška - ...' u alert-u");
    });

    it('Početak aktivnosti mora biti cijeli broj ili cijeli broj + 0.5', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 21);
      var ispisAlerta = IscrtajModul.dodajAktivnost(okvir, "WT", "vježbe", 9.3, 10, "Ponedjeljak");
      assert.equal(ispisAlerta, "Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin", "Treba ispisati 'Greška - ...' u alert-u");
    });

    it('Kraj aktivnosti mora biti cijeli broj ili cijeli broj + 0.5', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 21);
      var ispisAlerta = IscrtajModul.dodajAktivnost(okvir, "WT", "vježbe", 9, 10.3, "Ponedjeljak");
      assert.equal(ispisAlerta, "Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin", "Treba ispisati 'Greška - ...' u alert-u");
    });

    it('Početak ne smije biti jednak kraju aktivnoti', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 21);
      var ispisAlerta = IscrtajModul.dodajAktivnost(okvir, "WT", "predavanje", 9, 9, "Ponedjeljak");
      assert.equal(ispisAlerta, "Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin", "Treba ispisati 'Greška - ...' u alert-u");
    });

    it('Početak aktivnosti ne smije biti manji od početka rasporeda', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 21);
      var ispisAlerta = IscrtajModul.dodajAktivnost(okvir, "WT", "vježbe", 7, 8.5, "Ponedjeljak");
      assert.equal(ispisAlerta, "Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin", "Treba ispisati 'Greška - ...' u alert-u");
    });

    it('Kraj aktivnosti ne smije biti veći od početka rasporeda', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 21);
      var ispisAlerta = IscrtajModul.dodajAktivnost(okvir, "WT", "vježbe", 20, 21.5, "Ponedjeljak");
      assert.equal(ispisAlerta, "Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin", "Treba ispisati 'Greška - ...' u alert-u");
    });

    it('Kraj aktivnosti ne smije biti veći od početka rasporeda', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 21);
      var ispisAlerta = IscrtajModul.dodajAktivnost(okvir, "WT", "predavanje", 20, 21.5, "Ponedjeljak");
      assert.equal(ispisAlerta, "Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin", "Treba ispisati 'Greška - ...' u alert-u");
    });

    it('Aktivnost koja se dodaje ne smije se djelimicno preklapati sa drugim aktivnostima', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 21);
      var ispisAlerta = IscrtajModul.dodajAktivnost(okvir, "WT", "predavanje", 9, 12, "Srijeda");
      var ispisAlerta = IscrtajModul.dodajAktivnost(okvir, "WT", "predavanje", 11, 12.5, "Srijeda");
      assert.equal(ispisAlerta, "Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin", "Treba ispisati 'Greška - ...' u alert-u");
    });

    it('Aktivnost koja se dodaje ne smije se preklapati sa drugim aktivnostima', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 21);
      var ispisAlerta = IscrtajModul.dodajAktivnost(okvir, "WT", "predavanje", 9, 12, "Srijeda");
      var ispisAlerta = IscrtajModul.dodajAktivnost(okvir, "WT", "predavanje", 10, 11.5, "Srijeda");
      assert.equal(ispisAlerta, "Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin", "Treba ispisati 'Greška - ...' u alert-u");
    });



    it('Treba upisati Wt predavanje u 3. kolonu rasporeda', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 21);
      IscrtajModul.dodajAktivnost(okvir, "WT", "predavanje", 9, 12, "Ponedjeljak");
      let tabele = document.getElementsByTagName("table");
      let tabela = tabele[tabele.length - 1];
      let redovi = tabela.getElementsByTagName("tr");
      let kolone = redovi[1].getElementsByTagName("td");
      let ispravno = true;
      if (!(kolone[2].innerHTML.includes("WT") && kolone[2].innerHTML.includes("predavanje"))) {
        ispravno = false;
      }
      assert.equal(ispravno, true, "Treba prikazati u redu Ponedjeljak, WT predavanje od 9 do 12");
    });

    it('Treba upisati Wt vježbe u 4. kolonu rasporeda', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 23);
      IscrtajModul.dodajAktivnost(okvir, "WT", "vježbe", 12, 13.5, "Ponedjeljak");
      let tabele = document.getElementsByTagName("table");
      let tabela = tabele[tabele.length - 1];
      let redovi = tabela.getElementsByTagName("tr");
      let kolone = redovi[1].getElementsByTagName("td");

      let ispravno = true;
      if (!(kolone[8].innerHTML.includes("WT") && kolone[8].innerHTML.includes("vježbe"))) {
        ispravno = false;
      }
      assert.equal(ispravno, true, "Treba prikazati u redu Ponedjeljak, WT vježbe od 12 do 13:30");
    });

    it('Treba upisati RMA predavanje u posljednju kolonu rasporeda', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 16);
      IscrtajModul.dodajAktivnost(okvir, "RMA", "predavanje", 13, 16, "Petak");
      let tabele = document.getElementsByTagName("table");
      let tabela = tabele[tabele.length - 1];
      let redovi = tabela.getElementsByTagName("tr");
      let kolone = redovi[5].getElementsByTagName("td");

      let ispravno = true;
      if (!(kolone[10].innerHTML.includes("RMA") && kolone[10].innerHTML.includes("predavanje"))) {
        ispravno = false;
      }
      assert.equal(ispravno, true, "Treba prikazati u redu Petak, RMA predavanje od 13 do 16:00");
    });

    it('Treba upisati jednosatno VVS predavanje u 4. kolonu rasporeda', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 16);
      IscrtajModul.dodajAktivnost(okvir, "VVS", "P", 12, 13, "Četvrtak");
      let tabele = document.getElementsByTagName("table");
      let tabela = tabele[tabele.length - 1];
      let redovi = tabela.getElementsByTagName("tr");
      let kolone = redovi[4].getElementsByTagName("td");

      let ispravno = true;
      if (!(kolone[8].innerHTML.includes("VVS") && kolone[8].innerHTML.includes("P"))) {
        ispravno = false;
      }
      assert.equal(ispravno, true, "Treba prikazati u redu Četvrtak, VVS predavanje od 12 do 13:00");
    });

    it('Upisuje aktivnost u dvo-satni raspored', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 13, 15);
      IscrtajModul.dodajAktivnost(okvir, "DM", "tutorijal", 13, 15, "Četvrtak");
      let tabele = document.getElementsByTagName("table");
      let tabela = tabele[tabele.length - 1];
      let redovi = tabela.getElementsByTagName("tr");
      let kolone = redovi[4].getElementsByTagName("td");

      let ispravno = false;
      if (kolone[0].innerHTML.includes("DM") && kolone[0].innerHTML.includes("tutorijal")) {
        ispravno = true;
      }
      assert.equal(ispravno, true, "Treba upisati Dm tut, u cijeli red aktivnosti.");
    });

    it('Treba upisati 3.5 sati DM predavanja u 5. kolonu rasporeda', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 0, 24);
      IscrtajModul.dodajAktivnost(okvir, "DM", "predavanje", 9, 12.5, "Petak");
      let tabele = document.getElementsByTagName("table");
      let tabela = tabele[tabele.length - 1];
      let redovi = tabela.getElementsByTagName("tr");
      let kolone = redovi[5].getElementsByTagName("td");

      let ispravno = true;
      if (!(kolone[18].innerHTML.includes("DM") && kolone[18].innerHTML.includes("predavanje"))) {
        ispravno = false;
      }
      assert.equal(ispravno, true, "Treba prikazati u redu Petak, DM predavanje od 9 do 12:30");
    });

    it('Treba popuniti Utorak aktivnostima', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 16);
      IscrtajModul.dodajAktivnost(okvir, "DM", "tutorijal", 8, 10, "Utorak");
      IscrtajModul.dodajAktivnost(okvir, "OIS", "vježbe", 10, 11.5, "Utorak");
      IscrtajModul.dodajAktivnost(okvir, "RMA", "vježbe", 11.5, 13, "Utorak");
      IscrtajModul.dodajAktivnost(okvir, "WT", "predavanje", 13, 16, "Utorak");
      let tabele = document.getElementsByTagName("table");
      let tabela = tabele[tabele.length - 1];
      let redovi = tabela.getElementsByTagName("tr");
      let kolone = redovi[2].getElementsByTagName("td");

      let aktivnosti = ["WT", "RMA", "OIS", "DM"];
      for (let i = 0; i < kolone.length; i++) {
        if (kolone[i].innerHTML.includes("DM") || kolone[i].innerHTML.includes("OIS")
          || kolone[i].innerHTML.includes("RMA") || kolone[i].innerHTML.includes("WT")) {
          aktivnosti.pop();
        }
      }
      assert.equal(aktivnosti.length, 0, "Treba prikazati sve aktivnosti redu Utorak");
    });

    it('Treba upisati OOI predavanje u prvu kolonu rasporeda', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 7, 21);
      IscrtajModul.dodajAktivnost(okvir, "OOI", "predavanje", 7, 10, "Petak");
      let tabele = document.getElementsByTagName("table");
      let tabela = tabele[tabele.length - 1];
      let redovi = tabela.getElementsByTagName("tr");
      let kolone = redovi[5].getElementsByTagName("td");

      let ispravno = true;
      if (!(kolone[0].innerHTML.includes("OOI") && kolone[0].innerHTML.includes("predavanje"))) {
        ispravno = false;
      }
      assert.equal(ispravno, true, "Treba prikazati u redu Petak, OOI predavanje od 07:00 do 10:00");
    });

    it('Treba ispravno upisati prvo aktivnost koja se poslije događa', function () {
      IscrtajModul.iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 7, 21);
      IscrtajModul.dodajAktivnost(okvir, "OOI", "tutorijal", 19, 21, "Petak");
      IscrtajModul.dodajAktivnost(okvir, "DM", "predavanje", 15, 18, "Petak");
      let tabele = document.getElementsByTagName("table");
      let tabela = tabele[tabele.length - 1];
      let redovi = tabela.getElementsByTagName("tr");
      let kolone = redovi[5].getElementsByTagName("td");

      let ispravno = false;
      let i = 16;
      if (kolone[i].innerHTML.includes("DM") && kolone[i].innerHTML.includes("predavanje")) {
        i++;
        var brojSlobodnih = 0;
        for (let j = i; j < kolone.length; j++) {
          let stil = window.getComputedStyle(kolone[j]);
          if (stil.display !== 'none' && kolone[j].innerHTML == "") {
            brojSlobodnih++;
          } else if (stil.display !== 'none' && kolone[j].innerHTML.includes("OOI")) {
            ispravno = true;
            break;
          }
        }
      }
      if (!(ispravno && brojSlobodnih == 2)) {
        ispravno = false;
      }
      assert.equal(ispravno, true, "Treba prikazati DM od 15 do 18 i OOI od 19 do 21");
    });

  });

});

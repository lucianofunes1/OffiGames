import { arrPaises } from "./paises.js";

window.onload = () => generaArrayPaises(arrPaises);

function generaArrayPaises(data){
    arrPaises = data;

    let listPaises = document.querySelector('ion-list');
    let tempHTML = "";

    for(i=0;i<arrPaises.length;i++){
        tempHTML = tempHTML + "<ion-item button onclick='validarRespuesta(&apos;"+ arrPaises[i].id +"&apos;)'>"+ arrPaises[i].pais +"</ion-item>"
    }

    listPaises.innerHTML = tempHTML;

    const searchbar = document.querySelector('ion-searchbar');
    const items = Array.from(document.querySelector('ion-list').children);

    searchbar.addEventListener('ionInput', handleInput);

    function handleInput(event) {
        const query = event.target.value.toLowerCase();
        requestAnimationFrame(() => {
            items.forEach((item) => {
                const shouldShow = item.textContent.toLowerCase().indexOf(query) > -1;
                item.style.display = shouldShow ? 'block' : 'none';
            });
        });
    }

    cargaPais();
}

var PaisActual;
var PaisesYaJugados = [];
var Pistas = [{"id": "0","pista": "Continente"},{"id": "1","pista": "Capital"}];
var PistasUsadas = [];
var Errores = 0;
var Ocultadores = [];
var PaisesYaElegidos = [];

function cargaPais(){
    do{
        var paisSeleccionado = Math.floor(Math.random() * arrPaises.length);
        let pais = arrPaises[paisSeleccionado];
        document.getElementById("flag-img").src = "./assets/"+ pais.codigo.toUpperCase()  +".png";
        PaisActual = arrPaises[paisSeleccionado];
        Ocultadores = [{"id":"1"},{"id":"2"},{"id":"3"},{"id":"4"},{"id":"5"},{"id":"6"}];
        Ocultadores = Ocultadores.sort(function() {return Math.random() - 0.5});
    } while(PaisesYaJugados.includes(paisSeleccionado) === true);
}

function validarRespuesta(idRespuesta){
    if(PaisesYaElegidos.includes(idRespuesta)){
        //alert("Ya lo elegiste Tarado");
    } else{
    if(idRespuesta === PaisActual.id){
        AlertaFinNivel(1)
        PaisesYaJugados.push(Number(idRespuesta));
        Errores = 0;
        let lista = document.getElementById("distancias");
        lista.innerHTML = "";
        PistasUsadas = [];
        cargaPais();
        PaisesYaElegidos = [];
        for(i=1;i<7;i++){
            document.getElementById("ocultador"+i).style.visibility = "";
        }
    } else{
        if(Errores == 6){
            AlertaFinNivel(0)
            Errores = 0;
            let lista = document.getElementById("distancias");
            lista.innerHTML = "";
            PistasUsadas = [];
            for(i=1;i<7;i++){
                document.getElementById("ocultador"+i).style.visibility = "";
            }
            PaisesYaElegidos = [];
            cargaPais();
        }
        else{
            Errores += 1
            desbloquearOcultador();
            medirDistancia(idRespuesta);
            PaisesYaElegidos.push(idRespuesta);
        }
    }
    }
}

function desbloquearOcultador(){
    for(i=0;i<1;i++){
        document.getElementById("ocultador"+Ocultadores[i].id).style.visibility = "hidden";
        Ocultadores.splice(i,1)
    }
}

async function AlertaFinNivel(tipo) {
    const alert = document.createElement('ion-alert');
    if(tipo == 0){
        alert.header = 'Mal';
        alert.message = "No has adivinado el pais era "+ PaisActual.pais +", puedes seguir jugando";
    }
    if(tipo == 1){
        alert.header = 'Bien';
        alert.subHeader = 'Correcto 🥳🎊';
        alert.message = "Has adivinado el pais";
    }
    alert.buttons = ['OK'];

    document.body.appendChild(alert);
    await alert.present();
}

async function AlertaPista(tipo) {
    const alert = document.createElement('ion-alert');
    alert.header = 'Pista';
    if(tipo == 0){
        alert.subHeader = 'El Pais Pertenece al Continente:';
        alert.message = PaisActual.continente;
    }
    if(tipo == 1){
        alert.subHeader = 'La Capital del Pais es:';
        alert.message = PaisActual.capital;
    }
    alert.buttons = ['OK'];

    document.body.appendChild(alert);
    await alert.present();
}

function verPista(){
    do{
        var pistaSeleccionado = Math.floor(Math.random() * Pistas.length);
        let pista = Pistas[pistaSeleccionado];

        PistasUsadas.push(pista.id)
        AlertaPista(pista.id)
    } while(PistasUsadas.includes(pistaSeleccionado) === true);
}

function httpApiOpenStreetMap(pais) {
    var URL = "https://nominatim.openstreetmap.org/search.php?country="+ pais +"&format=jsonv2";
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", URL, false ); 
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function medirDistancia(paisElegido){
    let paisSeleccionado = JSON.parse(httpApiOpenStreetMap(arrPaises[paisElegido].pais))[0];
    let paisOculto = JSON.parse(httpApiOpenStreetMap(PaisActual.pais))[0];

    let lista = document.getElementById("distancias")

    let vLat;
    let vLon;

    if(paisSeleccionado.lat > paisOculto.lat){
        vLat = "Sur";
    } else{
        vLat = "Nor";
    }

    if(paisSeleccionado.lon > paisOculto.lon){
        vLon = "Este";
    } else{
        vLon = "Oeste";
    }

    lista.innerHTML = "<ion-item><ion-avatar slot='start'><img src='./assets/"+ arrPaises[paisElegido].codigo +".png'/></ion-avatar><ion-label><h2>"+ arrPaises[paisElegido].pais +"</h2><h3>A "+ MedirDistancia(paisSeleccionado.lat, paisSeleccionado.lon, paisOculto.lat, paisOculto.lon) +" Km de Distancia al "+ vLat +" "+ vLon +"</h3></ion-label></ion-item>" + lista.innerHTML;
}

function MedirDistancia(lat1, lon1, lat2, lon2) {
    rad = function (x) {
        return x * Math.PI / 180;
    }
    var R = 6378.137;
    var dLat = rad(lat2 - lat1);
    var dLong = rad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d.toFixed(0);
}

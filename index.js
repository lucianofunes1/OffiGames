var usuarioG;
async function alerta(cabecera,mensaje) {
    const alert = await alertController.create({
        header: cabecera,
        message: mensaje,
        buttons: ['Aceptar']
    });

    await alert.present();
}

let currentModal = null;

async function createModal(idModal){
    const modal = await modalController.create({
        component: 'modal-'+idModal
    });

    await modal.present();
    currentModal = modal;
}

function dismissModal(){
    if (currentModal) {
        currentModal.dismiss().then(() => { currentModal = null; });
    }
}

window.onload = function(){
    if(navigator.onLine != true) {
        alert("Debes Conectarte a Internet Para Utilizar la Aplicacion");
        window.close();
    }
}

function httpGetUsuarios(user) {
    var URL = "https://api-db.repongoya.com/get-usuarios";
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", URL, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

var usuarios = JSON.parse(httpGetUsuarios());

function validarPassword(user,password){
    let usuarioExiste;

    for (var objUsuario of usuarios) {
        if(objUsuario.usuario == user){
            usuarioExiste = true;
            if(objUsuario.modificar_password == 0){
                if(btoa(btoa(btoa(password))) === objUsuario.password){
                    window.location.href = "./app/index.html?tipousuario="+objUsuario.admin;
                } else{
                    alerta("Contraseña Incorrecta","Intente nuevamente o contacte al administrador");
                }
            } else{
                usuarioG = user;
                createModal("modificar_password");
            }
        }
    }

    if(!usuarioExiste){
        alerta("Usuario Incorrecto","Intente nuevamente o contacte al administrador");
    }
}

customElements.define('modal-modificar_password', class ModalContent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <ion-header translucent>
            <ion-toolbar>
                <ion-title><strong>Recuperar Contraseña</strong></ion-title>
                <ion-buttons slot="end">
                    <ion-button onclick="dismissModal()"><ion-icon name="close-circle-outline" color="danger"></ion-icon></ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content fullscreen>
            <ion-grid>
                <ion-row>
                    <ion-col>
                    </ion-col>
                    <ion-col>
                        <img src="./logo.png" />
                        <ion-list lines="full" class="ion-no-margin">
                            <ion-item>
                                <ion-label position="floating">Nueva Contraseña</ion-label>
                                <ion-input id="pass" placeholder="Introduzca la Nueva Contraseña" type="password"></ion-input>
                            </ion-item>
                            <BR>
                            <ion-item>
                                <ion-label position="floating">Repita la Contraseña</ion-label>
                                <ion-input id="repeatpass" placeholder="Repita la Contraseña" type="password" onkeypress="if(event.key === 'Enter') {modificarPassword()}"></ion-input>
                            </ion-item>
                            <BR>
                            <BR>
                            <section>
                                <ion-button onclick="modificarPassword()" expand="block">ACEPTAR</ion-button>
                            </section>
                        </ion-list>
                    </ion-col>
                    <ion-col>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
      `;
    }
});

//Contraseña Segura
function seguridad_clave(clave){
    var seguridad = 0;
    if (clave.length!=0){
       if (tiene_numeros(clave) && tiene_letras(clave)){
          seguridad += 30;
       }
       if (tiene_minusculas(clave) && tiene_mayusculas(clave)){
          seguridad += 30;
       }
       if (clave.length >= 4 && clave.length <= 5){
          seguridad += 10;
       }else{
          if (clave.length >= 6 && clave.length <= 8){
             seguridad += 30;
          }else{
             if (clave.length > 8){
                seguridad += 40;
             }
          }
       }
    }
    return seguridad

}

var numeros="0123456789";

function tiene_numeros(texto){
    for(i=0; i<texto.length; i++){
       if (numeros.indexOf(texto.charAt(i),0)!=-1){
          return 1;
       }
    }
    return 0;
}

var letras="abcdefghyjklmnñopqrstuvwxyz";

function tiene_letras(texto){
    texto = texto.toLowerCase();
    for(i=0; i<texto.length; i++){
       if (letras.indexOf(texto.charAt(i),0)!=-1){
          return 1;
       }
    }
    return 0;
}

function tiene_minusculas(texto){
    for(i=0; i<texto.length; i++){
       if (letras.indexOf(texto.charAt(i),0)!=-1){
          return 1;
       }
    }
    return 0;
}

var letras_mayusculas="ABCDEFGHYJKLMNÑOPQRSTUVWXYZ";

function tiene_mayusculas(texto){
    for(i=0; i<texto.length; i++){
       if (letras_mayusculas.indexOf(texto.charAt(i),0)!=-1){
          return 1;
       }
    }
    return 0;
}
//Contraseña Segura

function httpUpdatePassword(password) {
    var URL = "https://api-db.repongoya.com/update-password/"+usuarioG+"/"+ password;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", URL, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function modificarPassword(){
    var password = document.getElementById("pass").value;
    var repeatpassword = document.getElementById("repeatpass").value;

    
    if(repeatpassword === password){
        console.log(seguridad_clave(password));
        if(seguridad_clave(password) == 100){
            httpUpdatePassword(btoa(btoa(btoa(password))));
            alerta("Contraseña Modificada","Inicie sesion con su nueva contraseña");
            usuarios = JSON.parse(httpGetUsuarios());
            dismissModal();
        } else{
            alerta("Contraseña Insegura","Su contraseña no cumple las politicas de seguridad, utilice una que cumpla los siguientes requisitos: -Minuscula -Mayuscula -Numero -Mas de 8 Caracteres");
        }
    } else{
        alerta("Error","Las Contraseñas No Coinciden");
    }
}
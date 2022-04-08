const express = require('express');
const app = express();
const cors = require('cors');
const axios = require("axios");
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const  {request, response}  = require('express');

app.use(express.json());
var mediosPago;
var retornoPse;
var datosRecibidos;
var jsonRespuesta;

var jsonSolicitud = new Object();
jsonSolicitud.transaction_amount=0;
jsonSolicitud.description='';
var payer = new Object();
var identification= new Object();
identification.type='';
identification.number='';
payer.email='';
payer.identification=identification;
payer.entity_type='';
jsonSolicitud.payer = payer;
var additional_info = new Object();
additional_info.ip_address='';
jsonSolicitud.additional_info=additional_info;
jsonSolicitud.callback_url='';
jsonSolicitud.payment_method_id='';
var transaction_details= new Object();
transaction_details.financial_institution='';
jsonSolicitud.transaction_details=transaction_details;


app.listen( 4000, ()=>{
    console.log("Servidor corriendo en el puerto 4000")
} )

const allowedOrigins = ['http://localhost:3000','http://localhost:3001',"http://localhost:3001/recargaCelular"];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }

}));

 function generarJson(codigo){
  jsonSolicitud.transaction_amount=5000;
  jsonSolicitud.description='recarga Celular';
  payer.email=datosRecibidos.email;
  identification.type=datosRecibidos.tipoDocumento;
  identification.number=datosRecibidos.numeroDocumento;
  payer.identification=identification;
  payer.entity_type='individual';
  additional_info.ip_address='127.0.0.1';
  jsonSolicitud.additional_info=additional_info;
  jsonSolicitud.callback_url='http://www.google.com'
  jsonSolicitud.payment_method_id='pse';
  transaction_details.financial_institution=codigo;
  jsonSolicitud.transaction_details=transaction_details;
  postParaPago(jsonSolicitud);
}

//'https://api.mercadopago.com/v1/payments?access_token=TEST-5798738620963583-040404-32f529ba7830c8be48f00e811acb8c4e-1100964063'

 function  postParaPago(dato){
  
  console.log("jsonSolicitud: "+JSON.stringify(dato));
const options ={
  method: 'POST',
  // mode: 'cors',
  body: JSON.stringify(dato),
  headers: { 'Content-Type': 'application/json',
'Accept':'application/json',
'Authorization':'Bearer TEST-2326534822916279-040816-cfc06b1b8ab61ab499dad0bff04a3717-1103716164' },
}

fetch('https://api.mercadopago.com/v1/payments',options)
.then(response=>response.json())
.then(data=>{
  if (data.status===500){
    console.log("Error en data")
  }else{
jsonRespuesta= data.transaction_details.external_resource_url;
console.log(jsonRespuesta);
}
})
console.log("URL: "+jsonRespuesta);

}

 function extraerCodigo(metodoPago){
  for(const id in retornoPse){
    if(retornoPse[id].description ===metodoPago){
       var codigoPago = retornoPse[id].id
       console.log("Codigo: "+codigoPago)
    }
  }
  generarJson(codigoPago);
}

axios.get('https://api.mercadopago.com/v1/payment_methods?access_token=TEST-5322682574487620-082515-0356b167f749a2797fb93719bebef909-813136202').then((response)=>{
  mediosPago = response.data;
  for (const id in mediosPago){
   if(mediosPago[id].id =='pse'){
     var mediosPse = mediosPago[id].financial_institutions;
     retornoPse=mediosPse
   }
  }
})

app.post('/api/datos',async (request, response)=>{
   datosRecibidos =  request.body;
   if(datosRecibidos.medioPago==='Pse'){
    response.json({
        bancos: retornoPse
    })
  }else if(datosRecibidos.medioPago==='NEQUI'){

extraerCodigo(datosRecibidos.medioPago);
    const promise = new Promise((resolve, reject) => {
      setTimeout(
        ()=>jsonRespuesta!=undefined
        ?resolve(jsonRespuesta)
        :reject(new Error('undefined')),
        5000
      );
    });
    promise.then(jsonRespuesta=>response.json({
      URL: jsonRespuesta
  }))
    .catch(error => console.error(error)); 

  }else if(datosRecibidos.medioPago==='DaviPlata'){
    extraerCodigo(datosRecibidos.medioPago);
    const promise = new Promise((resolve, reject) => {
      setTimeout(
        ()=>jsonRespuesta!=undefined
        ?resolve(jsonRespuesta)
        :reject(new Error('undefined')),
        5000
      );
    });
    promise.then(jsonRespuesta=>response.json({
      URL: jsonRespuesta
  }))
    .catch(error => console.error(error)); 
  }else{
    response.json({
      bancos: retornoPse
  })
  }  
})



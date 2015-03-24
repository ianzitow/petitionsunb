Signatures = new Mongo.Collection("signatures");
Errors = new Mongo.Collection(null);
Successes = new Mongo.Collection(null);

if (Meteor.isClient) {
  Meteor.subscribe("signatures");
  Meteor.subscribe("total");

  Template.errors.helpers({
    errors: function() {
      return Errors.find();
    }
  });

  Template.body.helpers({
    signatures: function () {
      return Signatures.find({tipo: "semaforoicc"}, {limit: 20, sort: { createdAt: -1}});
    },
    counter: function () {
      return Signatures.find({tipo: "semaforoicc"}).count();
    },
    totalCount: function () {
      return Counts.get('totalCount');
    }
  });

  Template.sign.events({
    'submit .new-signature': function(event) {
      var matricula = event.target.inputMatricula.value;
      var senha = event.target.inputSenha.value;

      Meteor.call('callUnbMeApiCheck', matricula, senha, function(error, result) {
        if(result.data.result == 1){

          Meteor.call('addSignature', result);

        } else {
          Meteor.call('throwMessage', "Erro com suas credenciais!", 0);
        }
      });

      return false;
    }
  });

  UI.registerHelper('shortIt', function(str, max) {
    return str.substring(0, max) + '***';
  });

  UI.registerHelper('divideUp', function(number) {
    return number/10;
  });

  UI.registerHelper('timeAgo', function(date) {
    moment.locale('pt', {
      relativeTime : {
        future: "em %s",
        past:   "%s atrás",
        s:  "segundos",
        m:  "um minuto",
        mm: "%d minutos",
        h:  "uma hora",
        hh: "%d horas",
        d:  "um dia",
        dd: "%d dias",
        M:  "um mês",
        MM: "%d meses",
        y:  "um ano",
        yy: "%d anos"
      }
    });

    return moment(date).fromNow();
  })
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup

  });
  Meteor.publish("signatures", function () {
    return Signatures.find({tipo: "semaforoicc"}, {limit: 20, sort: { createdAt: -1}});
  });
  Meteor.publish('total', function() {
    Counts.publish(this, 'totalCount', Signatures.find());
  });
}

Meteor.methods({
    throwMessage: function(message, kind) {
      if(kind == 0) {
        Errors.insert({message: message});
      } else {
        Successes.insert({message: message});
      }
    },
    callUnbMeApiCheck: function(matricula, senha) {
      return HTTP.call('POST' ,'https://www.unb.me/api/check', {
        params: {
          inputMatricula: matricula,
          inputSenha: senha}
      });
    },
    addSignature: function(result) {
      if(result.data.result == 0) {
        throw new Meteor.Error("not-authorized");
      }

      Signatures.insert({
            _id: result.data.matricula,
            nome: result.data.nome,
            curso: result.data.curso,
            tipo: "semaforoicc",
            createdAt: new Date()
          },
          function (error, result) {
            if(!error) {
              Meteor.call('throwMessage', "Você assinou com sucesso!", 1);
            } else {
              Meteor.call('throwMessage', "Opa, você já assinou!", 0);
            }
          });
    }
});

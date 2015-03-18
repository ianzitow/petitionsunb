if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });

  Template.sign.events({
    'submit .new-signature': function(event) {
      var matricula = event.target.inputMatricula.value;
      var senha = event.target.inputSenha.value;

      Meteor.call('callUnbMeApiCheck', matricula, senha, function(error, result) {
        console.log(result);
      });

      //$.post('https://www.unb.me/api/check', {inputMatricula: matricula, inputSenha: senha}, function(data) {
      //  console.log(data);
      //});

      return false;
    }
  })
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    Meteor.methods({
      callUnbMeApiCheck: function(matricula, senha) {
        return HTTP.call('POST' ,'https://www.unb.me/api/check', {
          params: {
            inputMatricula: matricula,
            inputSenha: senha}
        });
      }
    });
  });

}
